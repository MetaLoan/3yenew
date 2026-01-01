"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import { TarotSpread } from "./tarot-spread"
import { TarotCard } from "./tarot-card"
import type { TarotResult, TarotCardData } from "@/lib/oracle-types"

type Phase = "choice" | "transitioning" | "interaction" | "result" | "exiting"

interface TarotUnifiedProps {
  isVisible: boolean
  onAccept: () => void
  onReject: () => void
  onComplete: (result: TarotResult) => void
  onExit: () => void
}

interface FlyingCard {
  data: TarotCardData
  fromRect: DOMRect
  targetSlot: number
}

export function TarotUnified({ 
  isVisible, 
  onAccept, 
  onReject, 
  onComplete, 
  onExit 
}: TarotUnifiedProps) {
  // 抽牌动画：点击到落槽一气呵成（无停顿）
  const FLY_DURATION_MS = 1200
  const [phase, setPhase] = useState<Phase>("choice")
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden')
  
  const [drawnCards, setDrawnCards] = useState<TarotCardData[]>([])
  const [excludedCardIds, setExcludedCardIds] = useState<string[]>([])
  const [flyingCard, setFlyingCard] = useState<FlyingCard | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const slotRefs = useRef<Array<HTMLDivElement | null>>([])
  const timeoutsRef = useRef<number[]>([])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    if (isVisible) {
      clearScheduled()
      setPhase("choice")
      setDrawnCards([])
      setExcludedCardIds([])
      setFlyingCard(null)
      setShowExitConfirm(false)
      setAnimationState('hidden')
      schedule(() => setAnimationState('visible'), 50)
    }
    return () => {
      clearScheduled()
    }
  }, [isVisible, clearScheduled, schedule])

  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()
    schedule(() => setPhase("interaction"), 1200)
  }, [onAccept, schedule])

  const handleReject = useCallback(() => {
    setAnimationState('exiting')
    schedule(() => onReject(), 500)
  }, [onReject, schedule])

  const handleExit = useCallback(() => {
    if (showExitConfirm) {
      setPhase("exiting")
      schedule(() => onExit(), 500)
    } else {
      setShowExitConfirm(true)
      schedule(() => setShowExitConfirm(false), 3000)
    }
  }, [showExitConfirm, onExit, schedule])

  const handleCardSelect = useCallback((card: TarotCardData, rect: DOMRect) => {
    if (drawnCards.length >= 3 || flyingCard) return
    
    const targetSlot = drawnCards.length
    setFlyingCard({ data: card, fromRect: rect, targetSlot })

    // 立即排除这张卡，防止后续循环再出现
    setExcludedCardIds(prev => [...prev, card.id])

    schedule(() => {
      // 动画结束后才将卡片放入槽位
      setDrawnCards(prev => [...prev, card])
      setFlyingCard(null)
      
      // 如果抽满3张，进入结果页
      if (drawnCards.length === 2) {
        schedule(() => setPhase("result"), 200)
      }
    }, FLY_DURATION_MS)
  }, [drawnCards.length, flyingCard, schedule])

  const handleFinalComplete = useCallback(() => {
    if (drawnCards.length === 0) return
    setPhase("exiting")
    const result: TarotResult = {
      cards: drawnCards,
      interpretation: `三张牌阵揭示了你的过去、现在与未来。`
    }
    schedule(() => onComplete(result), 800)
  }, [drawnCards, onComplete, schedule])

  if (!isVisible) return null

  const isChoicePhase = phase === "choice"
  const isTransitioning = phase === "transitioning"
  const isInteraction = phase === "interaction"

  // 获取槽位中心位置与尺寸，用真实 DOM，保证动画目标准确
  const getSlotMetrics = (slotIndex: number, startW: number, startH: number) => {
    const slotEl = slotRefs.current[slotIndex]
    if (slotEl) {
      const rect = slotEl.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const targetScale = rect.width / startW // 等比缩放到槽位宽度
      return { x: centerX, y: centerY, scale: targetScale }
    }

    // fallback：按窗口估算
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800
    const slotWidth = 96
    const gap = 24
    const totalWidth = slotWidth * 3 + gap * 2
    const startX = (screenWidth - totalWidth) / 2
    const x = startX + slotIndex * (slotWidth + gap) + slotWidth / 2
    const y = 148
    const scale = slotWidth / startW
    return { x, y, scale }
  }

  return (
    <>
    <div className={`fixed z-[100] inset-0 transition-all duration-1000 ${phase === "exiting" ? "opacity-0" : "opacity-100"} pointer-events-none`}>
      <div 
        className={`absolute left-0 right-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${isChoicePhase ? "bg-background/80 backdrop-blur-md" : "bg-white"}`}
        style={{
          bottom: isChoicePhase ? "64px" : "0",
          top: isChoicePhase ? "calc(100% - 384px)" : "0",
          maskImage: isChoicePhase ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          WebkitMaskImage: isChoicePhase ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          pointerEvents: isChoicePhase ? "none" : "auto",
        }}
      />

      {(isInteraction || phase === "result") && (
        <button onClick={handleExit} className="absolute top-6 right-6 z-[110] p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors pointer-events-auto">
          <X className="w-5 h-5" />
        </button>
      )}

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transform: isChoicePhase ? "translateY(calc(50vh - 224px - 40px))" : (isInteraction || isTransitioning) ? "translateY(calc(50vh - 144px - 35px))" : "translateY(0)", 
          opacity: animationState === 'visible' ? 1 : 0,
          filter: animationState === 'visible' ? 'blur(0px)' : 'blur(10px)',
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
          willChange: "transform, opacity, filter",
        }}
      >
        {isInteraction && (
          <div className="absolute top-[80px] left-0 right-0 flex justify-center gap-6 px-6 pointer-events-none z-10">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                ref={(el) => { slotRefs.current[i] = el }}
                className="w-24 h-36 border-[0.5px] border-foreground/10 bg-foreground/[0.02] rounded flex items-center justify-center relative overflow-hidden"
              >
                {drawnCards[i] && (
                  <div className="w-full h-full">
                    <img src={drawnCards[i].image} alt={drawnCards[i].name} className="w-full h-full object-cover grayscale" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div 
          className="relative pointer-events-auto"
          style={{
            transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out",
            opacity: phase === "exiting" ? 0 : 1,
            transform: isChoicePhase ? "scale(0.33)" : "scale(1)",
            zIndex: 20,
            width: '100%',
            height: isChoicePhase ? '320px' : '100%',
          }}
        >
          {(isChoicePhase || isTransitioning || isInteraction) ? (
            <TarotSpread 
              key={isChoicePhase ? "shuffling" : "active"} 
              onSelect={handleCardSelect} 
              disabled={!!flyingCard || drawnCards.length >= 3} 
              initialPhase={isChoicePhase ? "shuffling" : "gathering"}
              excludedCardIds={excludedCardIds}
            />
          ) : phase === "result" ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white pointer-events-auto">
               <div className="flex gap-4 mb-12">
                  {drawnCards.map((card, i) => (
                    <div key={i} className="w-32 h-48 border hairline border-foreground rounded overflow-hidden">
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover grayscale" />
                    </div>
                  ))}
               </div>
               <InkRevealText text="三张牌阵" className="text-xl font-light mb-6" />
               <p className="text-xs opacity-60 max-w-md text-center leading-relaxed mb-8">
                 过去、现在与未来的能量交织，引导着你此刻的困惑与抉择
               </p>
               <button onClick={handleFinalComplete} className="px-12 py-3 border hairline border-foreground text-sm font-light hover:bg-foreground hover:text-background transition-all">
                 Continue
               </button>
            </div>
          ) : null}
        </div>

        {isChoicePhase && (
          <div className="absolute w-full flex flex-col items-center pointer-events-none" style={{ top: "calc(50% + 60px)", opacity: animationState === 'visible' ? 1 : 0 }}>
            <h3 className="text-lg font-light tracking-wide mb-4"><InkRevealText text="是否进入塔罗占卜" /></h3>
            <div className="flex gap-4 pointer-events-auto">
              <button onClick={handleAccept} className="w-32 border hairline border-foreground py-3 text-sm font-light bg-background hover:bg-foreground hover:text-background transition-colors">接受</button>
              <button onClick={handleReject} className="w-32 border hairline border-foreground py-3 text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors">拒绝</button>
            </div>
          </div>
        )}
      </div>

    </div>

    {/* 飞行卡片 - 放在最外层，避免受父层 transform 影响 */}
    {flyingCard && (() => {
      const current = flyingCard
      const startX = flyingCard.fromRect.left
      const startY = flyingCard.fromRect.top
      const startW = flyingCard.fromRect.width
      const startH = flyingCard.fromRect.height
      const slot = getSlotMetrics(current.targetSlot, startW, startH)
      const deltaX = slot.x - (startX + startW / 2)
      const deltaY = slot.y - (startY + startH / 2)

      return (
        <>
          <div className="fixed inset-0 pointer-events-none z-[300]">
            <div
              className="absolute pointer-events-none"
              style={{
                left: startX,
                top: startY,
                width: startW,
                height: startH,
                animation: `fly-to-slot-${current.targetSlot} ${FLY_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                transformOrigin: 'center center',
              }}
            >
              {/* 飞行时显示牌背，和牌组里的牌一致 */}
              <div className="w-full h-full border hairline border-foreground rounded bg-background flex items-center justify-center p-3 overflow-hidden shadow-xl">
                <div className="w-full h-full border hairline border-foreground rounded-sm flex flex-col items-center justify-center relative">
                  <svg width="80" height="80" viewBox="0 0 200 200" className="opacity-90">
                    <defs>
                      <clipPath id="flyingEyeClip">
                        <path d="M 10 100 Q 100 45 190 100 Q 100 155 10 100 Z" />
                      </clipPath>
                    </defs>
                    <path d="M 0 100 L 30 100 M 170 100 L 200 100" stroke="black" strokeWidth="1.5" opacity="0.5" />
                    <path d="M 10 100 Q 100 45 190 100 Q 100 155 10 100 Z" fill="none" stroke="black" strokeWidth="2.5" />
                    <path d="M 18 100 Q 100 52 182 100 Q 100 148 18 100 Z" fill="none" stroke="black" strokeWidth="1.2" opacity="0.5" />
                    <g clipPath="url(#flyingEyeClip)">
                      <circle cx="100" cy="100" r="42" fill="none" stroke="black" strokeWidth="2" />
                      <circle cx="100" cy="100" r="38" fill="none" stroke="black" strokeWidth="1" strokeDasharray="3 3" />
                      <ellipse cx="100" cy="100" rx="10" ry="32" fill="black" />
                      <ellipse cx="100" cy="100" rx="2" ry="24" fill="white" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <style jsx global>{`
            @keyframes fly-to-slot-${current.targetSlot} {
              0% {
                transform: translate(0px, 0px);
              }
              35% {
                transform: translate(0px, -100px);
              }
              100% {
                transform: translate(${deltaX}px, ${deltaY}px);
                opacity: 1;
              }
            }
          `}</style>
        </>
      )
    })()}
    </>
  )
}
