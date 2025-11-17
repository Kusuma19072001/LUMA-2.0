import type { ChatMessage } from "../types/chat.ts";

type ChatBubbleProps = {
  message: ChatMessage;
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex w-full gap-3 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`relative max-w-[85%] overflow-hidden rounded-[28px] border transition-all duration-300 ease-out motion-safe:animate-bubbleIn ${
          isAssistant
            ? "border-white/70 bg-gradient-to-br from-[#D9EAFD] via-[#EAF3FF] to-white/95 px-6 py-5 text-[#3C5B80] shadow-[0_22px_45px_-32px_rgba(73,116,161,0.6)]"
            : "border-[#C7E8DD]/80 bg-white px-6 py-5 text-[#356C63] shadow-[0_20px_40px_-30px_rgba(74,157,143,0.55)]"
        }`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/40 via-transparent to-white/20 opacity-70" aria-hidden />
        <p className="relative whitespace-pre-wrap text-[0.97rem] leading-relaxed tracking-[0.01em]">
          {message.content}
        </p>

        {message.signal && (
          <div className="relative mt-4 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.25em] text-[#3C5B80]/70">
            <span>{message.signal.tone}</span>
            <span>{Math.round(message.signal.confidence * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

