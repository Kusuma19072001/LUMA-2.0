import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Video, VideoOff } from "lucide-react";
import { ChatBubble } from "../components/ChatBubble.tsx";
import { useVoice } from "../hooks/useVoice.ts";
import { sendToGemini } from "../services/gemini.ts";
import type { ChatMessage } from "../types/chat.ts";
import type { TabKey } from "../App.tsx";

// Import @vladmandic/face-api (modern fork with better Vite support)
// @ts-ignore - @vladmandic/face-api may not have type definitions
import * as faceapi from "@vladmandic/face-api";

type LiveSupportPageProps = {
  onNavigate: (tab: TabKey) => void;
};

type Mood = "happy" | "sad" | "neutral";

// Declare face-api types
type FaceDetectionWithExpressions = {
  expressions: {
    happy: number;
    sad: number;
    neutral: number;
    [key: string]: number;
  };
  withFaceExpressions: () => Promise<FaceDetectionWithExpressions>;
};

type FaceAPI = {
  nets: {
    tinyFaceDetector: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceLandmark68Net: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceExpressionNet: {
      loadFromUri: (uri: string) => Promise<void>;
    };
  };
  TinyFaceDetectorOptions: new (options?: { inputSize?: number; scoreThreshold?: number }) => any;
  detectSingleFace: (input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, net: any) => Promise<any>;
};

let faceapiInstance: FaceAPI | null = null;

const createMessage = (
  content: string,
  role: ChatMessage["role"]
): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  createdAt: Date.now(),
});

const MOOD_DETECTION_INTERVAL = 2000; // 2 seconds (faster detection)
const STABLE_MOOD_THRESHOLD = 1; // Show immediately (reduced from 2)
// Use jsdelivr CDN for @vladmandic/face-api models
const MODEL_BASE_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model";

