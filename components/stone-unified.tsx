"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { X } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import type { StoneResult } from "@/lib/oracle-types"

// 动态导入 3D 石头组件避免 SSR 问题
const Stone3D = dynamic(
  () => import("./stone-3d").then((mod) => mod.Stone3D),
  { ssr: false }
)

type Phase = "choice" | "transitioning" | "interaction" | "result" | "exiting"

interface StoneUnifiedProps {
  isVisible: boolean
  onAccept: () => void
  onReject: () => void
  onComplete: (result: StoneResult) => void
  onExit: () => void
}

// 石头可能的结果
const ORACLE_MESSAGES = [
  { result: "YES" as const, message: "The path ahead glows with certainty" },
  { result: "NO" as const, message: "The shadows whisper caution" },
  { result: "WAIT" as const, message: "Time holds the answer you seek" },
  { result: "SILENCE" as const, message: "Some truths reveal themselves in stillness" },
  { result: "RELEASE" as const, message: "Let go of what no longer serves you" },
]

export function StoneUnified({ 
  isVisible, 
  onAccept, 
  onReject, 
  onComplete, 
  onExit 
}: StoneUnifiedProps) {
  const [phase, setPhase] = useState<Phase>("choice")
  const [isEntering, setIsEntering] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  // 石头交互状态
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [oracle, setOracle] = useState(ORACLE_MESSAGES[0])
  const [userChoice, setUserChoice] = useState<"follow" | "rebel" | null>(null)
  
  const holdStartRef = useRef<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  // 动画状态：'hidden' | 'entering' | 'visible' | 'exiting'
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden')

  // 重置状态
  useEffect(() => {
    if (isVisible) {
      setIsEntering(true)
      setPhase("choice")
      setProgress(0)
      setRevealed(false)
      setIsHolding(false)
      setUserChoice(null)
      setShowExitConfirm(false)
      setAnimationState('hidden')
      
      // 整体进入动画
      setTimeout(() => {
        setAnimationState('entering')
      }, 50)
      setTimeout(() => {
        setAnimationState('visible')
        setIsEntering(false)
      }, 600)
    }
  }, [isVisible])

  // 处理接受 - 开始过渡动画
  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()
    
    // 过渡动画完成后进入交互阶段
    setTimeout(() => {
      setPhase("interaction")
    }, 1000)
  }, [onAccept])

  // 处理拒绝 - 整体退出动画（反方向）
  const handleReject = useCallback(() => {
    setAnimationState('exiting')
    setTimeout(() => {
      onReject()
    }, 500)
  }, [onReject])

  // 处理退出
  const handleExit = useCallback(() => {
    if (showExitConfirm) {
      setPhase("exiting")
      setTimeout(() => {
        onExit()
      }, 500)
    } else {
      setShowExitConfirm(true)
      setTimeout(() => setShowExitConfirm(false), 3000)
    }
  }, [showExitConfirm, onExit])

  // 长按开始
  const handleHoldStart = useCallback(() => {
    if (phase !== "interaction" || revealed) return
    
    setIsHolding(true)
    holdStartRef.current = Date.now()
    progressRef.current = 0
    
    const animate = () => {
      if (!holdStartRef.current) return
      
      const elapsed = Date.now() - holdStartRef.current
      const newProgress = Math.min(elapsed / 3000, 1) // 3秒完成
      progressRef.current = newProgress
      setProgress(newProgress)
      
      // 接近完成时开始震动
      if (newProgress > 0.8 && !isShaking) {
        setIsShaking(true)
      }
      
      if (newProgress >= 1) {
        // 完成 - 揭示结果
        setIsHolding(false)
        setRevealed(true)
        setIsShaking(false)
        holdStartRef.current = null
        
        // 随机选择结果
        const randomOracle = ORACLE_MESSAGES[Math.floor(Math.random() * ORACLE_MESSAGES.length)]
        setOracle(randomOracle)
        setPhase("result")
        return
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [phase, revealed, isShaking])

  // 长按结束
  const handleHoldEnd = useCallback(() => {
    if (!isHolding) return
    
    setIsHolding(false)
    setIsShaking(false)
    holdStartRef.current = null
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // 缓慢重置进度
    const resetProgress = () => {
      setProgress((prev) => {
        if (prev <= 0) return 0
        requestAnimationFrame(resetProgress)
        return prev - 0.02
      })
    }
    resetProgress()
  }, [isHolding])

  // 用户选择 Follow/No Way
  const handleChoice = useCallback((choice: "follow" | "rebel") => {
    setUserChoice(choice)
    setPhase("exiting")
    
    const result: StoneResult = {
      result: oracle.result,
      message: oracle.message,
      choice
    }
    
    setTimeout(() => {
      onComplete(result)
    }, 800)
  }, [oracle, onComplete])

  // 清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!isVisible) return null

  // 计算石头的样式（用于一镜到底效果）
  const getStoneContainerStyle = () => {
    const baseStyle = {
      transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
    }
    
    switch (phase) {
      case "choice":
        return {
          ...baseStyle,
          transform: "translateY(0) scale(1)",
        }
      case "transitioning":
      case "interaction":
      case "result":
        return {
          ...baseStyle,
          transform: "translateY(0) scale(1.5)",
        }
      case "exiting":
        return {
          ...baseStyle,
          transform: "translateY(0) scale(1.5)",
          opacity: 0,
        }
      default:
        return baseStyle
    }
  }

  // 计算石头大小
  const getStoneSize = () => {
    if (phase === "choice") return 120
    return 200
  }

  // choice 阶段：定位在底部输入区域
  // 其他阶段：全屏居中
  const isChoicePhase = phase === "choice"

  return (
    <div 
      className={`fixed z-[100] flex flex-col items-center transition-all duration-1000 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      } ${
        isChoicePhase 
          ? "bottom-16 left-0 right-0 pb-5" 
          : "inset-0 justify-center"
      }`}
      style={{
        background: isChoicePhase || isEntering 
          ? "transparent" 
          : "rgba(255, 255, 255, 1)",
      }}
    >
      {/* 背景遮罩 - 仅在非 choice 阶段显示 */}
      <div 
        className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
          isChoicePhase ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* 退出按钮 - 仅在交互阶段显示 */}
      {(phase === "interaction" || phase === "result") && (
        <button
          onClick={handleExit}
          className="absolute top-6 right-6 z-50 p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors"
          aria-label="Exit"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 退出确认提示 */}
      {showExitConfirm && (
        <div className="absolute top-20 right-6 z-50 border hairline border-foreground bg-background p-4 max-w-xs">
          <p className="text-xs font-light mb-2">确定要退出吗？</p>
          <p className="text-[10px] opacity-60 font-light">退出后将无法继续此次占卜</p>
        </div>
      )}

      {/* 主内容区域 */}
      <div className={`relative z-10 flex flex-col items-center ${
        isChoicePhase ? "px-6 max-w-screen-sm mx-auto w-full" : ""
      }`}>
        
        {/* 选择阶段 - 石头/标题/按钮作为整体，统一动画 */}
        {phase === "choice" && (
          <div 
            className="flex flex-col items-center w-full"
            style={{
              opacity: animationState === 'visible' || animationState === 'entering' ? 1 : 0,
              transform: animationState === 'exiting' 
                ? "translateY(30px)" // 退出时向下移动
                : animationState === 'visible' || animationState === 'entering'
                  ? "translateY(0)" 
                  : "translateY(30px)", // 进入时从下方来
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* 石头 */}
            <div className={`relative ${animationState === 'visible' ? "animate-float-stone" : ""}`}>
              <Stone3D
                size={getStoneSize()}
                isHolding={isHolding}
                progress={progress}
                revealed={revealed}
                isShaking={isShaking}
              />
            </div>

            {/* 标题 - 带 InkRevealText 效果 */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-light tracking-wide">
                {(animationState === 'visible' || animationState === 'entering') && <InkRevealText text="是否进入Fate Stone" />}
              </h3>
            </div>

            {/* 细线 */}
            <div className="w-px h-5 bg-foreground/20 my-2" />

            {/* 按钮区域 */}
            <div className="relative flex gap-4 w-full justify-center">
              {/* 接受按钮 */}
              <button
                onClick={handleAccept}
                className="w-32 border hairline border-foreground py-3 text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors animate-float-button shadow-sm"
              >
                接受
              </button>

              {/* 拒绝按钮 */}
              <button
                onClick={handleReject}
                className="w-32 border hairline border-foreground py-3 text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors animate-float-button-delayed shadow-sm"
              >
                拒绝
              </button>
            </div>
          </div>
        )}

        {/* 非选择阶段的石头容器 */}
        {phase !== "choice" && (
          <div 
            className="relative"
            style={getStoneContainerStyle()}
            onMouseDown={phase === "interaction" ? handleHoldStart : undefined}
            onMouseUp={phase === "interaction" ? handleHoldEnd : undefined}
            onMouseLeave={phase === "interaction" ? handleHoldEnd : undefined}
            onTouchStart={phase === "interaction" ? handleHoldStart : undefined}
            onTouchEnd={phase === "interaction" ? handleHoldEnd : undefined}
          >
            <Stone3D
              size={getStoneSize()}
              isHolding={isHolding}
              progress={progress}
              revealed={revealed}
              isShaking={isShaking}
            />
          </div>
        )}

        {/* 过渡阶段 - 仅显示石头 */}
        {phase === "transitioning" && (
          <p className="text-sm opacity-40 font-light mt-8 animate-pulse">
            正在连接命运之石...
          </p>
        )}

        {/* 交互阶段的提示 */}
        {phase === "interaction" && (
          <p className="text-sm opacity-60 font-light mt-8 text-center">
            长按石头，直到它揭示答案
          </p>
        )}

        {/* 结果阶段 */}
        {phase === "result" && (
          <div className="mt-8 flex flex-col items-center">
            {/* 结果文字 */}
            <p className="text-2xl font-light tracking-widest mb-2">
              {oracle.result}
            </p>
            <p className="text-sm opacity-60 font-light mb-8 text-center max-w-xs">
              {oracle.message}
            </p>

            {/* Follow / No Way 按钮 */}
            <div className="flex gap-4">
              <button
                onClick={() => handleChoice("follow")}
                className="px-8 py-3 border hairline border-foreground text-sm font-light hover:bg-foreground hover:text-background transition-all"
              >
                Follow
              </button>
              <button
                onClick={() => handleChoice("rebel")}
                className="px-8 py-3 border hairline border-foreground bg-foreground text-background text-sm font-light hover:bg-background hover:text-foreground transition-all"
              >
                No Way
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

