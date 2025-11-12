import { useMemo, useState } from "react";
import {
  DownloadCloud,
  Lock,
  Loader2,
  Paintbrush2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { generateMoodCanvas } from "../services/geminiImage.ts";

type ArtworkState = {
  dataUrl: string;
  mimeType: string;
  mood: string;
  generatedAt: number;
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

export const MoodCanvasPage = () => {
  const [moodPrompt, setMoodPrompt] = useState("");
  const [artwork, setArtwork] = useState<ArtworkState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");

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

  const handleGenerate = async () => {
    if (!moodPrompt.trim()) {
      setError("Share a few words about your mood first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadMessage(null);

    try {
      const result = await generateMoodCanvas(moodPrompt);
      setArtwork({
        dataUrl: result.dataUrl,
        mimeType: result.mimeType,
        mood: moodPrompt.trim(),
        generatedAt: Date.now(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
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
          Describe your mood in a few words. Gemini 2.5 Flash weaves your emotions into a soft,
          abstract artwork you can keep—privately encrypted just for you.
        </p>
      </header>

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
                onClick={() => setArtwork(null)}
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
              <div className="overflow-hidden rounded-3xl border border-white/70 shadow-2xl">
                <img
                  src={artwork.dataUrl}
                  alt={`MoodCanvas interpretation of "${artwork.mood}"`}
                  className="h-full w-full object-cover"
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


