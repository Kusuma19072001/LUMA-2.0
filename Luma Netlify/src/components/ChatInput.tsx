import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Mic, SendHorizontal } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";

// Helper: map keywords to mood category
function extractMoodCategory(str: string): number | undefined {
  const s = str.toLowerCase();
  if (/energetic|motivated|amazing|fantastic|excited/.test(s)) return 4;
  if (/happy|joy|great|good|grateful|fine/.test(s)) return 3;
  if (/okay|ok|meh|bored|neutral|average/.test(s)) return 2;
  if (/stressed|worried|tired|anxious|overwhelmed/.test(s)) return 1;
  if (/sad|depressed|bad|down|unhappy|lonely/.test(s)) return 0;
  return undefined;
}

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
  const { recordChat } = useAnalytics();

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
      // New: Detect mood
      const moodCategory = extractMoodCategory(value);
      // Pass detected mood and message text
      recordChat(moodCategory, value);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative flex w-full items-center gap-3 rounded-[30px] border border-[#AEE1D6] bg-white/95 px-5 py-3 shadow-[0_24px_48px_-32px_rgba(74,157,143,0.45)] transition-all duration-200 ease-out focus-within:border-[#4A9D8F] focus-within:shadow-[0_18px_55px_-30px_rgba(74,157,143,0.55)]"
    >
      <button
        type="button"
        className={`rounded-full p-3 text-[#4A9D8F] transition-transform duration-200 ease-out hover:scale-[1.08] ${
          isListening
            ? "bg-rose-100 text-rose-600"
            : "bg-[#E0F6EF] hover:bg-[#CBEDE2]"
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
        className="max-h-32 min-h-[52px] flex-1 resize-none border-0 bg-transparent font-body text-base text-slate-900 outline-none placeholder:text-slate-400"
        disabled={isDisabled}
      />

      <button
        type="submit"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A9D8F] text-white shadow-[0_18px_40px_-25px_rgba(74,157,143,0.65)] transition-transform duration-200 ease-out hover:scale-[1.08] hover:bg-[#3D897C] disabled:cursor-not-allowed disabled:opacity-50"
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

