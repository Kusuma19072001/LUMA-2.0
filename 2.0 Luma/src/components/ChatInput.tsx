import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Mic, SendHorizontal } from "lucide-react";

type ChatInputProps = {
  disabled?: boolean;
  onSend: (message: string) => Promise<void> | void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  supportsVoice?: boolean;
  voiceDraft?: string | null;
};

export const ChatInput = ({
  disabled,
  onSend,
  onVoiceToggle,
  isListening,
  supportsVoice,
  voiceDraft,
}: ChatInputProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVoiceEnabled = supportsVoice && onVoiceToggle;

  useEffect(() => {
    if (typeof voiceDraft === "string") {
      setDraft(voiceDraft);
    }
  }, [voiceDraft]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setIsSubmitting(true);
    try {
      await onSend(value);
      setDraft("");
      formRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative flex w-full items-center gap-3 rounded-3xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-lg focus-within:border-emerald-400"
    >
      <button
        type="button"
        className={`rounded-full p-2 transition ${
          isListening
            ? "bg-rose-100 text-rose-600"
            : "bg-emerald-100/70 text-emerald-600 hover:bg-emerald-200"
        } ${!isVoiceEnabled ? "cursor-not-allowed opacity-40" : ""}`}
        disabled={!isVoiceEnabled}
        onClick={isVoiceEnabled ? onVoiceToggle : undefined}
        aria-pressed={isListening}
        aria-label={
          isVoiceEnabled
            ? isListening
              ? "Stop listening"
              : "Start voice capture"
            : "Voice input not supported"
        }
      >
        <Mic className="h-4 w-4" />
      </button>

      <label htmlFor="message" className="sr-only">
        Share how you feel
      </label>
      <textarea
        id="message"
        placeholder={
          isListening ? "Listening... you can speak freely." : "Type what’s on your mind..."
        }
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="max-h-32 min-h-[52px] flex-1 resize-none border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
        disabled={isDisabled}
      />

      <button
        type="submit"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isDisabled}
        aria-label="Send message"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizontal className="h-5 w-5" />
        )}
      </button>
    </form>
  );
};

