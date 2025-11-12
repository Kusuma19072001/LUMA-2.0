import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";

type BreathingPhase = "inhale" | "hold" | "exhale" | "pause";

type BreathingPattern = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  description: string;
};

const patterns: BreathingPattern[] = [
  {
    name: "Calm & Centered",
    inhale: 4,
    hold: 2,
    exhale: 6,
    pause: 1,
    description: "Perfect for general relaxation and stress relief",
  },
  {
    name: "Deep Sleep",
    inhale: 4,
    hold: 4,
    exhale: 8,
    pause: 0,
    description: "Designed to prepare your body for restful sleep",
  },
  {
    name: "Energy Boost",
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 0,
    description: "Box breathing to increase focus and energy",
  },
  {
    name: "Anxiety Relief",
    inhale: 4,
    hold: 0,
    exhale: 8,
    pause: 0,
    description: "Extended exhale to calm the nervous system",
  },
];

export const BreatheSyncPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const pattern = patterns[currentPattern]!;

  const startBreathing = () => {
    setIsActive(true);
    setCycleCount(0);
    setPhase("inhale");
    setTimeRemaining(pattern.inhale);
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setCircleScale(1);
  };

  const resetSession = () => {
    stopBreathing();
    setCycleCount(0);
    setPhase("inhale");
    setTimeRemaining(pattern.inhale);
    setCircleScale(1);
  };

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      const progress = (pattern[phase]! - timeRemaining) / pattern[phase]!;
      
      if (phase === "inhale") {
        setCircleScale(1 + progress * 0.5);
      } else if (phase === "exhale") {
        setCircleScale(1.5 - progress * 0.5);
      } else {
        setCircleScale(phase === "hold" ? 1.5 : 1);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, phase, timeRemaining, pattern]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            if (pattern.hold > 0) {
              setPhase("hold");
              return pattern.hold;
            } else {
              setPhase("exhale");
              return pattern.exhale;
            }
          } else if (phase === "hold") {
            setPhase("exhale");
            return pattern.exhale;
          } else if (phase === "exhale") {
            if (pattern.pause > 0) {
              setPhase("pause");
              return pattern.pause;
            } else {
              setCycleCount((c) => c + 1);
              setPhase("inhale");
              return pattern.inhale;
            }
          } else {
            setCycleCount((c) => c + 1);
            setPhase("inhale");
            return pattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, pattern]);

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "pause":
        return "Pause";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-emerald-400 to-emerald-600";
      case "hold":
        return "from-blue-400 to-blue-600";
      case "exhale":
        return "from-sky-400 to-sky-600";
      case "pause":
        return "from-slate-300 to-slate-400";
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-emerald-900">BreatheSync</h1>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-80 w-80 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 opacity-50" />
            <div
              className="absolute inset-8 rounded-full border-4 border-emerald-200 opacity-30"
              style={{
                transform: `scale(${circleScale * 0.7})`,
                transition: "transform 0.1s ease-out",
              }}
            />
            <div
              className={`absolute inset-16 rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-2xl transition-all duration-300 ease-in-out`}
              style={{
                transform: `scale(${circleScale})`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl font-semibold text-white drop-shadow-lg">
                  {getPhaseText()}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-12 text-center">
              <div className="text-4xl font-bold text-emerald-700">
                {timeRemaining}
              </div>
              <div className="mt-1 text-sm text-emerald-600">
                Cycle {cycleCount + 1}
              </div>
            </div>
          </div>
          <div className="mt-16 flex items-center gap-4">
            {!isActive ? (
              <button
                onClick={startBreathing}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
              >
                <Play className="h-5 w-5" />
                Start Session
              </button>
            ) : (
              <>
                <button
                  onClick={stopBreathing}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </button>
                <button
                  onClick={resetSession}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">Breathing Patterns</h2>
            <p className="mt-2 text-sm text-emerald-700/80">
              Choose a pattern that matches your current need
            </p>
            <div className="mt-4 space-y-3">
              {patterns.map((p, index) => (
                <button
                  key={p.name}
                  onClick={() => {
                    if (!isActive) {
                      setCurrentPattern(index);
                      setTimeRemaining(p.inhale);
                      setPhase("inhale");
                    }
                  }}
                  disabled={isActive}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    currentPattern === index
                      ? "border-emerald-500 bg-white shadow-md"
                      : "border-emerald-200 bg-white/80 hover:border-emerald-300"
                  } ${isActive ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-emerald-900">{p.name}</h3>
                      <p className="mt-1 text-xs text-emerald-700/80">{p.description}</p>
                    </div>
                    <div className="text-right text-xs font-mono text-emerald-600">
                      {p.inhale}-{p.hold > 0 ? `${p.hold}-` : ""}
                      {p.exhale}
                      {p.pause > 0 ? `-${p.pause}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-6">
            <h3 className="text-lg font-semibold text-sky-900">Current Pattern</h3>
            <div className="mt-4 space-y-2 text-sm text-sky-800">
              <div className="flex justify-between">
                <span>Inhale:</span>
                <span className="font-semibold">{pattern.inhale}s</span>
              </div>
              {pattern.hold > 0 && (
                <div className="flex justify-between">
                  <span>Hold:</span>
                  <span className="font-semibold">{pattern.hold}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Exhale:</span>
                <span className="font-semibold">{pattern.exhale}s</span>
              </div>
              {pattern.pause > 0 && (
                <div className="flex justify-between">
                  <span>Pause:</span>
                  <span className="font-semibold">{pattern.pause}s</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-sky-700/80">{pattern.description}</p>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-6">
            <h3 className="text-lg font-semibold text-amber-900">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Find a comfortable, quiet space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Follow the circle's rhythm with your breath</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Start with 3-5 cycles, gradually increase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Focus on smooth, natural breathing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

