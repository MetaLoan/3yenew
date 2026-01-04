"use client"

import { Circle, Sparkles, Music, Users } from "lucide-react"

interface FunctionButtonsProps {
  onStoneClick: () => void
  onTarotClick: () => void
  onEchoClick: () => void
  onConnectClick: () => void
  disabled?: boolean
  echoGenerating?: boolean
  echoProgress?: number
}

export function FunctionButtons({ 
  onStoneClick, 
  onTarotClick, 
  onEchoClick,
  onConnectClick,
  disabled = false,
  echoGenerating = false,
  echoProgress = 0
}: FunctionButtonsProps) {
  const buttons = [
    // Stone - 暂时隐藏
    // { 
    //   name: "STONE", 
    //   icon: Circle, 
    //   onClick: onStoneClick,
    //   description: "命运之石"
    // },
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
      description: "心灵回响",
      isEcho: true
    },
    // Connect - 暂时隐藏
    // { 
    //   name: "CONNECT", 
    //   icon: Users, 
    //   onClick: onConnectClick,
    //   description: "磁场连接"
    // },
  ]

  return (
    <div className="flex gap-4 mb-3 justify-center">
      {buttons.map((btn) => {
        const isEchoAndGenerating = btn.isEcho && echoGenerating;
        
        return (
          <button
            key={btn.name}
            onClick={btn.onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 py-1 px-2 hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed group ${isEchoAndGenerating ? 'opacity-100' : 'opacity-40'}`}
            style={isEchoAndGenerating ? {
              background: `linear-gradient(
                90deg,
                #ff6b6b 0%,
                #feca57 15%,
                #48dbfb 30%,
                #ff9ff3 45%,
                #54a0ff 60%,
                #5f27cd 75%,
                #ff6b6b 90%,
                #feca57 100%
              )`,
              backgroundSize: '200% 100%',
              animation: 'holographic-shift 2s linear infinite',
              color: 'white',
              fontWeight: '500'
            } : {}}
          >
            <btn.icon className={`w-3 h-3 ${isEchoAndGenerating ? 'text-white' : ''}`} strokeWidth={1.5} />
            <span className="text-[10px] tracking-wider font-light">
              {isEchoAndGenerating ? `${echoProgress}%` : btn.name}
            </span>
          </button>
        );
      })}
    </div>
  )
}

