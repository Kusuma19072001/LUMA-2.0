import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ChatBubble } from "../components/ChatBubble.tsx";
import { ChatInput } from "../components/ChatInput.tsx";
import { PlanCard } from "../components/PlanCard.tsx";
import { SignalCard } from "../components/SignalCard.tsx";
import { useChat } from "../hooks/useChat.ts";
import { useVoice } from "../hooks/useVoice.ts";

export const ChatPage = () => {
  const {
    messages,
    plan,
    latestSignal,
    isThinking,
    error,
    sendMessage,
    resetConversation,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null);

  const {
    isListening,
    isSpeaking,
    canListen,
    canSpeak,
    lastTranscript,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    setError: setVoiceError,
    clearTranscript,
  } = useVoice();

  const latestAssistantMessage = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "assistant"),
    [messages]
  );

  useEffect(() => {
    if (lastTranscript) {
      setVoiceDraft(lastTranscript);
    }
  }, [lastTranscript]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (text: string) => {
    await sendMessage(text);
    setVoiceDraft(null);
    clearTranscript();
  };

  const toggleVoiceCapture = () => {
    if (!canListen) {
      setVoiceError("Voice capture is not supported in this browser.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeakLatest = () => {
    if (!latestAssistantMessage) return;
    if (isSpeaking) {
      cancelSpeaking();
      return;
    }
    speak(latestAssistantMessage.content);
  };

  const combinedError = error ?? voiceError;

  return (
    <div className="relative mx-auto grid max-w-6xl gap-8 px-3 py-12 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] lg:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -top-6 z-0 h-[520px] rounded-[48px] bg-[radial-gradient(circle_at_top,rgba(74,157,143,0.32),rgba(186,226,255,0.25)_45%,transparent_70%)] blur-3xl opacity-70 animate-auraPulse"
      />

      <section className="relative z-10 flex flex-col gap-6 overflow-hidden rounded-[38px] border border-[#BFE2D8]/80 bg-gradient-to-br from-white/95 via-[#F0FBF6]/90 to-white/95 p-6 shadow-glow backdrop-blur-2xl lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,234,253,0.55),transparent)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(74,157,143,0.25),transparent)] blur-3xl"
        />

        <header className="relative flex flex-col gap-4 border-b border-[#CFE9E0]/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="font-heading text-[0.7rem] uppercase tracking-[0.55em] text-[#4A9D8F]">
              LUMA
            </p>
            <h1 className="bg-gradient-to-r from-[#4A9D8F] via-[#6BB8CF] to-[#5FAFA0] bg-clip-text font-heading text-3xl font-semibold text-transparent md:text-4xl">
              Your calm voice in a noisy world
            </h1>
            <p className="text-sm text-emerald-700/80">
              Share your thoughts freely. LUMA listens, senses, and responds
              with mindful care.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-[#BFE2D8]/90 bg-white/80 px-4 py-2 text-sm font-medium text-[#4A9D8F] shadow-sm transition-transform duration-200 ease-out hover:scale-[1.04] hover:border-[#8CCCBF] hover:bg-white"
              onClick={resetConversation}
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-[#BFE2D8]/90 bg-white/85 text-[#4A9D8F] shadow-md transition-transform duration-200 ease-out hover:scale-[1.05] hover:border-[#8CCCBF] hover:text-[#3D897C] disabled:cursor-not-allowed disabled:opacity-50 ${
                isSpeaking ? "border-rose-200 bg-rose-50 text-rose-500" : ""
              }`}
              disabled={!canSpeak || !latestAssistantMessage}
              aria-label={
                isSpeaking ? "Stop voice playback" : "Play response aloud"
              }
              title={
                canSpeak
                  ? isSpeaking
                    ? "Stop playback"
                    : "Play the latest response"
                  : "Voice playback not supported"
              }
              onClick={handleSpeakLatest}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="relative flex-1 space-y-5 overflow-y-auto rounded-[28px] border border-[#CAE6DC]/70 bg-gradient-to-br from-white/85 via-[#EBF9F3]/90 to-white/70 p-6 shadow-[0_18px_48px_-38px_rgba(74,157,143,0.55)] backdrop-blur-xl"
          style={{ maxHeight: "60vh" }}
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-[#4A9D8F]/80">
              <div className="rounded-full bg-[#E1F5EF] px-4 py-2 font-medium text-[#3D897C] shadow-sm">
                A gentle space awaits your words
              </div>
              <p className="max-w-sm">
                When you&apos;re ready, share a thought, a feeling, or a question.
                LUMA will meet you with mindful care.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isThinking && (
            <div className="flex items-center gap-3 rounded-3xl bg-[#D9EAFD]/80 px-4 py-3 text-sm text-[#4A6FA4] shadow-md shadow-white/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              LUMA is listening carefully...
            </div>
          )}
        </div>

        {combinedError && (
          <div className="rounded-3xl border border-rose-200/70 bg-rose-50/90 px-5 py-4 text-sm text-rose-600 shadow-inner">
            {combinedError}
          </div>
        )}

        <ChatInput
          disabled={isThinking}
          onSend={handleSend}
          onVoiceToggle={toggleVoiceCapture}
          isListening={isListening}
          supportsVoice={canListen}
          voiceDraft={voiceDraft}
        />
      </section>

      <aside className="relative z-10 flex flex-col gap-6">
        <SignalCard signal={latestSignal} />
        <PlanCard plan={plan} />
        <div className="relative rounded-[26px] bg-gradient-to-br from-[#D8F4EB] via-white to-[#E6F0FF] p-[1.5px] shadow-[0_32px_90px_-60px_rgba(74,157,143,0.55)]">
          <div className="rounded-[24px] bg-white/85 p-6 text-sm text-[#4A6F64] shadow-[inset_0_12px_40px_-38px_rgba(74,157,143,0.35)] backdrop-blur-xl">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[#4A9D8F]">
              Privacy by Design
            </h3>
            <p className="mt-3 leading-relaxed">
              Conversations power your reflective space. Emotional signals stay on
              this device, and your journal entries will be locked with
              end-to-end encryption in Dear Mind.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};


