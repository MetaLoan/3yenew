"use client"

import { useEffect, useState } from "react"

export function DestinySymbol() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Abstract Constellation/Symbol */}
        <svg width="200" height="200" viewBox="0 0 100 100" className="text-foreground">
          {/* Constellation Lines */}
          <line 
            x1="20" y1="30" x2="50" y2="10" 
            stroke="currentColor" strokeWidth="0.5" 
            className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-20' : 'opacity-0'}`}
          />
          <line 
            x1="50" y1="10" x2="80" y2="40" 
            stroke="currentColor" strokeWidth="0.5" 
            className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-20' : 'opacity-0'}`}
          />
          <line 
            x1="80" y1="40" x2="60" y2="80" 
            stroke="currentColor" strokeWidth="0.5" 
            className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-20' : 'opacity-0'}`}
          />
          <line 
            x1="60" y1="80" x2="20" y2="60" 
            stroke="currentColor" strokeWidth="0.5" 
            className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-20' : 'opacity-0'}`}
          />
          <line 
            x1="20" y1="60" x2="20" y2="30" 
            stroke="currentColor" strokeWidth="0.5" 
            className={`transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-20' : 'opacity-0'}`}
          />

          {/* Glowing Points */}
          {[
            { x: 20, y: 30, d: 200 },
            { x: 50, y: 10, d: 400 },
            { x: 80, y: 40, d: 600 },
            { x: 60, y: 80, d: 800 },
            { x: 20, y: 60, d: 1000 },
          ].map((pt, i) => (
            <g key={i}>
              <circle 
                cx={pt.x} cy={pt.y} r="1" 
                fill="currentColor"
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                style={{ transitionDelay: `${pt.d}ms` }}
              />
              <circle 
                cx={pt.x} cy={pt.y} r="3" 
                fill="currentColor"
                className="opacity-10 animate-pulse"
              />
            </g>
          ))}
          
          {/* Central Eye-like symbol */}
          <circle 
            cx="50" cy="45" r="15" 
            stroke="currentColor" strokeWidth="0.5" fill="none" 
            className={`transition-all duration-1000 delay-[1.5s] ${isVisible ? 'opacity-10' : 'opacity-0'}`}
          />
          <path 
            d="M35 45 Q50 30 65 45 Q50 60 35 45" 
            stroke="currentColor" strokeWidth="0.5" fill="none"
            className={`transition-all duration-1000 delay-[1.8s] ${isVisible ? 'opacity-30' : 'opacity-0'}`}
          />
          <circle 
            cx="50" cy="45" r="2" 
            fill="currentColor" 
            className={`transition-all duration-1000 delay-[2s] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
        </svg>

        {/* Floating Holographic Glow */}
        <div className="absolute inset-0 holographic-glow opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Destiny Slice Recorded</p>
        <div className="text-xs font-light opacity-20">Your resonance has been etched into the timeline.</div>
      </div>
    </div>
  )
}



