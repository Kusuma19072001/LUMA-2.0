import { useEffect, useMemo, useState } from "react";
import {
  DownloadCloud,
  Lock,
  Loader2,
  Paintbrush2,
  RefreshCw,
  Sparkles,
  Heart,
  Wind,
  Brain,
  Sun,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Save,
  Check,
} from "lucide-react";
import { generateMoodCanvas, getEmotionalReflection, type EmotionalReflection } from "../services/geminiImage.ts";
import { saveMoodEntry, getMoodEntryById } from "../services/database.ts";
import type { MoodEntry } from "../types/database.ts";

type ArtworkState = {
  dataUrl: string;
  mimeType: string;
  mood: string;
  generatedAt: number;
  reflection?: EmotionalReflection;
};

const encoder = new TextEncoder();

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const dataUrlToArrayBuffer = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const encryptArtwork = async (
  artwork: ArtworkState,
  passphrase: string
): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    dataUrlToArrayBuffer(artwork.dataUrl)
  );

  const payload = {
    version: 1,
    mood: artwork.mood,
    generatedAt: artwork.generatedAt,
    mimeType: artwork.mimeType,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encrypted),
  };

  return JSON.stringify(payload, null, 2);
};

type MoodCanvasPageProps = {
  onNavigate?: (tab: "breathesync" | "exercises" | "home" | "canvas" | "chat" | "analytics" | "profile" | "reminders" | "achievements") => void;
};

