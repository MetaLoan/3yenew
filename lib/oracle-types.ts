export type FunctionName = "stone" | "tarot" | "echo" | "connect";

export interface StoneResult {
  result: string;
  message: string;
  choice?: "follow" | "rebel";
}

export interface TarotResult {
  cards: TarotCardData[];
  orientations: ('upright' | 'reversed')[];
  name: string;      // 牌面名称摘要
  meaning: string;   // 牌面含义摘要
  summary: string;   // 完整解读
  interpretation?: string;
}

export interface TarotCardData {
  id: string;
  name: string;
  image: string;
  keywords: string[];
  meaning: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

interface BaseMessage {
  id: number;
  timestamp: string;
  isUser: boolean;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
  contextHint?: string;
}

export interface FunctionTriggerMessage extends BaseMessage {
  type: "function-trigger";
  functionName: FunctionName;
  triggerText: string;
  oracleResponse?: string;
}

export interface FunctionResultMessage extends BaseMessage {
  type: "function-result";
  functionName: FunctionName;
  result: any;
  summary?: string;
}

export interface FunctionEmbedMessage extends BaseMessage {
  type: "function-embed";
  functionName: FunctionName;
  oracleResponse?: string;
}

export interface ChoiceMessage extends BaseMessage {
  type: "choice";
  prompt: string;
  choices: { label: string; value: string }[];
}

export interface SystemMessage extends BaseMessage {
  type: "system";
  content: string;
}

export type Message =
  | TextMessage
  | FunctionTriggerMessage
  | FunctionResultMessage
  | FunctionEmbedMessage
  | ChoiceMessage
  | SystemMessage;
