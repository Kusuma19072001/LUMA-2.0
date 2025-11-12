import { type CSSProperties, useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";

type Exercise = {
  id: string;
  title: string;
  minutes: number;
  description: string;
  goal: string;
  why: string;
  steps: string[];
};

type TimerStatus = "running" | "completed";

const exercises: Exercise[] = [
  {
    id: "deep-sleep-meditation",
    title: "Deep Sleep Meditation",
    minutes: 12,
    description: "Ease into restorative rest with unhurried breathwork and soft visual cues.",
    goal: "Settle your mind and body for deep, uninterrupted sleep.",
    why: "Best before bed or after a draining day to calm racing thoughts and settle your body.",
    steps: [
      "Find a comfortable position—lying down or seated with support.",
      "Breathe in for a slow count of four, hold briefly, then exhale for six.",
      "Visualize waves of relaxation moving from your head to your toes.",
      "If thoughts arise, label them gently and return attention to your breath.",
    ],
  },
  {
    id: "midday-reset",
    title: "Midday Reset",
    minutes: 7,
    description: "Ground yourself midday with a guided scan and gentle decompression.",
    goal: "Release tension and regain focus halfway through the day.",
    why: "Reach for this when you feel scattered or sluggish to re-ground mid-day.",
    steps: [
      "Sit upright, feet planted, and rest your hands softly on your lap.",
      "Inhale deeply through the nose, exhale through the mouth with a sigh.",
      "Bring awareness from the crown of your head down to your shoulders, chest, belly, and legs.",
      "With each exhale, soften any tight areas you notice.",
    ],
  },
  {
    id: "compassion-check-in",
    title: "Compassion Check-In",
    minutes: 10,
    description: "Cultivate gentle self-talk with guided affirmations and gratitude prompts.",
    goal: "Strengthen self-compassion and emotional steadiness.",
    why: "Use after tough moments to replace negative self-talk with warmth.",
    steps: [
      "Place a hand over your heart and notice its rhythm.",
      "Name one emotion you're feeling; allow it without judgment.",
      "Repeat the prompt: “Even when I feel ____, I offer myself grace.”",
      "Close with one thing you appreciate about your effort today.",
    ],
  },
  {
    id: "focus-builder",
    title: "Focus Builder",
    minutes: 5,
    description: "Re-center your attention with paced breathing and intentional planning.",
    goal: "Sharpen concentration before the next task or study block.",
    why: "Grab it before a new task to clear distractions and choose one priority.",
    steps: [
      "Sit tall and roll your shoulders back to open your chest.",
      "Breathe in for four counts, hold for two, exhale for four.",
      "Picture the outcome you want from your next task.",
      "Commit to one tangible step and mentally rehearse starting it.",
    ],
  },
  {
    id: "morning-grounding",
    title: "Morning Grounding",
    minutes: 6,
    description: "Wake gently, set an intention, and begin with balanced energy.",
    goal: "Start the day calm, centered, and purposeful.",
    why: "Try right after waking to ease into the day without adrenaline spikes.",
    steps: [
      "Take three generous breaths, stretching arms overhead on each inhale.",
      "Notice sensations: the temperature of the air, contact with the floor or chair.",
      "Ask yourself, “What quality do I want to bring into today?”",
      "Anchor that quality with a simple mantra you repeat on the exhale.",
    ],
  },
  {
    id: "release-let-go",
    title: "Release & Let Go",
    minutes: 8,
    description: "Guided visualization to soften tension, frustration, or heaviness.",
    goal: "Process difficult emotions and unwind end-of-day stress.",
    why: "Perfect when emotions feel stuck—invites release and mindful letting go.",
    steps: [
      "Close your eyes and notice where stress is held in your body.",
      "Imagine gathering the tension into a balloon with each inhale.",
      "On the exhale, visualize releasing the balloon into a calming sky.",
      "End with a grounding affirmation: “I’m allowed to let this go.”",
    ],
  },
  {
    id: "self-confidence-recharge",
    title: "Self-Confidence Recharge",
    minutes: 7,
    description: "Blend rhythmic breathing with empowering affirmations to reboot self-trust.",
    goal: "Rebuild self-worth and motivation when doubt creeps in.",
    why: "Use before a challenge to prime your mindset for confident action.",
    steps: [
      "Stand tall or sit upright; feel your feet grounded beneath you.",
      "Match inhales and exhales to a steady four-count rhythm.",
      "Repeat affirmations such as “I’m prepared, capable, and ready.”",
      "Visualize yourself succeeding at the task ahead.",
    ],
  },
];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
};

