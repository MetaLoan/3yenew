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
      
      // 直接从 hidden 过渡到 visible，实现模糊渐显
      const timer = setTimeout(() => {
        setAnimationState('visible')
        setIsEntering(false)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // 处理接受 - 开始过渡动画
  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()
    
    // 过渡动画完成后进入交互阶段
    setTimeout(() => {
      setPhase("interaction")
    }, 1200)
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

  // choice 阶段：定位在底部输入区域
  // 其他阶段：全屏居中
  const isChoicePhase = phase === "choice"
  const isTransitioning = phase === "transitioning"

  return (
    <div 
      className={`fixed z-[100] inset-0 transition-all duration-1000 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      } pointer-events-none`}
    >
      {/* 统一背景层 - 始终全屏，通过 clipPath 实现局部到全屏的无缝切换 */}
      <div 
        className={`absolute left-0 right-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${
          isChoicePhase ? "bg-background/80 backdrop-blur-md" : "bg-white"
        }`}
        style={{
          // 在选择阶段，定位在底部 (320px高度 + 64px菜单偏移)
          bottom: isChoicePhase ? "64px" : "0",
          top: isChoicePhase ? "calc(100% - 384px)" : "0",
          opacity: 1,
          maskImage: isChoicePhase 
            ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)"
            : "none",
          WebkitMaskImage: isChoicePhase 
            ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)"
            : "none",
          // 仅在非选择阶段拦截点击
          pointerEvents: isChoicePhase ? "none" : "auto",
        }}
      />

      {/* 退出按钮 - 仅在交互阶段显示 */}
      {(phase === "interaction" || phase === "result") && (
        <button
          onClick={handleExit}
          className="absolute top-6 right-6 z-50 p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors pointer-events-auto"
          aria-label="Exit"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 退出确认提示 */}
      {showExitConfirm && (
        <div className="absolute top-20 right-6 z-50 border hairline border-foreground bg-background p-4 max-w-xs pointer-events-auto">
          <p className="text-xs font-light mb-2">确定要退出吗？</p>
          <p className="text-[10px] opacity-60 font-light">退出后将无法继续此次占卜</p>
        </div>
      )}

      {/* 核心内容容器 - 始终全屏，通过 transform 模拟位移 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          // 使用 flex 布局但在 choice 阶段向下位移
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // 位置保持稳定，不再从底部滑入
          transform: isChoicePhase 
            ? "translateY(calc(50vh - 224px - 40px))" 
            : "translateY(0)", 
          // 实现高斯模糊渐显效果
          opacity: animationState === 'visible' ? 1 : 0,
          filter: animationState === 'visible' ? 'blur(0px)' : 'blur(10px)',
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
          willChange: "transform, opacity, filter", // 强制开启 GPU 加速
        }}
      >
        {/* 石头 - 核心元素 */}
        <div 
          className={`absolute pointer-events-auto ${isChoicePhase && animationState === 'visible' ? "animate-float-stone" : ""}`}
          style={{
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isChoicePhase 
              ? (animationState === 'visible' || animationState === 'entering' ? 1 : 0)
              : (phase === "exiting" ? 0 : 1),
            transform: isChoicePhase ? "scale(1)" : "scale(1.67)",
            zIndex: 20,
          }}
          onMouseDown={phase === "interaction" ? handleHoldStart : undefined}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={phase === "interaction" ? handleHoldStart : undefined}
          onTouchEnd={handleHoldEnd}
        >
          <Stone3D
            size={120}
            isHolding={isHolding}
            progress={progress}
            revealed={revealed}
            isShaking={isShaking}
          />
        </div>

        {/* 选择阶段的 UI 元素 - 标题/按钮 */}
        <div 
          className="absolute w-full flex flex-col items-center pointer-events-none"
          style={{
            top: "calc(50% + 60px)",
            opacity: (isTransitioning || !isChoicePhase) ? 0 : (animationState === 'visible' || animationState === 'entering' ? 1 : 0),
            transform: (isTransitioning || !isChoicePhase) ? "translateY(40px)" : "translateY(0)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="flex flex-col items-center mb-2">
            <h3 className="text-lg font-light tracking-wide">
              {(animationState === 'visible' || animationState === 'entering') && <InkRevealText text="是否进入Fate Stone" />}
            </h3>
          </div>
          <div className="w-px h-5 bg-foreground/20 mb-2" />
          <div className="flex gap-4 w-full justify-center px-6 max-w-sm pointer-events-auto">
            <button
              onClick={handleAccept}
              className="w-32 border hairline border-foreground py-3 text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors animate-float-button shadow-sm"
            >
              接受
            </button>
            <button
              onClick={handleReject}
              className="w-32 border hairline border-foreground py-3 text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors animate-float-button-delayed shadow-sm"
            >
              拒绝
            </button>
          </div>
        </div>

        {/* 提示文字层 - 绝对定位 */}
        <div 
          className="absolute w-full text-center"
          style={{ 
            top: "calc(50% + 160px)",
            opacity: isTransitioning ? 1 : 0, 
            transition: "opacity 1s",
            pointerEvents: "none"
          }}
        >
          <p className="text-sm opacity-40 font-light animate-pulse">
            正在连接命运之石...
          </p>
        </div>

        {/* 交互阶段提示 - 绝对定位 */}
        <div 
          className="absolute w-full text-center" 
          style={{ 
            top: "calc(50% + 180px)",
            opacity: phase === "interaction" ? 0.6 : 0,
            transform: phase === "interaction" ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s"
          }}
        >
          <p className="text-sm font-light">
            长按石头，直到它揭示答案
          </p>
        </div>

        {/* 结果阶段层 */}
        {phase === "result" && (
          <div 
            className="absolute w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 pointer-events-auto"
            style={{ top: "calc(50% + 140px)" }}
          >
            <p className="text-2xl font-light tracking-widest mb-2">
              {oracle.result}
            </p>
            <p className="text-sm opacity-60 font-light mb-8 text-center max-w-xs">
              {oracle.message}
            </p>

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
