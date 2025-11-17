import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendToGemini } from "../services/gemini.ts";
import type { AssistantPlan, ChatMessage } from "../types/chat.ts";
import { saveChatConversation } from "../services/database.ts";
import type { ChatConversation } from "../types/database.ts";

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

const CHAT_HISTORY_KEY = "luma_chat_history";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const persisted = localStorage.getItem(CHAT_HISTORY_KEY);
      if (persisted) return JSON.parse(persisted);
    } catch(err){}
    return [createMessage(WELCOME_MESSAGE, "assistant")];
  });
  const [plan, setPlan] = useState<AssistantPlan | undefined>(undefined);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string>(crypto.randomUUID());
  const plansRef = useRef<Array<{ headline: string; steps: string[]; createdAt: number }>>([]);

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
        if (sessionPlan) {
          plansRef.current.push({
            headline: sessionPlan.headline,
            steps: sessionPlan.steps,
            createdAt: Date.now(),
          });
        }
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

  // Save conversation to database when messages change (debounced)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
    // Save (cloud/IDB) if needed too (keep old code):
    if (messages.length <= 1) return;
    const timeoutId = setTimeout(() => {
      const conversation: ChatConversation = {
        id: conversationIdRef.current,
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          signal: msg.signal,
        })),
        plans: plansRef.current.length > 0 ? plansRef.current : undefined,
        startedAt: messages[0]?.createdAt || Date.now(),
        lastMessageAt: messages[messages.length - 1]?.createdAt || Date.now(),
        messageCount: messages.length,
      };
      saveChatConversation(conversation).catch((error) => {
        console.error("Failed to save chat conversation:", error);
      });
    }, 2000); // Debounce: save 2 seconds after last message
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const resetConversation = useCallback(() => {
    // Save current conversation before resetting
    if (messages.length > 1) {
      const conversation: ChatConversation = {
        id: conversationIdRef.current,
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          signal: msg.signal,
        })),
        plans: plansRef.current.length > 0 ? plansRef.current : undefined,
        startedAt: messages[0]?.createdAt || Date.now(),
        lastMessageAt: messages[messages.length - 1]?.createdAt || Date.now(),
        messageCount: messages.length,
      };
      saveChatConversation(conversation).catch((error) => {
        console.error("Failed to save chat conversation:", error);
      });
    }
    // Reset localStorage
    localStorage.removeItem(CHAT_HISTORY_KEY);
    // Reset for new conversation
    conversationIdRef.current = crypto.randomUUID();
    plansRef.current = [];
    setMessages([createMessage(WELCOME_MESSAGE, "assistant")]);
    setPlan(undefined);
    setError(null);
  }, [messages]);

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