export const ExercisesPage = () => {
  const [activeSession, setActiveSession] = useState<{
    exercise: Exercise;
    remaining: number;
    status: TimerStatus;
  } | null>(null);

  const intervalRef = useRef<number | null>(null);

  const clearActiveInterval = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearActiveInterval();
    };
  }, []);

  const startSession = (exercise: Exercise) => {
    const totalSeconds = exercise.minutes * 60;

    clearActiveInterval();
    setActiveSession({ exercise, remaining: totalSeconds, status: "running" });

    intervalRef.current = window.setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || prev.status !== "running") {
          return prev;
        }

        const nextRemaining = Math.max(prev.remaining - 1, 0);

        if (nextRemaining === 0) {
          clearActiveInterval();
          return { ...prev, remaining: 0, status: "completed" };
        }

        return { ...prev, remaining: nextRemaining };
      });
    }, 1000);
  };

  // Check if we should start a specific exercise (from "Let's Go" button)
  useEffect(() => {
    const exerciseIdToStart = sessionStorage.getItem("startExercise");
    if (exerciseIdToStart && !activeSession) {
      const exercise = exercises.find((e) => e.id === exerciseIdToStart);
      if (exercise) {
        startSession(exercise);
        // Clear the flag so it doesn't restart on re-renders
        sessionStorage.removeItem("startExercise");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  const handleFinishEarly = () => {
    clearActiveInterval();
    setActiveSession((prev) =>
      prev ? { ...prev, remaining: 0, status: "completed" } : prev
    );
  };

  const handleBackToExercises = () => {
    clearActiveInterval();
    setActiveSession(null);
  };

  if (activeSession) {
    const { exercise, remaining, status } = activeSession;
    const totalSeconds = exercise.minutes * 60;
    const progressRatio = status === "completed" ? 1 : (totalSeconds - remaining) / totalSeconds;
    const progressDegrees = Math.round(progressRatio * 360);

    const ringStyle: CSSProperties = {
      background: `conic-gradient(#34d399 ${progressDegrees}deg, rgba(52,211,153,0.12) ${progressDegrees}deg)`,
    };

    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <button
          onClick={handleBackToExercises}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exercises
        </button>

        <div className="rounded-[2.75rem] bg-gradient-to-br from-[#F4FFFB] via-white to-[#E4FBF4] p-10 text-center shadow-[0_35px_80px_-40px_rgba(16,185,129,0.55)] backdrop-blur">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            <Heart className="h-3.5 w-3.5" />
            Guided Session
          </div>
          <div className="mx-auto flex h-56 w-56 items-center justify-center">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-full bg-emerald-100/50" />
              <div className="absolute inset-0 rounded-full" style={ringStyle} />
              <div className="absolute inset-[18%] rounded-full bg-emerald-50 shadow-inner" />
              <div className="absolute -top-2 right-[calc(50%-6px)] h-3 w-3 rounded-full bg-emerald-500 shadow" />
              <div className="relative flex h-full w-full items-center justify-center">
                <span className="text-5xl font-semibold text-emerald-700">
                  {formatTime(remaining)}
                </span>
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-emerald-800">
            {exercise.title}
          </h2>

          <p className="mt-2 text-sm text-emerald-700/80">
            {status === "completed"
              ? "Session complete. Take a moment to notice how you feel."
              : "Stay with your breath—Luma will keep time while you sink into the practice."}
          </p>

          <div className="mt-8 grid gap-5 text-left md:grid-cols-2">
            <div className="rounded-3xl bg-white/80 p-6 text-sm text-emerald-800/90 shadow-inner">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                Why it helps
              </h3>
              <p className="mt-3 leading-relaxed">{exercise.why}</p>
            </div>
            <div className="rounded-3xl bg-white/80 p-6 text-sm text-emerald-800/90 shadow-inner">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                How to practice
              </h3>
              <ul className="mt-3 space-y-3">
                {exercise.steps.map((step, index) => (
                  <li key={`${exercise.id}-step-${index}`} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-600">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {status === "completed" ? (
              <>
                <button
                  onClick={() => startSession(exercise)}
                  className="inline-flex items-center rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-emerald-900 shadow transition hover:bg-emerald-500"
                >
                  Restart Session
                </button>
                <button
                  onClick={handleBackToExercises}
                  className="inline-flex items-center rounded-full border border-emerald-300 px-6 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                >
                  Back to Exercises
                </button>
              </>
            ) : (
              <button
                onClick={handleFinishEarly}
                className="inline-flex items-center rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-emerald-900 shadow transition hover:bg-emerald-500"
              >
                Finish Early
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-emerald-900">Exercises</h1>
        <p className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700/90 shadow-sm">
          Explore LUMA’s mindful practices designed to match your day—from your first breath to your final rest.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {exercises.map((exercise) => {
          let isActive = false;
          if (activeSession) {
            const current = activeSession as {
              exercise: Exercise;
              remaining: number;
              status: TimerStatus;
            };
            isActive = current.exercise.id === exercise.id && current.status === "running";
          }

          return (
            <article
              key={exercise.title}
              className="group flex h-full flex-col rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-white/95 via-white to-emerald-50/70 p-7 shadow-[0_24px_60px_-28px_rgba(16,185,129,0.35)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_-36px_rgba(16,185,129,0.45)]"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
                {exercise.minutes} min
              </p>
              <h2 className="mt-3 text-[1.35rem] font-semibold text-emerald-900">
                {exercise.title}
              </h2>
              <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 shadow-sm">
                Goal
                <span className="text-[11px] normal-case tracking-normal text-emerald-700">{exercise.goal}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-emerald-700/90">{exercise.description}</p>
              <p className="mt-3 text-xs font-medium text-emerald-600/90">
                When to choose it: <span className="font-semibold text-emerald-700">{exercise.why}</span>
              </p>
              <button
                onClick={() => startSession(exercise)}
                disabled={isActive}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isActive ? "In Progress..." : "Start Session"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
};


