"use client"

import { useState, useEffect } from "react"
import { InkRevealText } from "./ink-reveal-text"
import { TarotCardData } from "@/lib/tarot-data"

interface TarotCardProps {
  card: TarotCardData
  onReveal?: () => void
  onComplete?: () => void
  isInteractive?: boolean
  autoParticlize?: boolean
}

export function TarotCard({ card, onReveal, onComplete, isInteractive = true, autoParticlize = false }: TarotCardProps) {
  const [status, setStatus] = useState<"idle" | "flipping" | "revealed" | "pausing" | "particlizing" | "completed">("idle")
  
  const handleFlip = () => {
    if (!isInteractive || status !== "idle") return
    
      setStatus("flipping")
      setTimeout(() => {
        setStatus("revealed")
      if (onReveal) onReveal()
      
      if (autoParticlize) {
        setTimeout(() => {
          setStatus("particlizing")
          setTimeout(() => {
            setStatus("completed")
            if (onComplete) onComplete()
          }, 1000)
        }, 3000) // Wait 3 seconds before dissolving
      }
      }, 600)
  }

  // Create particles for disintegration
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 0.4,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200 - 100, // Float upwards
    size: Math.random() * 3 + 1,
    duration: 0.6 + Math.random() * 0.4
  }))

  return (
    <div className="relative w-48 h-72 perspective-1000 cursor-pointer" onClick={handleFlip}>
      {/* Particle Overlay */}
      {status === "particlizing" && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-1 h-1 bg-foreground rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`, // Start from across the card
                top: `${20 + Math.random() * 60}%`,
                width: p.size,
                height: p.size,
                opacity: 0,
                animation: `particle-out ${p.duration}s ease-out ${p.delay}s forwards`,
                "--tw-translate-x": `${p.x}px`,
                "--tw-translate-y": `${p.y}px`,
              } as any}
            />
          ))}
        </div>
      )}

      <div
        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
          status !== "idle" && status !== "completed" ? (status === "flipping" ? "rotate-y-180" : "rotate-y-180") : ""
        } ${status === "particlizing" ? "opacity-0 scale-110 blur-md" : "opacity-100 scale-100 blur-0"}`}
        style={{
          transition: status === "particlizing" ? "all 0.8s ease-out" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Card Back */}
        <div
          className={`absolute inset-0 border hairline border-foreground rounded backface-hidden bg-background flex items-center justify-center p-4 overflow-hidden ${
            status === "revealed" || status === "pausing" || status === "particlizing" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full h-full border hairline border-foreground/20 rounded-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border hairline border-foreground rounded-full flex items-center justify-center">
              <div className="w-6 h-6 holographic rounded-full opacity-40 animate-pulse" />
            </div>
            <div className="text-[10px]  tracking-[0.2em] opacity-30">Tap to reveal</div>
          </div>
          {/* Decorative pattern for back */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-full aspect-square border-[0.5px] border-foreground rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 border hairline border-foreground rounded backface-hidden rotate-y-180 bg-background overflow-hidden ${
            status === "idle" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full h-full flex flex-col items-center p-0">
            {/* Card Image */}
            <div className="w-full h-48 bg-muted relative overflow-hidden">
              <img 
                src={card.image} 
                alt={card.name}
                className="w-full h-full object-cover grayscale brightness-90 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 p-4 text-center">
              <InkRevealText text={card.name} className="text-sm tracking-widest font-normal" />
              <div className="w-8 h-[0.5px] bg-foreground/30" />
              <InkRevealText text={card.keywords.join(" • ")} className="text-[10px] opacity-40 leading-relaxed" />
            </div>
          </div>
          
          {/* Holographic overlay */}
          <div className="absolute inset-0 holographic opacity-[0.05] pointer-events-none" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes particle-out {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0);
          }
        }
      `}</style>
    </div>
  )
}