export const LiveSupportPage = ({}: LiveSupportPageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modelsLoadedRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  const [currentDetectedMood, setCurrentDetectedMood] = useState<Mood | null>(null); // Show immediately when detected
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

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

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoadedRef.current || faceapiInstance) return;

      setIsLoadingModels(true);
      setError(null);

      try {
        // Use the statically imported @vladmandic/face-api
        // @ts-ignore - @vladmandic/face-api may not have type definitions
        const faceApi = faceapi as unknown as FaceAPI;
        
        // Check if face-api is loaded
        if (!faceApi || !faceApi.nets) {
          throw new Error("Face-api library failed to load. Please refresh the page.");
        }
        
        faceapiInstance = faceApi;

        console.log("Loading face-api models from:", MODEL_BASE_URL);
        console.log("Face-api instance:", faceApi);

        // Load models from CDN with better error handling
        // Note: faceLandmark68Net is required for face expression detection
        try {
          console.log("Loading TinyFaceDetector...");
          await faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_URL);
          console.log("TinyFaceDetector loaded successfully");
        } catch (err) {
          console.error("Failed to load TinyFaceDetector:", err);
          const errorDetails = err instanceof Error ? err.message : String(err);
          console.error("Error details:", errorDetails);
          throw new Error(`Failed to load TinyFaceDetector: ${errorDetails}. Check browser console for details.`);
        }

        try {
          console.log("Loading FaceLandmark68Net...");
          await faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE_URL);
          console.log("FaceLandmark68Net loaded successfully");
        } catch (err) {
          console.error("Failed to load FaceLandmark68Net:", err);
          const errorDetails = err instanceof Error ? err.message : String(err);
          console.error("Error details:", errorDetails);
          throw new Error(`Failed to load FaceLandmark68Net: ${errorDetails}. Check browser console for details.`);
        }

        try {
          console.log("Loading FaceExpressionNet...");
          await faceApi.nets.faceExpressionNet.loadFromUri(MODEL_BASE_URL);
          console.log("FaceExpressionNet loaded successfully");
        } catch (err) {
          console.error("Failed to load FaceExpressionNet:", err);
          const errorDetails = err instanceof Error ? err.message : String(err);
          console.error("Error details:", errorDetails);
          throw new Error(`Failed to load FaceExpressionNet: ${errorDetails}. Check browser console for details.`);
        }

        modelsLoadedRef.current = true;
        setIsLoadingModels(false);
        console.log("All face-api models loaded successfully");
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load facial recognition models: ${errorMessage}. Please check the browser console (F12) for more details and ensure you have an internet connection.`);
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      console.error("Video ref is not available");
      setError("Video element not ready. Please refresh the page.");
      return;
    }

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = "Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setError(null);
      console.log("Requesting camera access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" // Prefer front-facing camera
        } 
      });
      
      console.log("Camera stream obtained:", stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().catch((playErr) => {
              console.error("Error playing video:", playErr);
              setError(`Failed to start video playback: ${playErr instanceof Error ? playErr.message : String(playErr)}`);
            });
          }
        };
        
        setIsCameraActive(true);
        console.log("Camera activated successfully");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access was denied. Please click the camera icon in your browser's address bar and allow camera access, then try again.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No camera found. Please connect a camera to use this feature.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Camera is already in use by another application. Please close other apps using the camera and try again.");
        } else if (err.name === "OverconstrainedError") {
          setError("Camera doesn't support the requested settings. Trying with default settings...");
          // Retry with simpler constraints
          try {
            const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = simpleStream;
              streamRef.current = simpleStream;
              setIsCameraActive(true);
              setError(null);
            }
          } catch (retryErr) {
            setError(`Camera error: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`);
          }
        } else {
          setError(`Camera error: ${err.message}. Check browser console (F12) for details.`);
        }
      } else {
        setError(`Failed to access camera: ${String(err)}. Please check your browser permissions.`);
      }
      setIsCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsCameraActive(false);
    setMood(null);
    setMoodHistory([]);
    setCurrentDetectedMood(null);
  }, []);

  // Detect mood from facial expressions
  const detectMood = useCallback(async (): Promise<Mood | null> => {
    if (!videoRef.current) {
      console.log("Mood detection: videoRef not available");
      return null;
    }
    
    if (!faceapiInstance) {
      console.log("Mood detection: faceapiInstance not available");
      return null;
    }
    
    if (!modelsLoadedRef.current) {
      console.log("Mood detection: models not loaded yet");
      return null;
    }

    // Check if video is ready
    if (videoRef.current.readyState < 2) {
      console.log("Mood detection: video not ready, readyState:", videoRef.current.readyState);
      return null;
    }

    try {
      console.log("Starting mood detection...");
      console.log("Video element:", videoRef.current);
      console.log("Video readyState:", videoRef.current?.readyState);
      console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
      
      // @ts-ignore - face-api.js API may vary
      // Try detectSingleFace first
      let faceDetection: any = null;
      try {
        faceDetection = await faceapiInstance.detectSingleFace(
          videoRef.current,
          new faceapiInstance.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        );
        console.log("Face detection result:", faceDetection);
      } catch (detectErr) {
        console.error("Error in detectSingleFace:", detectErr);
        return null;
      }

      if (!faceDetection) {
        console.log("No face detected in frame");
        return null;
      }

      console.log("Face detected, adding landmarks...");
      let withLandmarks: any = null;
      try {
        // @ts-ignore
        if (typeof faceDetection.withFaceLandmarks === 'function') {
          withLandmarks = await faceDetection.withFaceLandmarks();
          console.log("Landmarks result:", withLandmarks);
        } else {
          console.warn("withFaceLandmarks not available, trying without landmarks");
          withLandmarks = faceDetection;
        }
      } catch (landmarkErr) {
        console.error("Error adding landmarks:", landmarkErr);
        // Try without landmarks
        withLandmarks = faceDetection;
      }

      if (!withLandmarks) {
        console.log("Failed to get landmarks");
        return null;
      }

      console.log("Landmarks added, adding expressions...");
      let detection: any = null;
      try {
        // @ts-ignore
        if (typeof withLandmarks.withFaceExpressions === 'function') {
          detection = await withLandmarks.withFaceExpressions();
          console.log("Expressions result:", detection);
        } else {
          console.warn("withFaceExpressions not available on withLandmarks");
          console.log("withLandmarks object:", withLandmarks);
          console.log("withLandmarks keys:", Object.keys(withLandmarks));
          console.log("withLandmarks type:", typeof withLandmarks);
          
          // Try alternative: detectAllFaces with expressions
          console.log("Trying alternative: detectAllFaces...");
          // @ts-ignore
          if (faceapiInstance.detectAllFaces) {
            try {
              // @ts-ignore
              const allFaces = await faceapiInstance
                .detectAllFaces(videoRef.current, new faceapiInstance.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();
              
              if (allFaces && allFaces.length > 0) {
                detection = allFaces[0];
                console.log("Successfully detected using detectAllFaces:", detection);
              }
            } catch (altErr) {
              console.error("Alternative detection method also failed:", altErr);
            }
          }
          
          if (!detection) {
            return null;
          }
        }
      } catch (exprErr) {
        console.error("Error adding expressions:", exprErr);
        console.error("Error stack:", exprErr instanceof Error ? exprErr.stack : "No stack");
        return null;
      }

      if (!detection) {
        console.log("No face detected in frame");
        return null;
      }

      if (!detection.expressions) {
        console.log("Detection found but no expressions:", detection);
        console.log("Detection object keys:", Object.keys(detection));
        return null;
      }

      const expressions = detection.expressions;
      console.log("Detected expressions:", expressions);
      
      const happy = expressions.happy ?? 0;
      const sad = expressions.sad ?? 0;
      const neutral = expressions.neutral ?? 0;
      const angry = expressions.angry ?? 0;
      const surprised = expressions.surprised ?? 0;
      const fearful = expressions.fearful ?? 0;
      const disgusted = expressions.disgusted ?? 0;

      console.log(`Expression scores - Happy: ${happy}, Sad: ${sad}, Neutral: ${neutral}, Angry: ${angry}, Surprised: ${surprised}, Fearful: ${fearful}, Disgusted: ${disgusted}`);

      // Find the dominant emotion (highest score)
      const emotionScores = {
        happy,
        sad,
        neutral,
        angry,
        surprised,
        fearful,
        disgusted,
      };

      const dominantEmotion = Object.entries(emotionScores).reduce((a, b) =>
        emotionScores[a[0] as keyof typeof emotionScores] > emotionScores[b[0] as keyof typeof emotionScores] ? a : b
      );

      console.log(`Dominant emotion: ${dominantEmotion[0]} with score ${dominantEmotion[1]}`);

      // Map to our mood types - use lower threshold and prioritize happy/sad
      if (happy > 0.3 && happy >= sad && happy >= neutral) {
        console.log("Detected mood: happy");
        return "happy";
      } else if (sad > 0.3 && sad >= happy && sad >= neutral) {
        console.log("Detected mood: sad");
        return "sad";
      } else {
        console.log("Detected mood: neutral");
        return "neutral";
      }
    } catch (err) {
      console.error("Mood detection error:", err);
      if (err instanceof Error) {
        console.error("Error details:", err.message, err.stack);
      }
      return null;
    }
  }, []);

  // Start mood detection loop
  useEffect(() => {
    if (!isCameraActive) {
      console.log("Mood detection loop: camera not active");
      return;
    }
    
    if (!modelsLoadedRef.current) {
      console.log("Mood detection loop: models not loaded yet");
      return;
    }

    console.log("Starting mood detection loop...");
    
    const interval = setInterval(async () => {
      const detectedMood = await detectMood();
      if (detectedMood) {
        console.log("Mood detected in loop:", detectedMood);
        // Show immediately in the UI
        setCurrentDetectedMood(detectedMood);
        setMoodHistory((prev) => {
          const newHistory = [...prev, detectedMood].slice(-STABLE_MOOD_THRESHOLD);
          console.log("Updated mood history:", newHistory);
          return newHistory;
        });
      }
      // Note: We don't clear currentDetectedMood when no mood is detected
      // to keep showing the last detected mood
    }, MOOD_DETECTION_INTERVAL);

    detectionIntervalRef.current = interval;
    console.log("Mood detection interval set:", interval);

    return () => {
      if (detectionIntervalRef.current) {
        console.log("Clearing mood detection interval");
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isCameraActive, detectMood, isLoadingModels]);

  // Determine stable mood from history
  useEffect(() => {
    if (moodHistory.length < STABLE_MOOD_THRESHOLD) return;

    const lastMoods = moodHistory.slice(-STABLE_MOOD_THRESHOLD);
    const allSame = lastMoods.every((m) => m === lastMoods[0]);

    if (allSame && lastMoods[0] !== mood) {
      setMood(lastMoods[0]);
    }
  }, [moodHistory, mood]);

  // Send initial greeting based on mood
  useEffect(() => {
    if (!mood || hasGreeted || messages.length > 0) return;

    let greeting: string;
    if (mood === "sad") {
      greeting =
        "You're looking a bit down today. What can I do to cheer you up or support you right now?";
    } else if (mood === "happy") {
      greeting =
        "You look happy today. I'd love to hear what's going well—would you like to share?";
    } else {
      greeting = "I'm here to listen. How are you feeling today?";
    }

    const greetingMessage = createMessage(greeting, "assistant");
    setMessages([greetingMessage]);
    setHasGreeted(true);

    // Speak the greeting
    if (canSpeak) {
      speak(greeting);
    }
  }, [mood, hasGreeted, messages.length, canSpeak, speak]);

  // Handle voice transcript and send to Gemini
  useEffect(() => {
    if (!lastTranscript || isThinking) return;

    const handleVoiceMessage = async () => {
      const userMessage = createMessage(lastTranscript, "user");
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      setError(null);
      clearTranscript();

      try {
        const history = [...messages, userMessage];
        const { message: assistantMessage } = await sendToGemini(history, lastTranscript);

        setMessages((prev) => [...prev, assistantMessage]);

        // Speak the response
        if (canSpeak) {
          speak(assistantMessage.content);
        }
      } catch (err) {
        const fallback = createMessage(
          "I'm having trouble reaching my mindful space right now. Could you try again in a moment?",
          "assistant"
        );
        setMessages((prev) => [...prev, fallback]);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsThinking(false);
      }
    };

    handleVoiceMessage();
  }, [lastTranscript, isThinking, messages, canSpeak, speak, clearTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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

  const combinedError = error ?? voiceError;

  return (
    <div className="relative mx-auto max-w-6xl gap-8 px-3 py-12 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -top-6 z-0 h-[520px] rounded-[48px] bg-[radial-gradient(circle_at_top,rgba(74,157,143,0.32),rgba(186,226,255,0.25)_45%,transparent_70%)] blur-3xl opacity-70 animate-auraPulse"
      />

      {/* Left column: Full transcript (large screens) */}
      <section className="relative z-10 hidden flex-col gap-6 overflow-hidden rounded-[38px] border border-[#BFE2D8]/80 bg-gradient-to-br from-white/95 via-[#F0FBF6]/90 to-white/95 p-6 shadow-glow backdrop-blur-2xl lg:flex lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,234,253,0.55),transparent)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(74,157,143,0.25),transparent)] blur-3xl"
        />

        <header className="relative flex flex-col gap-4 border-b border-[#CFE9E0]/70 pb-6">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-[#4A9D8F] via-[#6BB8CF] to-[#5FAFA0] bg-clip-text font-heading text-3xl font-semibold leading-[1.35] text-transparent md:text-4xl md:leading-[1.35]" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', lineHeight: '1.35' }}>
              You’re Not Alone Here
            </h1>
            <p className="text-sm text-emerald-700/80">
              Your emotional wellbeing companion is here, ready to listen and support you.
            </p>
          </div>
        </header>

        <div
          className="relative flex-1 space-y-5 overflow-y-auto rounded-[28px] border border-[#CAE6DC]/70 bg-gradient-to-br from-white/85 via-[#EBF9F3]/90 to-white/70 p-6 shadow-[0_18px_48px_-38px_rgba(74,157,143,0.55)] backdrop-blur-xl"
          style={{ maxHeight: "60vh" }}
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-[#4A9D8F]/80">
              <div className="rounded-full bg-[#E1F5EF] px-4 py-2 font-medium text-[#3D897C] shadow-sm">
                Waiting for camera...
              </div>
              <p className="max-w-sm">
                Once your camera is active, LUMA will detect your mood and greet you.
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
      </section>

      {/* Right column: Camera + controls + compact transcript (large screens) or full view (small screens) */}
      <section className="relative z-10 flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-[38px] border border-[#BFE2D8]/80 bg-gradient-to-br from-white/95 via-[#F0FBF6]/90 to-white/95 p-6 shadow-glow backdrop-blur-2xl lg:p-10">
          <div className="space-y-6">
            {/* Camera preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-[28px] bg-slate-900">
              {isLoadingModels && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Loading facial recognition models...</p>
                  </div>
                </div>
              )}

              {/* Always render video element (hidden when not active) so ref is available */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${isCameraActive ? '' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive && !isLoadingModels && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 rounded-full bg-emerald-500 px-6 py-4 text-white shadow-lg transition-transform hover:scale-105"
                  >
                    <Video className="h-8 w-8" />
                    <span className="text-sm font-medium">Start Camera</span>
                  </button>
                </div>
              )}

              {isCameraActive && (
                <>
                  <button
                    onClick={stopCamera}
                    className="absolute top-4 right-4 rounded-full bg-rose-500 p-3 text-white shadow-lg transition-transform hover:scale-105 z-10"
                    aria-label="Stop camera"
                  >
                    <VideoOff className="h-5 w-5" />
                  </button>
                  
                  {/* Mood indicator overlay on video - show current detected mood or stable mood */}
                  {(currentDetectedMood || mood) && (
                    <div className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 backdrop-blur-md px-4 py-2 shadow-xl border border-white/50">
                      <span className="text-sm font-semibold text-slate-700">
                        Mood: {(currentDetectedMood || mood) === "happy" ? "😊 Happy" : (currentDetectedMood || mood) === "sad" ? "😢 Sad" : "😐 Neutral"}
                      </span>
                    </div>
                  )}
                  
                  {/* Debug: Show detection status when camera is active but no mood yet */}
                  {isCameraActive && !currentDetectedMood && !mood && modelsLoadedRef.current && (
                    <div className="absolute bottom-4 left-4 z-20 rounded-full bg-blue-500/90 backdrop-blur-md px-4 py-2 shadow-xl text-white text-xs">
                      Detecting...
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Voice controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  isListening
                    ? "border-rose-400 bg-rose-100 text-rose-600 shadow-lg"
                    : "border-[#BFE2D8] bg-white text-[#4A9D8F] shadow-md hover:scale-105 hover:border-[#4A9D8F]"
                } ${!canListen ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={!canListen}
                onClick={toggleVoiceCapture}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic className="h-6 w-6" />
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={cancelSpeaking}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-400 bg-rose-100 text-rose-600 shadow-lg transition-transform hover:scale-105"
                  aria-label="Stop speaking"
                >
                  <Loader2 className="h-6 w-6 animate-spin" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compact transcript (large screens) or full transcript (small screens) */}
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-[38px] border border-[#BFE2D8]/80 bg-gradient-to-br from-white/95 via-[#F0FBF6]/90 to-white/95 p-6 shadow-glow backdrop-blur-2xl lg:hidden lg:p-10">
          <header className="relative flex flex-col gap-4 border-b border-[#CFE9E0]/70 pb-6">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-[#4A9D8F] via-[#6BB8CF] to-[#5FAFA0] bg-clip-text font-heading text-3xl font-semibold leading-[1.35] text-transparent md:text-4xl md:leading-[1.35]" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', lineHeight: '1.35' }}>
                Live Support
              </h1>
              <p className="text-sm text-emerald-700/80">
                Your emotional wellbeing companion is here, ready to listen and support you.
              </p>
            </div>
          </header>

          <div
            className="relative flex-1 space-y-5 overflow-y-auto rounded-[28px] border border-[#CAE6DC]/70 bg-gradient-to-br from-white/85 via-[#EBF9F3]/90 to-white/70 p-6 shadow-[0_18px_48px_-38px_rgba(74,157,143,0.55)] backdrop-blur-xl"
            style={{ maxHeight: "50vh" }}
          >
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-[#4A9D8F]/80">
                <div className="rounded-full bg-[#E1F5EF] px-4 py-2 font-medium text-[#3D897C] shadow-sm">
                  Waiting for camera...
                </div>
                <p className="max-w-sm">
                  Once your camera is active, LUMA will detect your mood and greet you.
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
        </div>
      </section>
    </div>
  );
};

