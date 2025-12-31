"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { FateStoneEmbedded } from "./fate-stone-embedded"
import type { StoneResult } from "@/lib/oracle-types"

interface StoneFullscreenProps {
  onComplete: (result: StoneResult) => void
  onExit: () => void
  isVisible: boolean
}

export function StoneFullscreen({ onComplete, onExit, isVisible }: StoneFullscreenProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isEntering, setIsEntering] = useState(false)

  // 当组件隐藏时重置所有状态
  useEffect(() => {
    if (isVisible) {
      setIsEntering(true)
      setIsExiting(false) // 重置退出状态
      // 背景先模糊，然后显示内容
      setTimeout(() => {
        setIsEntering(false)
      }, 800)
    } else {
      // 组件隐藏时重置所有状态
      setIsEntering(false)
      setIsExiting(false)
      setShowExitConfirm(false)
    }
  }, [isVisible])

  const handleExit = () => {
    if (showExitConfirm) {
      setIsExiting(true)
      setTimeout(() => {
        onExit()
      }, 500)
    } else {
      setShowExitConfirm(true)
      setTimeout(() => {
        setShowExitConfirm(false)
      }, 3000)
    }
  }

  const handleStoneComplete = (result: StoneResult) => {
    if (isExiting) return
    
    setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onComplete(result)
      }, 500)
    }, 2000) // 给用户2秒看结果
  }

  if (!isVisible && !isExiting) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] transition-all duration-1000 ${
        isExiting 
          ? "opacity-0 backdrop-blur-0" 
          : isEntering
          ? "opacity-0 backdrop-blur-0"
          : "opacity-100 backdrop-blur-md"
      }`}
      style={{
        background: isExiting || isEntering ? "transparent" : "rgba(255, 255, 255, 0.95)",
      }}
    >
      {/* 退出按钮 */}
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 z-50 p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors"
        aria-label="Exit"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 退出确认提示 */}
      {showExitConfirm && (
        <div className="absolute top-20 right-6 z-50 border hairline border-foreground bg-background p-4 max-w-xs">
          <p className="text-xs font-light mb-2">确定要退出吗？</p>
          <p className="text-[10px] opacity-60 font-light">退出后将无法继续此次占卜</p>
        </div>
      )}

      {/* 石头交互区域 */}
      <div 
        className="h-full flex items-center justify-center p-6 transition-opacity duration-1000"
        style={{
          opacity: isEntering ? 0 : 1,
        }}
      >
        <div className="w-full max-w-2xl h-full">
          <FateStoneEmbedded
            onComplete={handleStoneComplete}
            onCancel={handleExit}
            embedded={false}
          />
        </div>
      </div>
    </div>
  )
}

