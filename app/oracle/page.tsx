"use client"

import { useState, useEffect, useRef } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { InkRevealText } from "@/components/ink-reveal-text"
import { MessageRenderer } from "@/components/message-renderer"
import { OracleInteractiveEye } from "@/components/oracle-interactive-eye"
import { OracleThinking } from "@/components/oracle-thinking"
import { StoneUnified } from "@/components/stone-unified"
import { FunctionButtons } from "@/components/function-buttons"
import { detectIntent } from "@/lib/intent-detection"
import { generateDeepInterpretation, type ConversationState } from "@/lib/oracle-conversation"
import type { Message, TextMessage, ChoiceMessage, FunctionResultMessage, SystemMessage } from "@/lib/oracle-types"
import type { StoneResult } from "@/lib/oracle-types"

const initialMessages: Message[] = [
  {
    id: 1,
    type: "text",
    content:
      "I sense your presence. I can see your star chart shows Mars in retrograde, and you recently chose to follow the stone's guidance. Tell me what weighs on your heart.",
    isUser: false,
    contextHint: "Context-aware",
    timestamp: "Just now",
  },
]

export default function OraclePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [eyeDirection, setEyeDirection] = useState<"down" | "down-right" | "down-left" | "center">("center")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [conversationState, setConversationState] = useState<ConversationState>("normal")
  const [userQuestion, setUserQuestion] = useState<string>("")
  const [stoneResult, setStoneResult] = useState<StoneResult | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<"stone" | "tarot" | "echo" | null>(null)
  const eyeTimerRef = useRef<NodeJS.Timeout>()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messageIdCounterRef = useRef<number>(1000) // 从1000开始，避免与初始消息ID冲突

  // 根据输入框焦点状态改变眼睛方向
  useEffect(() => {
    if (isInputFocused) {
      setEyeDirection("down")
    } else {
      setEyeDirection("center")
    }
  }, [isInputFocused])

  // 生成唯一消息ID（避免hydration mismatch）
  const generateMessageId = () => {
    messageIdCounterRef.current += 1
    return messageIdCounterRef.current
  }

  // 处理石头完成
  const handleStoneComplete = (result: StoneResult) => {
    // 立即停止可能的重复触发
    if (conversationState === "stone_completed") return
    
    setStoneResult(result)
    setConversationState("stone_completed")
    
    // 清空当前输入，防止干扰
    setInput("")
    
    // 创建一个系统消息插入到对话流中
    const systemEvent: SystemMessage = {
      id: generateMessageId(),
      type: "system",
      content: `你刚刚通过石头获得答案：${result.result}`,
      isUser: false,
      timestamp: "Just now",
    }
    
    setMessages((prev) => [...prev, systemEvent])
    
    // 延迟显示Oracle的深度解读
    setTimeout(() => {
      const interpretation = generateDeepInterpretation(result, userQuestion)
      const interpretationMessage: FunctionResultMessage = {
        id: generateMessageId(),
        type: "function-result",
        functionName: "stone",
        result,
        isUser: false,
        timestamp: "Just now",
        summary: interpretation,
      }
      setMessages((prev) => [...prev, interpretationMessage])
      
      // 滚动到解读
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
      
      // 彻底完成后恢复 normal 状态，并清空临时存储的数据
      setConversationState("normal")
      setUserQuestion("")
      setSelectedFunction(null)
    }, 2000)
  }

  // 处理石头退出
  const handleStoneExit = () => {
    setConversationState("normal")
    setEyeDirection("center")
    setSelectedFunction(null)
  }

  // 处理选择接受（StoneUnified 内部处理过渡动画）
  const handleChoiceAccept = () => {
    setConversationState("stone_fullscreen")
  }

  // 处理选择拒绝
  const handleChoiceReject = () => {
    const rejectMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "我理解了。也许现在还不是时候。当你准备好时，石头会一直在那里等待你。",
      isUser: false,
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, rejectMessage])
    setConversationState("normal")
    setSelectedFunction(null)
    
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // 处理功能按钮点击（用户可随时切换）
  const handleFunctionButtonClick = (func: "stone" | "tarot" | "echo") => {
    // 如果正在全屏交互中，不允许切换
    if (conversationState === "stone_fullscreen") return
    
    // 重置状态，开始新的功能交互
    setSelectedFunction(func)
    setUserQuestion("")
    setConversationState("stone_triggered")
    setUserQuestion("")
    
    // 眼睛看向思考方向
    setEyeDirection("down-left")
    setIsThinking(true)
    
    // Oracle 回应
    setTimeout(() => {
      setIsThinking(false)
      
      const funcNames: Record<string, string> = {
        stone: "Destiny Stone（命运之石）",
        tarot: "Tarot（塔罗牌）",
        echo: "Echo（心灵回响）"
      }
      
      const questionMessage: TextMessage = {
        id: generateMessageId(),
        type: "text",
        content: `我看到你想借助 ${funcNames[func]} 来帮助你。你有什么困惑？`,
        isUser: false,
        timestamp: "Just now",
      }
      setMessages((prev) => [...prev, questionMessage])
      setConversationState("waiting_for_question")
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
      
      setEyeDirection("center")
    }, 1500)
  }

  const sendMessage = () => {
    if (!input.trim()) return

    const userInput = input.trim()
    const userMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: userInput,
      isUser: true,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // 用户发送消息时，眼睛看向右下角
    setEyeDirection("down-right")
    if (eyeTimerRef.current) clearTimeout(eyeTimerRef.current)
    
    // 滚动到新消息
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }, 100)

    // 根据对话状态处理
    if (conversationState === "normal") {
      // 检测是否触发STONE
      const intent = detectIntent(userInput)
      if (intent.intent === "stone" && intent.confidence > 0.5) {
        setConversationState("stone_triggered")
        setUserQuestion("") // 重置疑惑，开始新流程
        
        eyeTimerRef.current = setTimeout(() => {
          setIsThinking(true)
          setEyeDirection("down-left")
        }, 1500)

        // 2秒后询问疑惑
        setTimeout(() => {
          setIsThinking(false)
          const questionMessage: TextMessage = {
            id: generateMessageId(),
            type: "text",
            content: "你有什么疑惑？",
            isUser: false,
            timestamp: "Just now",
          }
          setMessages((prev) => [...prev, questionMessage])
          setConversationState("waiting_for_question")
          
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)
          
          if (eyeTimerRef.current) clearTimeout(eyeTimerRef.current)
          eyeTimerRef.current = setTimeout(() => {
            setEyeDirection("center")
          }, 1000)
        }, 2000)
      } else {
        // 普通对话
        eyeTimerRef.current = setTimeout(() => {
          setIsThinking(true)
          setEyeDirection("down-left")
        }, 1500)

        setTimeout(() => {
          setIsThinking(false)
          const aiResponse: TextMessage = {
            id: generateMessageId(),
            type: "text",
            content:
              "Your question reveals a deeper truth. The resistance you feel is not weakness but wisdom. Your intuition is guiding you toward a path that requires courage. Trust the energy that flows through you.",
            isUser: false,
            timestamp: "Just now",
          }
          setMessages((prev) => [...prev, aiResponse])

          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)

          if (eyeTimerRef.current) clearTimeout(eyeTimerRef.current)
          eyeTimerRef.current = setTimeout(() => {
            setEyeDirection("center")
          }, 1000)
        }, 6500)
      }
    } else if (conversationState === "waiting_for_question") {
      // 用户回答了疑惑
      setUserQuestion(userInput)
      setConversationState("question_received")
      
      eyeTimerRef.current = setTimeout(() => {
        setIsThinking(true)
        setEyeDirection("down-left")
      }, 1500)

      // 2秒后确认准备好
      setTimeout(() => {
        setIsThinking(false)
        
        const funcNames: Record<string, string> = {
          stone: "Destiny Stone（命运之石）",
          tarot: "Tarot（塔罗牌）",
          echo: "Echo（心灵回响）"
        }
        const currentFunc = selectedFunction || "stone"
        
        const confirmMessage: TextMessage = {
          id: generateMessageId(),
          type: "text",
          content: `好的，我理解了你的困惑。${funcNames[currentFunc]} 已经准备好了，如果你准备好了就开始吧。`,
          isUser: false,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, confirmMessage])
        setConversationState("suggesting_stone")
        
        // 延迟显示选择按钮（在输入框位置）
        setTimeout(() => {
          setConversationState("waiting_for_choice")
          
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)
        }, 1500)
        
        if (eyeTimerRef.current) clearTimeout(eyeTimerRef.current)
        eyeTimerRef.current = setTimeout(() => {
          setEyeDirection("center")
        }, 1000)
      }, 2000)
    }
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (eyeTimerRef.current) clearTimeout(eyeTimerRef.current)
    }
  }, [])

  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="shrink-0 p-6 pt-12 bg-background">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-start gap-4">
            {/* 交互式眼睛 */}
            <div className="shrink-0">
              <OracleInteractiveEye direction={eyeDirection} className="w-16 h-16" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-light mb-2">
                <InkRevealText text="Oracle" />
              </h1>
              <p className="text-sm opacity-60 font-light">
                <InkRevealText text="Your all-knowing companion" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable messages area */}
      <div className="flex-1 relative overflow-hidden">
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background via-background/60 to-transparent pointer-events-none z-30" />
        
        <div ref={scrollContainerRef} className="h-full overflow-y-auto px-6 pb-80 hide-scrollbar">
          <div className="max-w-screen-sm mx-auto">
            {/* Messages */}
            <div className="space-y-6 pt-8">
              {messages.map((message) => (
                <MessageRenderer
                  key={message.id}
                  message={message}
                  onChoiceAccept={handleChoiceAccept}
                  onChoiceReject={handleChoiceReject}
                />
              ))}
              
              {/* Oracle thinking animation */}
              {isThinking && <OracleThinking />}
            </div>

            {/* Usage indicator */}
            <div className="text-center my-8">
              <p className="text-xs opacity-20 font-light">2 of 5 daily messages remaining</p>
            </div>
          </div>
        </div>

        {/* Fixed input area - 固定高度，不随浮窗变化 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 z-20">
          {/* 背景层 - 应用模糊和渐变遮罩，不影响内容 */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            style={{
              // 顶部10%渐变，反平方曲线 1-(1-x)²（顶部变化快，接近10%变化慢）
              // ease-out: 0%→0, 2.5%→44%, 5%→75%, 7.5%→94%, 10%→100%
              maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)",
            }}
          />
          {/* 内容层 - 相对定位，不受背景遮罩影响 */}
          <div className="relative max-w-screen-sm mx-auto">
            {/* 输入框区域 - 在石头交互时向下渐隐消失 */}
            <div 
              className="space-y-3"
              style={{
                opacity: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" ? 0 : 1,
                transform: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" 
                  ? "translateY(20px)" 
                  : "translateY(0)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" ? "none" : "auto",
              }}
            >
              {/* 功能按钮 - 始终可点击，用户可随时切换 */}
              <FunctionButtons
                onStoneClick={() => handleFunctionButtonClick("stone")}
                onTarotClick={() => handleFunctionButtonClick("tarot")}
                onEchoClick={() => handleFunctionButtonClick("echo")}
                disabled={false}
              />
              
              {/* 输入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={
                    conversationState === "waiting_for_question" 
                      ? "描述你的困惑..." 
                      : "Ask the oracle..."
                  }
                  disabled={conversationState === "stone_fullscreen" || conversationState === "waiting_for_choice"}
                  className="flex-1 border hairline border-foreground px-4 py-3 text-sm font-light bg-background focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={conversationState === "stone_fullscreen" || conversationState === "waiting_for_choice"}
                  className="px-6 border hairline border-foreground hover:bg-foreground hover:text-background transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统一石头交互（一镜到底） */}
      <StoneUnified
        isVisible={conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen"}
        onAccept={handleChoiceAccept}
        onReject={handleChoiceReject}
        onComplete={handleStoneComplete}
        onExit={handleStoneExit}
      />

      <BottomNav />
    </main>
  )
}
