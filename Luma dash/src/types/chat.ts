export type EmotionTone =
  | "calm"
  | "compassionate"
  | "encouraging"
  | "grounding"
  | "uplifting"
  | "validating"
  | "uncertain";

export type EmotionSignal = {
  tone: EmotionTone;
  confidence: number;
  summary: string;
  palette: string;
};

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  signal?: EmotionSignal;
  isStreaming?: boolean;
}

export interface AssistantPlan {
  headline: string;
  steps: string[];
}

export interface ChatResponse {
  message: ChatMessage;
  plan?: AssistantPlan;
}

