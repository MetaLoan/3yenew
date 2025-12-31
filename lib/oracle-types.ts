// Oracle 消息类型定义

export type MessageType = 
  | "text"           // 普通文本消息
  | "function-trigger"  // 功能触发消息
  | "function-embed"     // 功能嵌入组件
  | "function-result"   // 功能结果消息

export type FunctionName = "stone" | "tarot" | "echo" | "connect"

export interface BaseMessage {
  id: number
  timestamp: string
  isUser: boolean
}

export interface TextMessage extends BaseMessage {
  type: "text"
  content: string
  contextHint?: string
}

export interface FunctionTriggerMessage extends BaseMessage {
  type: "function-trigger"
  functionName: FunctionName
  triggerText: string  // 用户原始输入
  oracleResponse?: string  // Oracle的确认回复
}

export interface FunctionEmbedMessage extends BaseMessage {
  type: "function-embed"
  functionName: FunctionName
  oracleResponse?: string  // Oracle的引导消息
}

export interface FunctionResultMessage extends BaseMessage {
  type: "function-result"
  functionName: FunctionName
  result: any  // 功能返回的结果数据
  summary: string  // Oracle对结果的解读
}

export interface ChoiceMessage extends BaseMessage {
  type: "choice"
  question?: string  // Oracle的问题或建议（可选，因为可能已经在之前的消息中）
}

export interface SystemMessage extends BaseMessage {
  type: "system"
  content: string
}

export type Message = TextMessage | FunctionTriggerMessage | FunctionEmbedMessage | FunctionResultMessage | ChoiceMessage | SystemMessage

// 意图识别结果
export interface IntentDetection {
  intent: FunctionName | null
  confidence: number
}

// STONE 功能结果类型
export interface StoneResult {
  result: "YES" | "NO" | "WAIT" | "SILENCE" | "RELEASE"
  message: string
  choice?: "follow" | "rebel"
}

