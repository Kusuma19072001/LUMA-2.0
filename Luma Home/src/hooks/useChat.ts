import { useCallback, useMemo, useState } from "react";
import { sendToGemini } from "../services/gemini.ts";
import type { AssistantPlan, ChatMessage } from "../types/chat.ts";

const createMessage = (
  content: string,
  role: ChatMessage["role"]
): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  createdAt: Date.now(),
});

const WELCOME_MESSAGE = `Hi, I'm LUMA. Whenever you're ready, share what's on your mind.
You can talk about how you’re feeling, reflect on your day, or ask for a gentle nudge.`;

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(WELCOME_MESSAGE, "assistant"),
  ]);
  const [plan, setPlan] = useState<AssistantPlan | undefined>(undefined);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isThinking) return;

      const userMessage = createMessage(text, "user");
      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setIsThinking(true);

      try {
        const history = [...messages, userMessage];
        const { message: assistantMessage, plan: sessionPlan } =
          await sendToGemini(history, text);

        setMessages((prev) => [...prev, assistantMessage]);
        setPlan(sessionPlan ?? undefined);
      } catch (err) {
        const fallback = createMessage(
          "I’m having trouble reaching my mindful space right now. Could you try again in a moment?",
          "assistant"
        );
        setMessages((prev) => [...prev, fallback]);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages]
  );

  const resetConversation = useCallback(() => {
    setMessages([createMessage(WELCOME_MESSAGE, "assistant")]);
    setPlan(undefined);
    setError(null);
  }, []);

  const latestSignal = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant" && message.signal)
        ?.signal,
    [messages]
  );

  return {
    messages,
    plan,
    latestSignal,
    isThinking,
    error,
    sendMessage,
    resetConversation,
  };
};

