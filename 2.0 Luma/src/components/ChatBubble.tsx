import type { ChatMessage } from "../types/chat.ts";

type ChatBubbleProps = {
  message: ChatMessage;
};

const toneColors: Record<string, string> = {
  calm: "from-emerald-500/90 to-teal-400/80",
  compassionate: "from-rose-400/90 to-orange-300/80",
  encouraging: "from-amber-400/90 to-lime-300/80",
  grounding: "from-slate-500/90 to-emerald-500/80",
  uplifting: "from-sky-400/90 to-cyan-300/80",
  validating: "from-violet-400/90 to-indigo-400/80",
  uncertain: "from-slate-400/80 to-slate-500/80",
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isAssistant = message.role === "assistant";

  const toneClass =
    (message.signal && toneColors[message.signal.tone]) ??
    toneColors.uncertain;

  return (
    <div
      className={`flex w-full gap-3 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`relative max-w-[85%] rounded-3xl px-5 py-4 text-sm shadow-lg md:text-base ${
          isAssistant
            ? `bg-gradient-to-br text-white ${toneClass}`
            : "bg-white/90 text-slate-900"
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {message.signal && (
          <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-wide opacity-80">
            <span>{message.signal.tone}</span>
            <span>{Math.round(message.signal.confidence * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

