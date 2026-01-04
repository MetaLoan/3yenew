"use client"

import { FateStoneEmbedded } from "./fate-stone-embedded"
import type { FunctionName, StoneResult } from "@/lib/oracle-types"

interface FunctionEmbedProps {
  functionName: FunctionName
  onComplete: (functionName: FunctionName, result: any) => void
  onCancel?: () => void
}

export function FunctionEmbed({ functionName, onComplete, onCancel }: FunctionEmbedProps) {
  const handleStoneComplete = (result: StoneResult) => {
    onComplete("stone", result)
  }

  switch (functionName) {
    case "stone":
      return (
        <FateStoneEmbedded 
          onComplete={handleStoneComplete}
          onCancel={onCancel}
          embedded={true}
        />
      )
    
    case "tarot":
      // TODO: 实现 Tarot 嵌入版本
      return <div>Tarot coming soon...</div>
    
    case "echo":
      // TODO: 实现 Echo 嵌入版本
      return <div>Echo coming soon...</div>
    
    case "connect":
      // TODO: 实现 Connect 嵌入版本
      return <div>Connect coming soon...</div>
    
    default:
      return null
  }
}


