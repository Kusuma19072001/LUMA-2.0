import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ChatBubble } from "./components/ChatBubble.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { PlanCard } from "./components/PlanCard.tsx";
import { SignalCard } from "./components/SignalCard.tsx";
import { useChat } from "./hooks/useChat.ts";
import { useVoice } from "./hooks/useVoice.ts";

function App() {
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 text-slate-800">
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] lg:px-10">
        <section className="flex flex-col gap-6 rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur lg:p-8">
          <header className="flex flex-col gap-3 border-b border-emerald-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-500">
                LUMA 2.0
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-emerald-900 md:text-3xl">
                Your calm voice in a noisy world
              </h1>
              <p className="mt-1 text-sm text-emerald-700/80">
                Share your thoughts freely. LUMA listens, senses, and responds
                with mindful care.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                onClick={resetConversation}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 ${
                  isSpeaking ? "border-rose-200 bg-rose-50 text-rose-600" : ""
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
            className="flex-1 space-y-5 overflow-y-auto pr-1"
            style={{ maxHeight: "60vh" }}
          >
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {isThinking && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm text-emerald-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                LUMA is listening carefully...
              </div>
            )}
          </div>

          {combinedError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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

        <aside className="flex flex-col gap-6">
          <SignalCard signal={latestSignal} />
          <PlanCard plan={plan} />
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-slate-600 shadow-xl backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Privacy by Design
            </h3>
            <p className="mt-2 leading-relaxed">
              Conversations power your reflective space. Emotional signals stay
              on this device, and your journal entries will be locked with
              end-to-end encryption in Dear Mind.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
