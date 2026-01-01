"use client"

import { useEffect, useRef, useState } from "react"
import { tarotCards, TarotCardData } from "@/lib/tarot-data"
import { InkRevealText } from "./ink-reveal-text"

interface TarotSpreadProps {
  onSelect: (card: TarotCardData) => void
  initialPhase?: Phase
}

type Phase = "shuffling" | "gathering" | "expanding" | "scrolling" | "selected"

export function TarotSpread({ onSelect, initialPhase = "shuffling" }: TarotSpreadProps) {
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [cards, setCards] = useState<TarotCardData[]>(() => {
    // 立即初始化卡牌，避免第一帧为空导致动画失效
    return [...tarotCards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 11)
  })
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [frozenTransforms, setFrozenTransforms] = useState<string[] | null>(null)
  const [gatherArmed, setGatherArmed] = useState(false)

  // 不再需要在 useEffect 中初始化
  useEffect(() => {
    // 已经初始化过了，但如果外部想重新洗牌可以保留逻辑
    // 如果是初始挂载且已经是 gathering 状态，确保触发向 expanding 的转换
  }, [])

  // 点击洗牌时冻结当前位置
  const handleDeckClick = () => {
    if (phase !== "shuffling") return

    const transforms = cardRefs.current.map((el) => {
      if (!el) return "none"
      const t = window.getComputedStyle(el).transform
      return t && t !== "none" ? t : "none"
    })
    setFrozenTransforms(transforms)
    setGatherArmed(false)
    setPhase("gathering")
  }

  // 聚拢阶段
  useEffect(() => {
    if (phase !== "gathering") return

    const raf = requestAnimationFrame(() => {
      setGatherArmed(true)
    })

    const t = window.setTimeout(() => {
      setPhase("expanding")
    }, 600)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [phase])

  // 横向展开阶段
  useEffect(() => {
    if (phase !== "expanding") return

    const t = window.setTimeout(() => {
      setPhase("scrolling")
    }, 800)

    return () => {
      window.clearTimeout(t)
    }
  }, [phase])

  const handleCardClick = (card: TarotCardData, index: number) => {
    if (phase !== "scrolling" || selectedIndex !== null) return
    setSelectedIndex(index)
    setPhase("selected")
    setTimeout(() => {
      onSelect(card)
    }, 600)
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* ==================== 洗牌阶段（使用 absolute 定位） ==================== */}
      {phase === "shuffling" && (
        <div 
          className="relative perspective-1000 cursor-pointer"
          onClick={handleDeckClick}
          style={{ width: "calc(192px + 240px)", height: "calc(288px + 80px)", padding: "40px 120px" }}
        >
          {cards.map((card, index) => {
            const isOdd = index % 2 === 1
            return (
              <div
                key={card.id}
                ref={(el) => { cardRefs.current[index] = el }}
                className={`absolute w-48 h-72 ${isOdd ? "animate-shuffle-card-1" : "animate-shuffle-card-2"}`}
                style={{
                  top: "40px",
                  left: "120px",
                  animationDelay: `${index * 0.1}s`,
                  zIndex: 10 + index,
                }}
              >
                <CardBack index={index} />
              </div>
            )
          })}
        </div>
      )}

      {/* ==================== 聚拢 + 展开 + 滚动阶段（统一容器） ==================== */}
      {(phase === "gathering" || phase === "expanding" || phase === "scrolling" || phase === "selected") && (
        <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
          <div 
            className={`relative w-48 h-72 ${phase === "scrolling" ? "animate-scroll-left" : ""}`}
            style={{
              animationPlayState: phase === "selected" ? "paused" : "running",
            }}
          >
            {/* 始终渲染 44 张牌，聚拢/展开阶段只显示前 11 张 */}
            {[...cards, ...cards, ...cards, ...cards].map((card, index) => {
              const isSelected = selectedIndex === index
              const isHidden = selectedIndex !== null && !isSelected
              const cardIndex = index % 11
              const isFirstRound = index < 11
              
              let translateX = 0
              let extraTransform = ""
              let zIndex = index
              let transition = "all 500ms ease-out"
              let opacity = 1

              if (phase === "gathering") {
                if (!isFirstRound) {
                  // 非第一轮的牌隐藏
                  opacity = 0
                  translateX = 0
                  extraTransform = "scale(0.85)"
                } else {
                  const frozen = frozenTransforms?.[index] ?? "none"
                  // 聚拢：收到中心
                  translateX = 0
                  extraTransform = gatherArmed ? "scale(0.85)" : frozen
                  zIndex = 20 - index
                  transition = gatherArmed
                    ? `all 500ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 30}ms`
                    : "none"
                }
              } else if (phase === "expanding") {
                if (!isFirstRound) {
                  // 非第一轮的牌隐藏
                  opacity = 0
                  translateX = (cardIndex - 5) * 48 + Math.floor(index / 11) * (11 * 48)
                  extraTransform = "scale(0.85)"
                } else {
                  // 展开：从中心向两侧（11张牌，中心是第6张，index=5）
                  translateX = (index - 5) * 48
                  extraTransform = "scale(0.85)"
                  zIndex = index
                  transition = `all 700ms cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 50}ms`
                }
              } else {
                // scrolling / selected - 所有牌都显示
                translateX = (cardIndex - 5) * 48 + Math.floor(index / 11) * (11 * 48)
                opacity = isHidden ? 0 : 1
                extraTransform = isSelected 
                  ? "scale(1.15) translateY(-30px)" 
                  : `scale(0.85) ${isHidden ? "translateY(20px)" : ""}`
                zIndex = isSelected ? 100 : index
              }

              // 使用 translateX 而不是 left，这样不会受 frozen transform 影响
              const transform = phase === "gathering" && !gatherArmed && isFirstRound
                ? extraTransform 
                : `translateX(${translateX}px) ${extraTransform}`

              return (
                <div
                  key={`card-${index}`}
                  className="absolute inset-0"
                  style={{
                    transform,
                    zIndex,
                    transition,
                    opacity,
                    cursor: phase === "scrolling" ? "pointer" : "default",
                  }}
                  onClick={phase === "scrolling" ? () => handleCardClick(card, index) : undefined}
                >
                  <CardBack index={cardIndex} isInteractive={phase === "scrolling"} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Instruction text */}
      <div className="absolute bottom-[-15px] left-0 right-0 text-center pointer-events-none z-20">
        {phase === "shuffling" && null}
        {(phase === "gathering" || phase === "expanding") && (
          <p className="text-xs opacity-60 tracking-widest uppercase">
            ...
          </p>
        )}
        {phase === "scrolling" && (
          <p className="text-xs opacity-100 font-bold">
            <InkRevealText text="Choose your card" />
          </p>
        )}
        {phase === "selected" && (
          <p className="text-xs opacity-60 tracking-widest uppercase">
            Revealing...
          </p>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes shuffle-card-1 {
          0%, 40% {
            transform: translateX(0) rotate(0deg) rotateY(0deg);
            z-index: 10;
          }
          55% {
            transform: translateX(120px) rotate(25deg) rotateY(40deg);
            z-index: 50;
          }
          70%, 100% {
            transform: translateX(0) rotate(0deg) rotateY(0deg);
            z-index: 30;
          }
        }
        
        @keyframes shuffle-card-2 {
          0%, 40% {
            transform: translateX(0) rotate(0deg) rotateY(0deg);
            z-index: 11;
          }
          55% {
            transform: translateX(-120px) rotate(-25deg) rotateY(-40deg);
            z-index: 50;
          }
          70%, 100% {
            transform: translateX(0) rotate(0deg) rotateY(0deg);
            z-index: 31;
          }
        }
        
        /* 向左无限滚动瀑布流 */
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-528px); /* 11 * 48px = 一轮牌的宽度 */
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 15s linear infinite;
        }
        
        @keyframes bounce-text {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
        
        .animate-shuffle-card-1 {
          animation: shuffle-card-1 2.5s ease-in-out infinite;
        }
        
        .animate-shuffle-card-2 {
          animation: shuffle-card-2 2.5s ease-in-out infinite;
        }
        
        .animate-bounce-text {
          animation: bounce-text 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// 卡牌背面组件
function CardBack({ index, isInteractive = false }: { index: number; isInteractive?: boolean }) {
  return (
    <div className={`w-full h-full border hairline border-foreground rounded bg-background flex items-center justify-center p-3 overflow-hidden shadow-lg transition-all ${isInteractive ? "hover:scale-105 hover:shadow-xl" : ""}`}>
      <div className="w-full h-full border hairline border-foreground rounded-sm flex flex-col items-center justify-center relative">
        <svg width="80" height="80" viewBox="0 0 200 200" className="opacity-90">
          <defs>
            <clipPath id={`eyeClip-${index}`}>
              <path d="M 10 100 Q 100 45 190 100 Q 100 155 10 100 Z" />
            </clipPath>
          </defs>
          <path d="M 0 100 L 30 100 M 170 100 L 200 100" stroke="black" strokeWidth="1.5" opacity="0.5" />
          <path d="M 10 100 Q 100 45 190 100 Q 100 155 10 100 Z" fill="none" stroke="black" strokeWidth="2.5" />
          <path d="M 18 100 Q 100 52 182 100 Q 100 148 18 100 Z" fill="none" stroke="black" strokeWidth="1.2" opacity="0.5" />
          <g clipPath={`url(#eyeClip-${index})`}>
            <circle cx="100" cy="100" r="42" fill="none" stroke="black" strokeWidth="2" />
            <circle cx="100" cy="100" r="38" fill="none" stroke="black" strokeWidth="1" strokeDasharray="3 3" />
            {[...Array(48)].map((_, i) => (
              <line key={i} x1="100" y1="100" x2={100 + Math.cos(i * 7.5 * Math.PI / 180) * 42} y2={100 + Math.sin(i * 7.5 * Math.PI / 180) * 42} stroke="black" strokeWidth="0.8" opacity="0.3" />
            ))}
            <ellipse cx="100" cy="100" rx="10" ry="32" fill="black" />
            <ellipse cx="100" cy="100" rx="2" ry="24" fill="white" />
          </g>
          <g stroke="black" strokeWidth="1.2" opacity="0.5">
            <line x1="20" y1="95" x2="35" y2="85" />
            <line x1="20" y1="105" x2="35" y2="115" />
            <line x1="180" y1="95" x2="165" y2="85" />
            <line x1="180" y1="105" x2="165" y2="115" />
          </g>
        </svg>
      </div>
    </div>
  )
}
