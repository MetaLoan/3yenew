"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import { TarotSpread } from "./tarot-spread"
import { TarotCard } from "./tarot-card"
import type { TarotResult } from "@/lib/oracle-types"
import type { TarotCardData } from "@/lib/tarot-data"

type Phase = "choice" | "transitioning" | "interaction" | "result" | "exiting"

interface TarotUnifiedProps {
  isVisible: boolean
  onAccept: () => void
  onReject: () => void
  onComplete: (result: TarotResult) => void
  onExit: () => void
}

export function TarotUnified({ 
  isVisible, 
  onAccept, 
  onReject, 
  onComplete, 
  onExit 
}: TarotUnifiedProps) {
  const [phase, setPhase] = useState<Phase>("choice")
  const [isEntering, setIsEntering] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  // 塔罗交互状态
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null)
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden')

  // 重置状态
  useEffect(() => {
    if (isVisible) {
      setIsEntering(true)
      setPhase("choice")
      setSelectedCard(null)
      setShowExitConfirm(false)
      setAnimationState('hidden')
      
      const timer = setTimeout(() => {
        setAnimationState('visible')
        setIsEntering(false)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // 处理接受
  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()
    
    setTimeout(() => {
      setPhase("interaction")
    }, 1200)
  }, [onAccept])

  // 处理拒绝
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

  // 处理塔罗牌选择
  const handleCardSelect = useCallback((card: TarotCardData) => {
    setSelectedCard(card)
    setPhase("result")
  }, [])

  // 处理结果完成
  const handleComplete = useCallback(() => {
    if (!selectedCard) return
    
    setPhase("exiting")
    
    const result: TarotResult = {
      ...selectedCard,
      summary: `The ${selectedCard.name} reveals: ${selectedCard.meaning}`
    }
    
    setTimeout(() => {
      onComplete(result)
    }, 800)
  }, [selectedCard, onComplete])

  if (!isVisible) return null

  const isChoicePhase = phase === "choice"
  const isTransitioning = phase === "transitioning"

  return (
    <div 
      className={`fixed z-[100] inset-0 transition-all duration-1000 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      } pointer-events-none`}
    >
      {/* 统一背景层 */}
      <div 
        className={`absolute left-0 right-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${
          isChoicePhase ? "bg-background/80 backdrop-blur-md" : "bg-white"
        }`}
        style={{
          bottom: isChoicePhase ? "64px" : "0",
          top: isChoicePhase ? "calc(100% - 384px)" : "0",
          opacity: 1,
          maskImage: isChoicePhase 
            ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)"
            : "none",
          WebkitMaskImage: isChoicePhase 
            ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)"
            : "none",
          pointerEvents: isChoicePhase ? "none" : "auto",
        }}
      />

      {/* 退出按钮 */}
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

      {/* 核心内容容器 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isChoicePhase 
            ? "translateY(calc(50vh - 224px - 40px))" 
            : (phase === "interaction" || phase === "transitioning")
              ? "translateY(calc(50vh - 144px - 35px))"
              : "translateY(0)", 
          opacity: animationState === 'visible' ? 1 : 0,
          filter: animationState === 'visible' ? 'blur(0px)' : 'blur(10px)',
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
          willChange: "transform, opacity, filter",
        }}
      >
        <div 
          className="relative pointer-events-auto"
          style={{
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: phase === "exiting" ? 0 : 1,
            transform: isChoicePhase ? "scale(0.33)" : "scale(1)",
            zIndex: 20,
            width: '100%',
            height: isChoicePhase ? '320px' : '100%',
          }}
        >
          {(isChoicePhase || isTransitioning || phase === "interaction") ? (
            <TarotSpread 
              key={isChoicePhase ? "shuffling" : "expanding"}
              onSelect={handleCardSelect} 
              initialPhase={isChoicePhase ? "shuffling" : "gathering"} 
            />
          ) : phase === "result" && selectedCard ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              <TarotCard card={selectedCard} isInteractive={false} />
              <div className="mt-8 flex flex-col items-center max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <p className="text-xl font-light tracking-widest mb-2 uppercase">
                  {selectedCard.name}
                </p>
                <p className="text-xs opacity-60 font-light mb-4 tracking-widest">
                  {selectedCard.keywords.join(" • ")}
                </p>
                <p className="text-sm font-light mb-8 leading-relaxed opacity-80">
                  {selectedCard.meaning}
                </p>
                <button
                  onClick={handleComplete}
                  className="px-12 py-3 border hairline border-foreground text-sm font-light hover:bg-foreground hover:text-background transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 选择阶段的 UI 元素 */}
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
              {(animationState === 'visible' || animationState === 'entering') && <InkRevealText text="是否进入塔罗占卜" />}
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

        {/* 提示文字层 */}
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
            正在洗牌中...
          </p>
        </div>
      </div>
    </div>
  )
}

