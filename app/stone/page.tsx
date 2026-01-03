"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { InkRevealText } from "@/components/ink-reveal-text"
import { FateStone } from "@/components/fate-stone"
import { TarotCard } from "@/components/tarot-card"
import { TarotSpread } from "@/components/tarot-spread"
import { DestinySymbol } from "@/components/destiny-symbol"
import { TarotCardData } from "@/lib/tarot-data"

export default function StonePage() {
  const [mode, setMode] = useState<"stone" | "tarot">("stone")
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleReset = () => {
    setSelectedCard(null)
    setIsRevealed(false)
    setIsCompleted(false)
  }

  return (
    <main className="h-screen bg-background overflow-hidden flex flex-col">
      <div className="h-[calc(100vh-84px)] overflow-hidden">
        <div className="p-6 pt-6 max-w-screen-sm mx-auto flex flex-col h-full">
          <div className="shrink-0 mb-2 text-center relative z-10">
            <h1 className="text-4xl font-light mb-4">
              <InkRevealText 
                key={mode} 
                text={mode === "stone" ? "The Fate Stone" : "Tarot Reading"} 
              />
            </h1>
            <p className="text-xs opacity-60 font-light tracking-wide mb-4">
              <InkRevealText 
                key={`sub-${mode}`}
                text={mode === "stone" ? "When destiny calls for an answer" : "Reveal the cards of your fate"} 
              />
            </p>

            {/* Mode Switcher */}
            <div className="flex items-center justify-center gap-6">
               <button 
                  onClick={() => { setMode("stone"); handleReset(); }}
                  className={`text-xs uppercase tracking-widest transition-all duration-500 ${
                    mode === "stone" ? "opacity-100 border-b border-foreground pb-1" : "opacity-30 pb-1 border-b border-transparent hover:opacity-60"
                  }`}
               >
                 Stone
               </button>
               <span className="text-xs opacity-10">|</span>
               <button 
                  onClick={() => setMode("tarot")}
                  className={`text-xs uppercase tracking-widest transition-all duration-500 ${
                    mode === "tarot" ? "opacity-100 border-b border-foreground pb-1" : "opacity-30 pb-1 border-b border-transparent hover:opacity-60"
                  }`}
               >
                 Tarot
               </button>
            </div>
          </div>

          <div className="flex-1 relative z-0">
            {mode === "stone" ? (
              <div className="animate-in fade-in duration-700 h-full">
                <FateStone />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center pt-4 animate-in fade-in zoom-in-95 duration-700 -mx-6">
                 {!selectedCard ? (
                   <TarotSpread onSelect={(card) => setSelectedCard(card)} />
                 ) : isCompleted ? (
                   <div className="animate-in fade-in zoom-in-90 duration-1000">
                     <DestinySymbol />
                 <div className="mt-12 text-center">
                        <button 
                          onClick={handleReset}
                          className="text-[10px] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity"
                        >
                          Return to Void
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
                     <TarotCard 
                        card={selectedCard} 
                        onReveal={() => setIsRevealed(true)} 
                        autoParticlize={true}
                        onComplete={() => setIsCompleted(true)}
                     />
                     
                     {isRevealed && (
                       <div className="max-w-xs text-center space-y-4 px-4 animate-out fade-out fill-mode-forwards duration-1000 delay-[2s]">
                         <div className="h-[0.5px] w-12 bg-foreground/20 mx-auto" />
                         <p className="text-xs leading-relaxed opacity-70 italic font-light">
                           <InkRevealText text={selectedCard.meaning} staggerDelay={20} />
                   </p>
                 </div>
                     )}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
