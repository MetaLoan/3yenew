"use client"

import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import { cn } from "@/lib/utils"

type Phase = "choice" | "transitioning" | "interaction" | "result" | "exiting"

interface ConnectUnifiedProps {
  isVisible: boolean
  onAccept: () => void
  onReject: () => void
  onComplete: (result: any) => void
  onExit: () => void
}

const ringPositions = Array.from({ length: 5 }, (_, index) => {
  const angleDeg = -90 + index * (360 / 5)
  const angleRad = (angleDeg * Math.PI) / 180
  const radius = 32
  const x = 50 + radius * Math.cos(angleRad)
  const y = 50 + radius * Math.sin(angleRad)
  return { top: `${y}%`, left: `${x}%`, x, y }
})

const starOrder = [0, 2, 4, 1, 3]
const starPoints = starOrder.map((index) => `${ringPositions[index].x},${ringPositions[index].y}`).join(" ")

export function ConnectUnified({
  isVisible,
  onAccept,
  onReject,
  onComplete,
  onExit
}: ConnectUnifiedProps) {
  const [phase, setPhase] = useState<Phase>("choice")
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'exiting'>('hidden')

  useEffect(() => {
    if (isVisible) {
      setPhase("choice")
      setAnimationState('hidden')
      const timer = setTimeout(() => {
        setAnimationState('visible')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()
    // 后续步骤由用户指导
    setTimeout(() => {
      setPhase("interaction")
    }, 1200)
  }, [onAccept])

  const handleReject = useCallback(() => {
    setAnimationState('exiting')
    setTimeout(() => {
      onReject()
    }, 500)
  }, [onReject])

  const handleExit = useCallback(() => {
    setPhase("exiting")
    setTimeout(() => {
      onExit()
    }, 500)
  }, [onExit])

  if (!isVisible) return null

  const isChoicePhase = phase === "choice"
  const isTransitioning = phase === "transitioning"

  return (
    <div className={`fixed z-[100] inset-0 transition-all duration-1000 ${phase === "exiting" ? "opacity-0" : "opacity-100"} pointer-events-none`}>
      {/* 统一背景层 */}
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

      {/* 退出按钮 */}
      {(phase === "interaction" || phase === "result") && (
        <button onClick={handleExit} className="absolute top-6 right-6 z-50 p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors pointer-events-auto">
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 核心内容容器 */}
      <div 
        className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center"
        style={{
          transform: isChoicePhase ? "translateY(calc(50vh - 224px - 40px))" : "translateY(0)",
          opacity: animationState === 'visible' ? 1 : 0,
          filter: animationState === 'visible' ? 'blur(0px)' : 'blur(10px)',
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
        }}
      >
        {/* 法阵盘 */}
        <div 
          className={cn(
            "relative rounded-full transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto bg-white border border-foreground animate-[spinSlow_18s_linear_infinite]",
            isChoicePhase ? "w-[120px] h-[120px]" : "w-[320px] h-[320px] md:w-[380px] md:h-[380px]"
          )}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
            <polygon points={starPoints} fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
            {ringPositions.map((pos, i) => (
              <circle key={i} cx={pos.x} cy={pos.y} r="2" fill="currentColor" />
            ))}
          </svg>
        </div>

        {/* UI 元素 */}
        {isChoicePhase && (
          <div 
            className="absolute w-full flex flex-col items-center pointer-events-none"
            style={{ top: "calc(50% + 60px)" }}
          >
             <h3 className="text-lg font-light tracking-wide mb-6">
               <InkRevealText text="是否进入 Connect 磁场连接" />
             </h3>
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
        )}

        <div className="absolute w-full text-center" style={{ top: "calc(50% + 160px)", opacity: isTransitioning ? 1 : 0, transition: "opacity 1s" }}>
          <p className="text-sm opacity-40 font-light animate-pulse">正在初始化磁场连接...</p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-button {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  )
}