export const MoodCanvasPage = ({ onNavigate }: MoodCanvasPageProps) => {
  const [moodPrompt, setMoodPrompt] = useState("");
  const [artwork, setArtwork] = useState<ArtworkState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [originalMood, setOriginalMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [currentMoodEntryId, setCurrentMoodEntryId] = useState<string | null>(null);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);

  const gradientBackdrop = useMemo(() => {
    const palettes = [
      "from-emerald-200 via-emerald-50 to-sky-100",
      "from-rose-200 via-amber-50 to-emerald-100",
      "from-sky-200 via-indigo-50 to-violet-100",
      "from-amber-200 via-rose-50 to-slate-100",
    ];
    const index = Math.floor(Math.random() * palettes.length);
    return palettes[index]!;
  }, [artwork?.generatedAt]);

  // Check if returning from exercise
  useEffect(() => {
    const returnFromExercise = sessionStorage.getItem("returnFromExercise");
    const storedOriginalMood = sessionStorage.getItem("originalMood");
    
    if (returnFromExercise === "true" && storedOriginalMood) {
      setShowMoodCheck(true);
      setOriginalMood(storedOriginalMood);
      sessionStorage.removeItem("returnFromExercise");
      // Keep originalMood in sessionStorage for comparison after new mood is entered
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!moodPrompt.trim()) {
      setError("Share a few words about your mood first.");
      return;
    }

    // If checking mood after exercise, compare with original
    if (showMoodCheck && originalMood) {
      // We'll handle comparison after reflection is generated
    }

    setIsLoading(true);
    setIsReflecting(false);
    setError(null);
    setDownloadMessage(null);

    try {
      // Generate artwork first
      const result = await generateMoodCanvas(moodPrompt);
      setArtwork({
        dataUrl: result.dataUrl,
        mimeType: result.mimeType,
        mood: moodPrompt.trim(),
        generatedAt: Date.now(),
      });

      // Then get emotional reflection
      setIsLoading(false);
      setIsReflecting(true);

      try {
        const reflection = await getEmotionalReflection(moodPrompt.trim());
        console.log("Reflection received:", reflection); // Debug log
        setArtwork((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            reflection,
          };
        });

        // Determine if improvement was detected
        let improvementDetected = false;
        if (showMoodCheck && originalMood) {
          const positiveWords = /better|improved|calmer|peaceful|relaxed|good|great|happy|light|relief|ease/i;
          const negativeWords = /sad|heavy|anxious|worried|stressed|bad|down|low|difficult|hard/i;
          const beforeNegative = negativeWords.test(originalMood);
          const afterPositive = positiveWords.test(moodPrompt.trim());
          const afterNegative = negativeWords.test(moodPrompt.trim());
          improvementDetected = beforeNegative && (afterPositive || !afterNegative);
        }

        // Save mood entry to database (artwork should exist at this point)
        setArtwork((prev) => {
          if (!prev) return prev;
          
          const moodEntryId = crypto.randomUUID();
          setCurrentMoodEntryId(moodEntryId);
          
          const moodEntry: MoodEntry = {
            id: moodEntryId,
            moodPrompt: moodPrompt.trim(),
            artworkDataUrl: prev.dataUrl,
            artworkMimeType: prev.mimeType,
            reflection: reflection ? {
              reflection: reflection.reflection,
              guidanceType: reflection.guidanceType,
              guidancePrompt: reflection.guidancePrompt,
              tone: reflection.tone,
            } : prev.reflection ? {
              reflection: prev.reflection.reflection,
              guidanceType: prev.reflection.guidanceType,
              guidancePrompt: prev.reflection.guidancePrompt,
              tone: prev.reflection.tone,
            } : undefined,
            moodComparison: showMoodCheck && originalMood ? {
              before: originalMood,
              after: moodPrompt.trim(),
              improvementDetected,
            } : undefined,
            journalEntry: journalEntry || undefined,
            createdAt: prev.generatedAt,
            updatedAt: Date.now(),
          };

          saveMoodEntry(moodEntry).catch((error) => {
            console.error("Failed to save mood entry to database:", error);
          });
          
          return prev;
        });

        // If checking mood after exercise, compare moods and show improvement
        if (showMoodCheck && originalMood) {
          setShowMoodCheck(false);
          // Store comparison data for potential future use
          const moodComparison = {
            before: originalMood,
            after: moodPrompt.trim(),
            timestamp: Date.now(),
          };
          sessionStorage.setItem("moodComparison", JSON.stringify(moodComparison));
          // Clear original mood after comparison
          sessionStorage.removeItem("originalMood");
          setOriginalMood(null);
        }
      } catch (reflectionErr) {
        console.error("Error getting reflection:", reflectionErr);
        // getEmotionalReflection should always return a fallback, but just in case:
        setError("Reflection may be limited, but your artwork is ready.");
      } finally {
        setIsReflecting(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setIsLoading(false);
      setIsReflecting(false);
    }
  };

  const handleJournalEntryChange = (text: string) => {
    setJournalEntry(text);
    setJournalSaved(false);
  };

  const handleSaveJournal = async () => {
    if (!currentMoodEntryId || !artwork) return;
    
    setIsSavingJournal(true);
    setJournalSaved(false);
    
    try {
      const existingEntry = await getMoodEntryById(currentMoodEntryId);
      if (existingEntry) {
        const updatedEntry: MoodEntry = {
          ...existingEntry,
          journalEntry: journalEntry.trim() || undefined,
          updatedAt: Date.now(),
        };
        await saveMoodEntry(updatedEntry);
        setJournalSaved(true);
        setTimeout(() => setJournalSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save journal entry:", error);
      setError("Failed to save journal entry. Please try again.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleEncryptDownload = async () => {
    if (!artwork) return;
    if (passphrase.trim().length < 6) {
      setError("Use a passphrase with at least six characters to keep it safe.");
      return;
    }

    setIsEncrypting(true);
    setError(null);
    setDownloadMessage(null);

    try {
      const encrypted = await encryptArtwork(artwork, passphrase.trim());
      const blob = new Blob([encrypted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date(artwork.generatedAt)
        .toISOString()
        .replace(/[:.]/g, "-");
      link.href = url;
      link.download = `moodcanvas-${timestamp}.lumaart`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadMessage("Encrypted artwork saved. Keep your passphrase handy.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to encrypt the artwork. Please try again.";
      setError(message);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
          <Sparkles className="h-4 w-4" />
          MoodCanvas
        </p>
        <h1 className="text-4xl font-semibold text-emerald-900">
          Let your feelings bloom on a mindful canvas.
        </h1>
        <p className="max-w-2xl text-base text-emerald-700/80">
          Describe your mood in a few words. LUMA weaves your emotions into soft, abstract artwork,
          then offers gentle reflection and guidance to help you process what you're feeling.
        </p>
      </header>

      {showMoodCheck && originalMood && (
        <section className="rounded-4xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-xl backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-semibold text-emerald-900">
                How are you feeling now?
              </h2>
              <p className="text-sm text-emerald-700/80">
                You completed a breathing exercise. Take a moment to check in with yourself—how has your mood shifted?
              </p>
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-3 text-xs text-emerald-700/70">
                <span className="font-medium">Before:</span> {originalMood}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Paintbrush2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">
                What's the mood today?
              </h2>
              <p className="text-sm text-emerald-700/80">
                Use sensory words, colors, or metaphors—the richer the feeling, the deeper the art.
              </p>
            </div>
          </div>

          <textarea
            value={moodPrompt}
            onChange={(event) => setMoodPrompt(event.target.value)}
            placeholder='Example: "restless but hopeful, like dawn after rain"'
            className="mt-6 h-36 w-full resize-none rounded-3xl border border-emerald-200/60 bg-emerald-50/40 px-5 py-4 text-sm text-emerald-900 shadow-inner outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
          />

          {error && (
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400/70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Painting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Artwork
                </>
              )}
            </button>
            {artwork && (
              <button
                onClick={() => {
                  setArtwork(null);
                  setJournalEntry("");
                  setCurrentMoodEntryId(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Canvas
              </button>
            )}
          </div>
        </div>

        <div
          className={`relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-4xl border border-white/50 bg-gradient-to-br ${gradientBackdrop} p-6 shadow-2xl backdrop-blur`}
        >
          {!artwork && !isLoading && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-emerald-500 shadow-lg">
                <Paintbrush2 className="h-12 w-12" />
              </div>
              <div className="space-y-2 text-emerald-900">
                <p className="text-lg font-semibold">
                  Your canvas is waiting.
                </p>
                <p className="text-sm text-emerald-700/80">
                  When you’re ready, share the feeling. LUMA turns it into color, light, and flow.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-4 text-center text-emerald-800">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
              <p className="text-sm">Breathing life into your mood...</p>
            </div>
          )}

          {artwork && !isLoading && (
            <div className="flex w-full flex-col gap-4">
              <div className="overflow-hidden rounded-3xl border border-white/70 shadow-2xl bg-white/20">
                <img
                  src={artwork.dataUrl}
                  alt={`MoodCanvas interpretation of "${artwork.mood}"`}
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: "600px" }}
                />
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-inner backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
                  Mood Snapshot
                </p>
                <p className="mt-2 text-sm text-emerald-900">{artwork.mood}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {isReflecting && (
        <section className="rounded-4xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col items-center gap-4 text-center text-emerald-800">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">LUMA is reflecting on your feeling...</p>
            <p className="text-xs text-emerald-700/70">This moment of understanding takes a gentle breath.</p>
          </div>
        </section>
      )}

      {artwork?.reflection && (
        <section className="rounded-4xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: `${artwork.reflection.tone.palette}20`,
                color: artwork.reflection.tone.palette,
              }}
            >
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-emerald-900">
                  LUMA's Reflection
                </h2>
                <p className="mt-3 leading-relaxed text-emerald-800 whitespace-pre-line">
                  {artwork.reflection.reflection}
                </p>
              </div>

              {/* Show improvement message if returning from exercise */}
              {(() => {
                const comparisonData = sessionStorage.getItem("moodComparison");
                if (comparisonData) {
                  try {
                    const comparison = JSON.parse(comparisonData);
                    // Simple heuristic: if new mood contains more positive words
                    const positiveWords = /better|improved|calmer|peaceful|relaxed|good|great|happy|light|relief|ease/i;
                    const negativeWords = /sad|heavy|anxious|worried|stressed|bad|down|low|difficult|hard/i;
                    const beforeNegative = negativeWords.test(comparison.before);
                    const afterPositive = positiveWords.test(artwork.mood);
                    const afterNegative = negativeWords.test(artwork.mood);
                    
                    if (beforeNegative && (afterPositive || !afterNegative)) {
                      sessionStorage.removeItem("moodComparison");
                      return (
                        <div className="mt-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-5">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-emerald-900 mb-2">
                                Notice the shift?
                              </h3>
                              <p className="text-xs text-emerald-700/80 leading-relaxed">
                                Your breathing practice seems to have helped. The way you're describing your mood now feels different from before. 
                                This is progress—even small shifts matter.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  } catch {
                    // Ignore parse errors
                  }
                }
                return null;
              })()}

              {artwork.reflection.guidanceType && artwork.reflection.guidancePrompt && (
                <div
                  className="rounded-3xl border p-6 shadow-inner mt-4"
                  style={{
                    borderColor: `${artwork.reflection.tone.palette}40`,
                    backgroundColor: `${artwork.reflection.tone.palette}10`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${artwork.reflection.tone.palette}30`,
                        color: artwork.reflection.tone.palette,
                      }}
                    >
                      {artwork.reflection.guidanceType === "breathing" && (
                        <Wind className="h-5 w-5" />
                      )}
                      {artwork.reflection.guidanceType === "meditation" && (
                        <Brain className="h-5 w-5" />
                      )}
                      {artwork.reflection.guidanceType === "grounding" && (
                        <Heart className="h-5 w-5" />
                      )}
                      {artwork.reflection.guidanceType === "celebration" && (
                        <Sun className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium" style={{ color: artwork.reflection.tone.palette }}>
                        {artwork.reflection.guidancePrompt}
                      </p>
                      {/* Negative feelings - show exercise suggestions */}
                      {(artwork.reflection.guidanceType === "breathing" || 
                        artwork.reflection.guidanceType === "meditation" || 
                        artwork.reflection.guidanceType === "grounding") && (
                        <>
                          {artwork.reflection.guidanceType === "breathing" && (
                            <button
                              onClick={() => {
                                // Store original mood for comparison after exercise
                                sessionStorage.setItem("originalMood", artwork.mood);
                                sessionStorage.setItem("returnFromExercise", "true");
                                if (onNavigate) {
                                  onNavigate("breathesync");
                                } else {
                                  // Fallback: use navigation event
                                  sessionStorage.setItem("navigateTo", "breathesync");
                                  window.dispatchEvent(new CustomEvent("navigate", { detail: "breathesync" }));
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                              style={{
                                color: artwork.reflection.tone.palette,
                                border: `2px solid ${artwork.reflection.tone.palette}40`,
                              }}
                            >
                              Try Breathing Exercise
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          {artwork.reflection.guidanceType === "meditation" && (
                            <button
                              onClick={() => {
                                if (onNavigate) {
                                  onNavigate("exercises");
                                } else {
                                  // Fallback: use navigation event
                                  sessionStorage.setItem("navigateTo", "exercises");
                                  window.dispatchEvent(new CustomEvent("navigate", { detail: "exercises" }));
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                              style={{
                                color: artwork.reflection.tone.palette,
                                border: `2px solid ${artwork.reflection.tone.palette}40`,
                              }}
                            >
                              Explore Guided Exercises
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          {artwork.reflection.guidanceType === "grounding" && (
                            <button
                              onClick={() => {
                                if (onNavigate) {
                                  onNavigate("exercises");
                                  sessionStorage.setItem("startExercise", "midday-reset");
                                } else {
                                  // Fallback: use navigation event
                                  sessionStorage.setItem("navigateTo", "exercises");
                                  sessionStorage.setItem("startExercise", "midday-reset");
                                  window.dispatchEvent(new CustomEvent("navigate", { detail: "exercises" }));
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                              style={{
                                color: artwork.reflection.tone.palette,
                                border: `2px solid ${artwork.reflection.tone.palette}40`,
                              }}
                            >
                              Try Grounding Exercise
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      {/* Positive feelings - show journal entry */}
                      {artwork.reflection.guidanceType === "celebration" && (
                        <div className="rounded-2xl border p-3 shadow-inner" style={{ borderColor: `${artwork.reflection.tone.palette}40`, backgroundColor: `${artwork.reflection.tone.palette}10` }}>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: artwork.reflection.tone.palette }}>
                            Why am I feeling this way?
                          </label>
                          <textarea
                            value={journalEntry}
                            onChange={(e) => handleJournalEntryChange(e.target.value)}
                            placeholder="Take a moment to savor this feeling..."
                            className="w-full h-20 resize-none rounded-lg border bg-white/80 px-3 py-2 text-xs outline-none focus:ring-2 transition-all"
                            style={{
                              borderColor: `${artwork.reflection?.tone.palette || '#4CC9B0'}40`,
                              '--tw-ring-color': (artwork.reflection?.tone.palette || '#4CC9B0') + '40',
                            } as React.CSSProperties & { '--tw-ring-color': string }}
                            onFocus={(e) => {
                              const palette = artwork.reflection?.tone.palette || '#4CC9B0';
                              e.target.style.borderColor = palette;
                              e.target.style.boxShadow = `0 0 0 2px ${palette}40`;
                            }}
                            onBlur={(e) => {
                              const palette = artwork.reflection?.tone.palette || '#4CC9B0';
                              e.target.style.borderColor = `${palette}40`;
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                          <div className="mt-2 flex items-center justify-end gap-2">
                            {journalSaved && (
                              <span className="text-xs flex items-center gap-1 animate-in fade-in" style={{ color: artwork.reflection.tone.palette }}>
                                <Check className="h-3 w-3" />
                                Saved
                              </span>
                            )}
                            <button
                              onClick={handleSaveJournal}
                              disabled={isSavingJournal || !journalEntry.trim()}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                              style={{
                                backgroundColor: artwork.reflection.tone.palette,
                                color: 'white',
                              }}
                            >
                              {isSavingJournal ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3" />
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {artwork && (
        <section className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-2 text-emerald-900">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                Save it privately
              </h2>
              <p className="text-sm text-emerald-700/80">
                Encrypt the original artwork with AES-GCM so it only unlocks with your passphrase.
                Keep the `.lumaart` file safe—it holds everything you need.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-emerald-900 shadow-inner lg:max-w-md">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
                Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                placeholder="Create a private passphrase (min 6 characters)"
                className="w-full rounded-2xl border border-emerald-200/70 bg-white px-4 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
              />
              <button
                onClick={handleEncryptDownload}
                disabled={isEncrypting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-500/80"
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4" />
                    Save Encrypted Artwork
                  </>
                )}
              </button>
              {downloadMessage && (
                <p className="text-xs text-emerald-600">{downloadMessage}</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};


