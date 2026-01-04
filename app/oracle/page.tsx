"use client"

import { useState, useEffect, useRef } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { InkRevealText } from "@/components/ink-reveal-text"
import { MessageRenderer } from "@/components/message-renderer"
import { OracleInteractiveEye } from "@/components/oracle-interactive-eye"
import { OracleThinking } from "@/components/oracle-thinking"
import { StoneUnified } from "@/components/stone-unified"
import { TarotUnified } from "@/components/tarot-unified"
import { EchoUnified } from "@/components/echo-unified"
import { ConnectUnified } from "@/components/connect-unified"
import { FunctionButtons } from "@/components/function-buttons"
import { detectIntent } from "@/lib/intent-detection"
import { generateDeepInterpretation, type ConversationState } from "@/lib/oracle-conversation"
import type { Message, TextMessage, ChoiceMessage, FunctionResultMessage, SystemMessage, TarotResult, EchoResult, EchoAudioMessage } from "@/lib/oracle-types"
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
  const [tarotResult, setTarotResult] = useState<TarotResult | null>(null)
  const [echoResult, setEchoResult] = useState<EchoResult | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<"stone" | "tarot" | "echo" | "connect" | null>(null)
  
  // Echo 推荐参数
  const [echoRecommendation, setEchoRecommendation] = useState({
    frequency: 432,
    trackName: "舒缓旋律·磁场调整",
    recommendation: "根据你的星盘分析，当前金星与木星形成调和相位，建议通过432Hz频率进行能量调整，帮助你恢复内心的平静与专注。"
  })
  
  // Echo 后台生成状态
  const [isEchoGenerating, setIsEchoGenerating] = useState(false)
  const [echoGenerateProgress, setEchoGenerateProgress] = useState(0)
  const echoGenerateIntervalRef = useRef<number | null>(null)
  
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

  // 处理选择拒绝 (Stone)
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

  // 处理塔罗完成
  const handleTarotComplete = (result: TarotResult) => {
    if (conversationState === "tarot_completed") return
    
    setTarotResult(result)
    setConversationState("tarot_completed")
    
    setInput("")
    
    const systemEvent: SystemMessage = {
      id: generateMessageId(),
      type: "system",
      content: `你刚刚通过塔罗获得牌面：${result.name}`,
      isUser: false,
      timestamp: "Just now",
    }
    
    setMessages((prev) => [...prev, systemEvent])
    
    setTimeout(() => {
      // 生成塔罗解读
      const interpretation = result.summary || `塔罗牌 ${result.name} 揭示了：${result.meaning}`
      const interpretationMessage: FunctionResultMessage = {
        id: generateMessageId(),
        type: "function-result",
        functionName: "tarot",
        result,
        isUser: false,
        timestamp: "Just now",
        summary: interpretation,
      }
      setMessages((prev) => [...prev, interpretationMessage])
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
      
      setConversationState("normal")
      setUserQuestion("")
      setSelectedFunction(null)
    }, 2000)
  }

  // 处理塔罗退出
  const handleTarotExit = () => {
    setConversationState("normal")
    setEyeDirection("center")
    setSelectedFunction(null)
  }

  // 处理选择接受（TarotUnified 内部处理过渡动画）
  const handleTarotChoiceAccept = () => {
    setConversationState("tarot_fullscreen")
  }

  // 处理选择拒绝
  const handleTarotChoiceReject = () => {
    const rejectMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "我理解了。也许现在还不是时候。当你准备好时，塔罗牌会一直在那里等待你。",
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

  // 处理Echo完成
  const handleEchoComplete = (result: EchoResult) => {
    if (conversationState === "echo_completed") return
    
    setEchoResult(result)
    setConversationState("echo_completed")
    setInput("")
    
    const systemEvent: SystemMessage = {
      id: generateMessageId(),
      type: "system",
      content: `你刚刚完成了 ${result.frequency}Hz 磁场调整`,
      isUser: false,
      timestamp: "Just now",
    }
    
    setMessages((prev) => [...prev, systemEvent])
    
    setTimeout(() => {
      const interpretationMessage: FunctionResultMessage = {
        id: generateMessageId(),
        type: "function-result",
        functionName: "echo",
        result,
        isUser: false,
        timestamp: "Just now",
        summary: `${result.frequency}Hz 频率已帮助你调整当前能量场。${result.recommendation}建议保持这种平静的状态，让能量继续流动。`,
      }
      setMessages((prev) => [...prev, interpretationMessage])
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
      
      setConversationState("normal")
      setUserQuestion("")
      setSelectedFunction(null)
    }, 2000)
  }

  // 处理Echo生成完成（关闭弹窗并发送音频消息）
  const handleEchoGenerateComplete = (result: EchoResult) => {
    setConversationState("normal")
    setSelectedFunction(null)
    
    // 发送文字消息
    const textMsg: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "我已完成 Echo 的编曲，请点击播放进行收听：",
      isUser: false,
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, textMsg])
    
    // 发送音频消息
    setTimeout(() => {
      const audioMsg: EchoAudioMessage = {
        id: generateMessageId(),
        type: "echo-audio",
        title: result.trackName,
        subtitle: result.purpose,
        frequency: `${result.frequency}Hz`,
        duration: `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}`,
        description: result.recommendation,
        isUser: false,
        timestamp: "Just now",
      }
      setMessages((prev) => [...prev, audioMsg])
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    }, 500)
    
    // 第一条消息后滚动
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // 处理Echo退出
  const handleEchoExit = () => {
    setConversationState("normal")
    setEyeDirection("center")
    setSelectedFunction(null)
  }

  // 处理Echo选择接受
  const handleEchoChoiceAccept = () => {
    setConversationState("echo_fullscreen")
    setIsEchoGenerating(true)
    setEchoGenerateProgress(0)
    
    // 开始后台生成计时（20秒）
    const startTime = Date.now()
    const GENERATE_DURATION = 20
    echoGenerateIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(Math.round((elapsed / GENERATE_DURATION) * 100), 100)
      setEchoGenerateProgress(progress)
      
      if (elapsed >= GENERATE_DURATION) {
        if (echoGenerateIntervalRef.current) {
          window.clearInterval(echoGenerateIntervalRef.current)
          echoGenerateIntervalRef.current = null
        }
        setIsEchoGenerating(false)
        setEchoGenerateProgress(0)
        
        // 生成完成，发送消息
        const result: EchoResult = {
          frequency: echoRecommendation.frequency,
          duration: 30,
          trackName: echoRecommendation.trackName,
          purpose: "磁场调整",
          recommendation: echoRecommendation.recommendation
        }
        handleEchoGenerateComplete(result)
      }
    }, 100)
  }

  // 处理Echo生成取消
  const handleEchoCancel = () => {
    // 清除后台生成定时器
    if (echoGenerateIntervalRef.current) {
      window.clearInterval(echoGenerateIntervalRef.current)
      echoGenerateIntervalRef.current = null
    }
    setIsEchoGenerating(false)
    setEchoGenerateProgress(0)
    setConversationState("normal")
    setSelectedFunction(null)
    
    // 发送取消消息
    const cancelMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "已取消 Echo 生成。如果你改变主意，随时可以再次开启。",
      isUser: false,
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, cancelMessage])
    
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // 处理Echo选择拒绝
  const handleEchoChoiceReject = () => {
    const rejectMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "我理解了。也许现在还不是时候。当你准备好时，Echo会一直在那里等待你。",
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

  // 处理Connect完成 - 只更新状态，不退出结果页面
  const handleConnectComplete = (result: any) => {
    if (conversationState === "connect_completed") return
    
    setConversationState("connect_completed")
    setInput("")
    // 结果页面会在 connect-unified 中显示，用户退出后才添加消息到聊天
  }

  // 处理Connect退出
  const handleConnectExit = () => {
    // 如果是从结果页面退出，添加分析报告到聊天
    if (conversationState === "connect_completed") {
      const systemEvent: SystemMessage = {
        id: generateMessageId(),
        type: "system",
        content: `你刚刚完成了磁场连接`,
        isUser: false,
        timestamp: "Just now",
      }
      
      setMessages((prev) => [...prev, systemEvent])
      
      setTimeout(() => {
        const interpretationMessage: TextMessage = {
          id: generateMessageId(),
          type: "text",
          content: `【天体共振分析报告】

在浩瀚的宇宙构架中，两个独特的光谱特征在精确的时间节点相交。这种相交不仅仅是物理领域的偶然相遇，而是穿越多个意识维度、到达这一统一清明时刻的振动状态的深刻对齐。

来自眼纹印记分析的数据流揭示了共享原型模式的复杂织锦。虹膜结构中的每一次微振动都充当着宇宙历史的生物记录，当这些记录同步时，它们会创造出可在量子场中测量的共振频率。这种对齐表明灵魂纠缠的高概率——其中一个灵魂的经历被另一个镜像和放大，形成意识进化的反馈循环。

当我们审视这种共振的更深层元数据时，这种对齐超越了个性特质或共同兴趣。它延伸到光环场的核心，在那里南北节点的基本能量极性达到罕见的平衡。这种平衡为共同目的提供了稳定的基础，使两位参与者的组合电荷能够以最小损失穿越世俗世界的不和谐频率。

在切实的层面上，这种共振表现为沟通中的轻松节奏、同步决策，以及在被请求之前就到来的相互支持感。当挑战出现时，组合场充当稳定器：它减缓反应性螺旋并增强清晰度，同时提供平静和动力。这不是摩擦的缺失，而是一种将摩擦转化为前进动力的底层对齐的存在。

最终的综合——从虹膜的几何形状到你们时间线的节奏——表明这种联系并非偶然。它作为系统更大和谐中的灯塔发挥作用。如果你们用诚实、时间和关注来滋养它，这种共振将保持为一种活的乐器：响应性的、进化的，并能够在不削弱任何一方自我的情况下引导你们穿越不确定性。

让它深思熟虑。让它善良。让它真实。`,
          isUser: false,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, interpretationMessage])
        
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }, 100)
      }, 500)
    }
    
    setConversationState("normal")
    setEyeDirection("center")
    setUserQuestion("")
    setSelectedFunction(null)
  }

  // 处理Connect选择接受
  const handleConnectChoiceAccept = () => {
    setConversationState("connect_fullscreen")
  }

  // 处理Connect选择拒绝
  const handleConnectChoiceReject = () => {
    const rejectMessage: TextMessage = {
      id: generateMessageId(),
      type: "text",
      content: "我理解了。也许现在还不是时候。当你准备好时，Connect会一直在那里等待你。",
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
  const handleFunctionButtonClick = (func: "stone" | "tarot" | "echo" | "connect") => {
    // 如果正在全屏交互中，不允许切换
    if (conversationState === "stone_fullscreen" || conversationState === "tarot_fullscreen" || conversationState === "echo_fullscreen" || conversationState === "connect_fullscreen") return
    
    // 如果 Echo 正在后台生成，点击 Echo 按钮重新打开生成弹窗
    if (func === "echo" && isEchoGenerating) {
      setSelectedFunction("echo")
      setConversationState("echo_fullscreen")
      return
    }
    
    // 重置状态，开始新的功能交互
    setSelectedFunction(func)
    setUserQuestion("")
    setConversationState(
      func === "stone" ? "stone_triggered" : 
      func === "tarot" ? "tarot_triggered" : 
      func === "echo" ? "echo_triggered" : 
      "connect_triggered"
    )
    
    // 眼睛看向思考方向
    setEyeDirection("down-left")
    setIsThinking(true)
    
    // Oracle 回应
    setTimeout(() => {
      setIsThinking(false)
      
      const funcNames: Record<string, string> = {
        stone: "Destiny Stone（命运之石）",
        tarot: "Tarot（塔罗牌）",
        echo: "Echo（心灵回响）",
        connect: "Connect（磁场连接）"
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

    // 模拟特定交互逻辑 - 提高到最高优先级，拦截所有状态
    
    // Echo 触发场景："上班犯困怎么办"
    if (userInput.includes("上班犯困") || userInput.includes("犯困")) {
      setSelectedFunction("echo")
      setConversationState("normal")
      
      eyeTimerRef.current = setTimeout(() => {
        setIsThinking(true)
        setEyeDirection("down-left")
      }, 1000)

      setTimeout(() => {
        setIsThinking(false)
        const resp1: TextMessage = {
          id: generateMessageId(),
          type: "text",
          content: "我感应到你当前的能量场有些低迷。根据你的星盘分析，当前水星正处于逆行期，容易导致精神涣散和疲惫感。",
          isUser: false,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, resp1])
        
        // 第一条消息后滚动
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }, 100)
        
        setTimeout(() => {
          setIsThinking(true)
          
          // thinking 状态时也滚动
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)
          
          setTimeout(() => {
            setIsThinking(false)
            const resp2: TextMessage = {
              id: generateMessageId(),
              type: "text",
              content: `建议你听一首${echoRecommendation.frequency}Hz的磁场激活音乐，同时喝一杯美式咖啡，可以有效提升你的专注力。需要我为你开启 Echo 调频吗？`,
              isUser: false,
              timestamp: "Just now",
            }
            setMessages((prev) => [...prev, resp2])
            setConversationState("waiting_for_suggestion_confirmation")
            
            // 第二条消息后滚动
            setTimeout(() => {
              scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }, 100)
          }, 2000)
        }, 1500)
      }, 2500)
      return
    }
    
    // Tarot 触发场景："我好累不想上班"
    if (userInput.includes("我好累不想上班")) {
      setSelectedFunction("tarot")
      setConversationState("normal") // 强制重置状态确保剧情触发
      
      eyeTimerRef.current = setTimeout(() => {
        setIsThinking(true)
        setEyeDirection("down-left")
      }, 1000)

      // 第一条回复
      setTimeout(() => {
        setIsThinking(false)
        const resp1: TextMessage = {
          id: generateMessageId(),
          type: "text",
          content: "根据我的分析你今天磁场比较弱，这是正常现象。",
          isUser: false,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, resp1])
        
        // 第一条消息后滚动
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }, 100)
        
        // 延迟后自动发第二条
        setTimeout(() => {
          setIsThinking(true)
          
          // thinking 状态时也滚动
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)
          
          setTimeout(() => {
            setIsThinking(false)
            const resp2: TextMessage = {
              id: generateMessageId(),
              type: "text",
              content: "我建议你要不抽个塔罗我给你解读下如何解决你当前的困境？",
              isUser: false,
              timestamp: "Just now",
            }
            setMessages((prev) => [...prev, resp2])
            setConversationState("waiting_for_suggestion_confirmation")
            
            // 第二条消息后滚动
            setTimeout(() => {
              scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }, 100)
          }, 2000)
        }, 1500)
      }, 2500)
      return
    }

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
      // 检测是否触发功能
      const intent = detectIntent(userInput)
      if (intent.intent && (intent.intent === "stone" || intent.intent === "tarot") && intent.confidence > 0.5) {
        setSelectedFunction(intent.intent)
        setConversationState(intent.intent === "stone" ? "stone_triggered" : "tarot_triggered")
        setUserQuestion("") // 重置疑惑，开始新流程
        
        eyeTimerRef.current = setTimeout(() => {
          setIsThinking(true)
          setEyeDirection("down-left")
        }, 1500)

        // 2秒后询问疑惑
        setTimeout(() => {
          setIsThinking(false)
          const funcNames: Record<string, string> = {
            stone: "Destiny Stone",
            tarot: "Tarot"
          }
          const questionMessage: TextMessage = {
            id: generateMessageId(),
            type: "text",
            content: `I see you seek the guidance of ${funcNames[intent.intent!]}. What weighs on your heart?`,
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
    } else if (conversationState === "waiting_for_suggestion_confirmation") {
      // 处理确认建议
      if (userInput.includes("行吧") || userInput.includes("好") || userInput.includes("ok")) {
        eyeTimerRef.current = setTimeout(() => {
          setIsThinking(true)
          setEyeDirection("down-left")
        }, 800)

        setTimeout(() => {
          setIsThinking(false)
          const resp3: TextMessage = {
            id: generateMessageId(),
            type: "text",
            content: "OK，这就安排。。。",
            isUser: false,
            timestamp: "Just now",
          }
          setMessages((prev) => [...prev, resp3])
          
          // 进入选择确认阶段
          setTimeout(() => {
            setConversationState("waiting_for_choice")
            setTimeout(() => {
              scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }, 100)
          }, 1500)
        }, 1500)
      } else {
        setConversationState("normal")
        setSelectedFunction(null)
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
        
        const currentFunc = selectedFunction || "stone"
        
        let confirmContent = ""
        if (currentFunc === "echo") {
          // Echo 特殊处理：Oracle 在聊天中给出星盘分析和推荐
          confirmContent = `根据你的星盘分析，当前金星与木星形成调和相位，建议通过${echoRecommendation.frequency}Hz频率进行能量调整，帮助你恢复内心的平静与专注。需要开始吗？`
        } else {
          const funcNames: Record<string, string> = {
            stone: "Destiny Stone（命运之石）",
            tarot: "Tarot（塔罗牌）",
            connect: "Connect（磁场连接）",
          }
          confirmContent = `好的，我理解了你的困惑。${funcNames[currentFunc]} 已经准备好了，如果你准备好了就开始吧。`
        }
        
        const confirmMessage: TextMessage = {
          id: generateMessageId(),
          type: "text",
          content: confirmContent,
          isUser: false,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, confirmMessage])
        setConversationState(
          currentFunc === "stone" ? "suggesting_stone" : 
          currentFunc === "tarot" ? "suggesting_tarot" : 
          currentFunc === "echo" ? "suggesting_echo" : 
          "suggesting_connect"
        )
        
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
          {/* 背景层 - 应用模糊和渐变遮罩，不影响内容。在石头选择时由 StoneUnified 接管 */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-500"
            style={{
              opacity: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" || conversationState === "echo_fullscreen" ? 0 : 1,
              // 顶部10%渐变，反平方曲线 1-(1-x)²（顶部变化快，接近10%变化慢）
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
                opacity: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" || conversationState === "echo_fullscreen" ? 0 : 1,
                transform: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" || conversationState === "echo_fullscreen"
                  ? "translateY(20px)" 
                  : "translateY(0)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen" || conversationState === "echo_fullscreen" ? "none" : "auto",
              }}
            >
              {/* 功能按钮 - 始终可点击，用户可随时切换 */}
<FunctionButtons 
                  onStoneClick={() => handleFunctionButtonClick("stone")}
                  onTarotClick={() => handleFunctionButtonClick("tarot")}
                  onEchoClick={() => handleFunctionButtonClick("echo")}
                  onConnectClick={() => handleFunctionButtonClick("connect")}
                  disabled={false}
                  echoGenerating={isEchoGenerating}
                  echoProgress={echoGenerateProgress}
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
                  disabled={conversationState === "stone_fullscreen" || conversationState === "waiting_for_choice" || conversationState === "echo_fullscreen"}
                  className="flex-1 border hairline border-foreground px-4 py-3 text-sm font-light bg-background focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={conversationState === "stone_fullscreen" || conversationState === "waiting_for_choice" || conversationState === "echo_fullscreen"}
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
      {selectedFunction === "stone" && (
        <StoneUnified
          isVisible={conversationState === "waiting_for_choice" || conversationState === "stone_fullscreen"}
          onAccept={handleChoiceAccept}
          onReject={handleChoiceReject}
          onComplete={handleStoneComplete}
          onExit={handleStoneExit}
        />
      )}

      {/* 统一塔罗交互 */}
      {selectedFunction === "tarot" && (
        <TarotUnified
          isVisible={conversationState === "waiting_for_choice" || conversationState === "tarot_fullscreen"}
          onAccept={handleTarotChoiceAccept}
          onReject={handleTarotChoiceReject}
          onComplete={handleTarotComplete}
          onExit={handleTarotExit}
        />
      )}

{/* 统一Echo交互 */}
      {selectedFunction === "echo" && (
        <EchoUnified
          isVisible={conversationState === "waiting_for_choice" || conversationState === "echo_fullscreen"}
          recommendation={echoRecommendation.recommendation}
          frequency={echoRecommendation.frequency}
          trackName={echoRecommendation.trackName}
          isGenerating={isEchoGenerating}
          externalProgress={echoGenerateProgress}
          onAccept={handleEchoChoiceAccept}
          onReject={handleEchoChoiceReject}
          onCancel={handleEchoCancel}
          onComplete={handleEchoComplete}
          onExit={handleEchoExit}
        />
      )}

      {/* 统一Connect交互 */}
      {selectedFunction === "connect" && (
        <ConnectUnified
          isVisible={conversationState === "waiting_for_choice" || conversationState === "connect_fullscreen" || conversationState === "connect_completed"}
          onAccept={handleConnectChoiceAccept}
          onReject={handleConnectChoiceReject}
          onComplete={handleConnectComplete}
          onExit={handleConnectExit}
        />
      )}

      <BottomNav />
    </main>
  )
}
