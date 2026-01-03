"use client"

import { useEffect, useState } from "react"
import { ChatMessage } from "./chat-message"
import { FunctionEmbed } from "./function-embed"
import { ChoiceButtons } from "./choice-buttons"
import { AudioPlayer } from "./audio-player"
import type { Message } from "@/lib/oracle-types"

interface MessageRendererProps {
  message: Message
  onFunctionComplete?: (functionName: string, result: any) => void
  onFunctionCancel?: () => void
  onChoiceAccept?: () => void
  onChoiceReject?: () => void
}

export function MessageRenderer({ message, onFunctionComplete, onFunctionCancel, onChoiceAccept, onChoiceReject }: MessageRendererProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // 文本消息
  if (message.type === "text") {
    return (
      <ChatMessage 
        content={message.content}
        isUser={message.isUser}
        timestamp={message.timestamp}
        contextHint={message.contextHint}
      />
    )
  }

  // 功能触发消息（显示Oracle的确认回复）
  if (message.type === "function-trigger") {
    return (
      <div className="space-y-4">
        {message.oracleResponse && (
          <ChatMessage 
            content={message.oracleResponse}
            isUser={false}
            timestamp={message.timestamp}
            contextHint="Function activated"
          />
        )}
      </div>
    )
  }

  // 功能嵌入消息
  if (message.type === "function-embed") {
    return (
      <div className="space-y-4 my-6">
        {/* Oracle的引导消息 */}
        {message.oracleResponse && (
          <ChatMessage 
            content={message.oracleResponse}
            isUser={false}
            timestamp={message.timestamp}
            contextHint="Active"
          />
        )}
        
        {/* 功能组件容器 */}
        <div 
          className="border hairline border-foreground/20 bg-background/50 p-6 rounded-sm transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <FunctionEmbed
            functionName={message.functionName}
            onComplete={(functionName, result) => {
              onFunctionComplete?.(functionName, result)
            }}
            onCancel={onFunctionCancel}
          />
        </div>
      </div>
    )
  }

  // 功能结果消息
  if (message.type === "function-result") {
    return (
      <ChatMessage 
        content={message.summary}
        isUser={false}
        timestamp={message.timestamp}
        contextHint="Result"
      />
    )
  }

  // 选择消息（现在不在消息中显示，选择按钮在输入框位置）
  if (message.type === "choice") {
    return null // 不再在消息中渲染选择按钮
  }

  // 系统事件消息
  if (message.type === "system") {
    return (
      <div className="flex flex-col items-center justify-center my-8 space-y-2">
        <p className="text-xs opacity-40 font-light tracking-wide text-center max-w-[80%]">
          {message.content}
        </p>
        {message.timestamp && (
          <span className="text-[9px] opacity-20 uppercase tracking-widest">{message.timestamp}</span>
        )}
      </div>
    )
  }

  // Echo 音频消息
  if (message.type === "echo-audio") {
    return (
      <div 
        className="transition-all duration-700"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AudioPlayer
          title={message.title}
          subtitle={message.subtitle}
          frequency={message.frequency}
          duration={message.duration}
          description={message.description}
          playCount={0}
        />
      </div>
    )
  }

  return null
}

