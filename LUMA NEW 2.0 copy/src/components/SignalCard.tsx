import type { EmotionSignal } from "../types/chat.ts";

type SignalCardProps = {
  signal?: EmotionSignal;
};

export const SignalCard = ({ signal }: SignalCardProps) => {
  if (!signal) return null;

  return (
    <aside
      className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur"
      style={{ borderColor: signal.palette }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
          Emotional Compass
        </h3>
        <span
          className="h-3 w-3 rounded-full shadow-inner"
          style={{ backgroundColor: signal.palette }}
        />
      </div>
      <p className="mt-4 text-lg font-medium capitalize text-slate-900">
        {signal.tone}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {signal.summary}
      </p>
      <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">
        Confidence · {Math.round(signal.confidence * 100)}%
      </div>
    </aside>
  );
};

