import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import type { ChatMessage, ChatResponse } from "../types/chat.ts";

const DEFAULT_MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are LUMA, a calm, compassionate emotional wellness guide.
- Speak in short, mindful sentences.
- Never mention being an AI model—focus on the user's wellbeing.
- Provide grounding, validation, and gentle prompts when a user seems upset.
- Offer gentle celebration when emotions are bright or positive.
- Respond strictly as JSON with this shape:
{
  "reply": "final assistant message (<=120 words)",
  "tone": {
    "label": "calm|compassionate|encouraging|grounding|uplifting|validating|uncertain",
    "confidence": number between 0 and 1,
    "summary": "one sentence describing the emotional insight",
    "palette": "hex color representing the tone"
  },
  "plan": {
    "headline": "optional micro-coaching title",
    "steps": ["up to three mindful follow-up prompts"]
  }
}
- Omit the "plan" property when no guidance is needed.
- Do not include markdown, comments, code fences, or additional text.`;

let cachedModel: GenerativeModel | null = null;

const getModel = (): GenerativeModel => {
  if (cachedModel) return cachedModel;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment."
    );
  }

  const modelName = import.meta.env.VITE_GEMINI_MODEL ?? DEFAULT_MODEL;
  const client = new GoogleGenerativeAI(apiKey);
  cachedModel = client.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  return cachedModel!;
};

const mapHistory = (messages: ChatMessage[]) =>
  messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

const safeJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(stripped);
  }
};

export const sendToGemini = async (
  messages: ChatMessage[],
  userText: string
): Promise<ChatResponse> => {
  const model = getModel();
  const chat = await model.startChat({
    history: mapHistory(messages),
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      responseMimeType: "application/json",
      maxOutputTokens: 512,
    },
  });

  const result = await chat.sendMessage(userText);
  const raw = result.response?.text();
  if (!raw) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = safeJson(raw);

  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: parsed.reply ?? "",
    createdAt: Date.now(),
    signal: parsed.tone
      ? {
          tone: parsed.tone.label ?? "uncertain",
          confidence: Number(parsed.tone.confidence ?? 0),
          summary: parsed.tone.summary ?? "",
          palette: parsed.tone.palette ?? "#38bdf8",
        }
      : undefined,
  };

  const plan = parsed.plan?.headline
    ? {
        headline: parsed.plan.headline as string,
        steps: Array.isArray(parsed.plan.steps)
          ? (parsed.plan.steps as string[]).slice(0, 3)
          : [],
      }
    : undefined;

  return {
    message: assistantMessage,
    plan,
  };
};

