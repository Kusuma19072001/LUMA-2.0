import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechRecogniser = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onaudioend: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionResultLike = {
  0: { transcript: string };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
  message?: string;
};

type RecognitionCtor = new () => SpeechRecogniser;

const getRecognitionCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const supportsSynthesis = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const useVoice = () => {
  const Recognition = useMemo(getRecognitionCtor, []);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecogniser | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const canListen = Boolean(Recognition);
  const canSpeak = supportsSynthesis();

  useEffect(() => {
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setLastTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied.");
      } else if (event.error !== "no-speech") {
        setError(event.message ?? "Something interrupted voice capture.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [Recognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Voice capture is not supported on this device.");
      return;
    }
    try {
      setError(null);
      setLastTranscript(null);
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to access microphone."
      );
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!canSpeak || !text.trim()) {
        if (!canSpeak) {
          setError("Speech synthesis is not available in this browser.");
        }
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setError("Unable to play voice response.");
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [canSpeak]
  );

  const cancelSpeaking = useCallback(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [canSpeak]);

  return {
    isListening,
    isSpeaking,
    canListen,
    canSpeak,
    lastTranscript,
    error,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    setError,
    clearTranscript: () => setLastTranscript(null),
  };
};

