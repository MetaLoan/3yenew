"use client"

import { Circle, Sparkles, Music } from "lucide-react"

interface FunctionButtonsProps {
  onStoneClick: () => void
  onTarotClick: () => void
  onEchoClick: () => void
  disabled?: boolean
}

export function FunctionButtons({ 
  onStoneClick, 
  onTarotClick, 
  onEchoClick,
  disabled = false 
}: FunctionButtonsProps) {
  const buttons = [
    { 
      name: "STONE", 
      icon: Circle, 
      onClick: onStoneClick,
      description: "命运之石"
    },
    { 
      name: "TAROT", 
      icon: Sparkles, 
      onClick: onTarotClick,
      description: "塔罗占卜"
    },
    { 
      name: "ECHO", 
      icon: Music, 
      onClick: onEchoClick,
      description: "心灵回响"
    },
  ]

  return (
    <div className="flex gap-4 mb-3 justify-center">
      {buttons.map((btn) => (
        <button
          key={btn.name}
          onClick={btn.onClick}
          disabled={disabled}
          className="flex items-center gap-1.5 py-1 px-2 hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed group opacity-40"
        >
          <btn.icon className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[10px] tracking-wider font-light">
            {btn.name}
          </span>
        </button>
      ))}
    </div>
  )
}

