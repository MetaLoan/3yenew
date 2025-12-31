"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { InkRevealText } from "./ink-reveal-text"

// 动态导入 3D 石头组件避免 SSR 问题
const Stone3D = dynamic(
  () => import("./stone-3d").then((mod) => mod.Stone3D),
  { ssr: false }
)

interface StoneChoicePromptProps {
  onAccept: () => void
  onReject: () => void
}

export function StoneChoicePrompt({ onAccept, onReject }: StoneChoicePromptProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 延迟显示，确保动画流畅
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full">
      {/* 内容层 */}
      <div className="relative z-10">
        {/* 悬浮石头区域 */}
        <div 
          className="flex flex-col items-center mb-8 transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-20px)",
          }}
        >
        {/* 悬浮的石头 */}
        <div className="relative mb-4 animate-float-stone">
          <Stone3D 
            size={120}
            isHolding={false}
            progress={0}
            revealed={false}
            isShaking={false}
          />
        </div>

        {/* 标题 */}
        <h3 className="text-lg font-light tracking-wide">
          <InkRevealText text="是否进入Fate Stone" />
        </h3>
      </div>

      {/* 按钮区域 - 带细线连接和漂浮效果 */}
      <div 
        className="relative flex gap-4 transition-all duration-1000"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* 细线 - 从上方连接到按钮 */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-foreground/20" />
        
        {/* 接受按钮 - 白色背景 */}
        <button
          onClick={onAccept}
          className="flex-1 border hairline border-foreground py-3 text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-all relative animate-float-button shadow-sm"
        >
          接受
        </button>

        {/* 拒绝按钮 - 黑色背景 */}
        <button
          onClick={onReject}
          className="flex-1 border hairline border-foreground py-3 text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-all relative animate-float-button-delayed shadow-sm"
        >
          拒绝
        </button>
      </div>
      </div>
    </div>
  )
}

