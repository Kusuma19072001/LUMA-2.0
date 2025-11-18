import React from "react";
import { CalendarClock, Sparkles, Star, Sun, ClipboardList } from "lucide-react";
import { SurveyModal } from "../components/SurveyModal";
import { useAuth } from "../contexts/AuthContext";
import { getSurveyResponses } from "../services/database";
import type { SurveyResponse } from "../types/database";

type WelcomePageProps = {
  onStartChat?: () => void;
  onOpenMoodCanvas?: () => void;
  onOpenExercises?: (exerciseId?: string) => void;
  onOpenBreatheSync?: () => void;
  onOpenReminders?: () => void;
  onOpenAchievements?: () => void;
};

type ActionTile = {
  title: string;
  description: string;
  accent: string;
  actionLabel?: string;
  onClick?: () => void;
};

// Exercise suggestions mapping
type ExerciseSuggestion = {
  exerciseId: string;
  exerciseName: string;
};

const getPersonalizedSuggestion = (survey: SurveyResponse | null): ExerciseSuggestion => {
  // Default suggestion if no survey data
  if (!survey) {
    return {
      exerciseId: "deep-sleep-meditation",
      exerciseName: "Deep Sleep Meditation",
    };
  }

  const {
    presentMood,
    feelingRightNow,
    stressLevel,
    energyLevel,
    sleepHours,
    sleepRestfulness,
    tomorrowFocus,
    physicalActivity,
  } = survey;

  // High stress or anxious mood → Release & Let Go
  if (
    (stressLevel !== undefined && stressLevel >= 4) ||
    presentMood === "Anxious" ||
    feelingRightNow === "Stressed" ||
    feelingRightNow === "Overwhelmed"
  ) {
    return {
      exerciseId: "release-let-go",
      exerciseName: "Release & Let Go",
    };
  }

  // Low energy or tired → Deep Sleep Meditation
  if (
    energyLevel === "Low" ||
    presentMood === "Tired" ||
    (sleepHours !== undefined && sleepHours < 6) ||
    (sleepRestfulness !== undefined && sleepRestfulness <= 2)
  ) {
    return {
      exerciseId: "deep-sleep-meditation",
      exerciseName: "Deep Sleep Meditation",
    };
  }

  // Tomorrow's focus: Sleep → Deep Sleep Meditation
  if (tomorrowFocus === "Sleep") {
    return {
      exerciseId: "deep-sleep-meditation",
      exerciseName: "Deep Sleep Meditation",
    };
  }

  // Tomorrow's focus: Motivation or Productivity → Focus Builder or Self-Confidence Recharge
  if (tomorrowFocus === "Motivation" || tomorrowFocus === "Productivity") {
    return {
      exerciseId: "focus-builder",
      exerciseName: "Focus Builder",
    };
  }

  // Tomorrow's focus: Calm → Morning Grounding or Midday Reset
  if (tomorrowFocus === "Calm") {
    return {
      exerciseId: "morning-grounding",
      exerciseName: "Morning Grounding",
    };
  }

  // Sad or lonely mood → Compassion Check-In
  if (
    presentMood === "Sad" ||
    feelingRightNow === "Lonely" ||
    feelingRightNow === "Grateful" // Gratitude can benefit from compassion work
  ) {
    return {
      exerciseId: "compassion-check-in",
      exerciseName: "Compassion Check-In",
    };
  }

  // Frustrated mood → Release & Let Go
  if (presentMood === "Frustrated") {
    return {
      exerciseId: "release-let-go",
      exerciseName: "Release & Let Go",
    };
  }

  // Moderate stress → Midday Reset
  if (stressLevel !== undefined && stressLevel === 3) {
    return {
      exerciseId: "midday-reset",
      exerciseName: "Midday Reset",
    };
  }

  // High energy but needs focus → Focus Builder
  if (energyLevel === "High" && (tomorrowFocus === "Productivity" || feelingRightNow === "Focused")) {
    return {
      exerciseId: "focus-builder",
      exerciseName: "Focus Builder",
    };
  }

  // Rest day or no physical activity → Morning Grounding or Midday Reset
  if (physicalActivity && physicalActivity.includes("Rest Day")) {
    return {
      exerciseId: "morning-grounding",
      exerciseName: "Morning Grounding",
    };
  }

  // Default: Midday Reset (good general option)
  return {
    exerciseId: "midday-reset",
    exerciseName: "Midday Reset",
  };
};

export const WelcomePage = ({ onStartChat, onOpenMoodCanvas: _onOpenMoodCanvas, onOpenExercises, onOpenBreatheSync, onOpenReminders, onOpenAchievements }: WelcomePageProps) => {
  const { user } = useAuth();
  const [isSurveyModalOpen, setIsSurveyModalOpen] = React.useState(false);
  const [personalizedSuggestion, setPersonalizedSuggestion] = React.useState<ExerciseSuggestion>({
    exerciseId: "deep-sleep-meditation",
    exerciseName: "Deep Sleep Meditation",
  });
  
  // const userName = user ? `${user.firstName} ${user.lastName}` : "Demo User";
  const firstName = user?.firstName || "Demo";

  // Load personalized suggestion from most recent survey
  React.useEffect(() => {
    const loadSuggestion = async () => {
      try {
        const surveys = await getSurveyResponses(1); // Get most recent survey
        const mostRecentSurvey = surveys.length > 0 ? surveys[0] : null;
        const suggestion = getPersonalizedSuggestion(mostRecentSurvey);
        setPersonalizedSuggestion(suggestion);
      } catch (error) {
        console.error("Failed to load survey for suggestion:", error);
      }
    };

    loadSuggestion();
  }, []);

  // Reload suggestion when survey modal closes (new survey submitted)
  React.useEffect(() => {
    if (!isSurveyModalOpen) {
      const loadSuggestion = async () => {
        try {
          const surveys = await getSurveyResponses(1);
          const mostRecentSurvey = surveys.length > 0 ? surveys[0] : null;
          const suggestion = getPersonalizedSuggestion(mostRecentSurvey);
          setPersonalizedSuggestion(suggestion);
        } catch (error) {
          console.error("Failed to load survey for suggestion:", error);
        }
      };
      loadSuggestion();
    }
  }, [isSurveyModalOpen]);

  const quickActions = [
    { label: "Reminders", icon: CalendarClock, tone: "bg-emerald-100 text-emerald-700", onClick: onOpenReminders },
    { label: "Achievements", icon: Star, tone: "bg-amber-100 text-amber-700", onClick: onOpenAchievements },
  ];
  const actionTiles: ActionTile[] = [
    { title: "Start Workout", description: "Move with guidance from Luma.", accent: "bg-emerald-50 text-emerald-600" },
    { title: "My Analytics", description: "Track your progress and trends.", accent: "bg-amber-50 text-amber-600" },
    {
      title: "BreatheSync",
      description: "AI-personalized breathing powered by Gemini 2.5 Flash.",
      accent: "bg-sky-50 text-sky-600",
    },
    {
      title: "MoodCanvas",
      description: "Describe your mood, receive abstract AI art.",
      accent: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <section className="space-y-2 text-emerald-900">
        <p className="text-sm uppercase tracking-[0.32em] text-emerald-500">
          LUMA
        </p>
        <h1 className="text-4xl font-semibold">A gentle space for thoughts to breathe.</h1>
        <p className="text-base text-emerald-700/80 dark:text-emerald-300/80">
          Welcome back, {firstName}. Take a deep breath—your wellbeing companion is ready.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Hello, {firstName}!</p>
              <h2 className="text-lg font-semibold text-emerald-900">
                Ready to check in?
              </h2>
            </div>
          </div>
          <button
            onClick={onStartChat}
            className="mt-auto inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Start Chat
          </button>
        </div>

        <div className="flex flex-col rounded-4xl border-2 border-violet-200/60 bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90 p-6 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-purple-300 text-violet-700 shadow-md">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Survey Time
              </h3>
              <p className="mt-1 text-base font-medium text-emerald-900">
                Time for your mood check!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSurveyModalOpen(true)}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-violet-600 hover:to-purple-600"
          >
            Take Survey
          </button>
        </div>

        <div className="flex flex-col rounded-4xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 p-6 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-300 text-amber-700 shadow-md">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Just for You
              </h3>
              <p className="mt-1 text-base font-medium text-emerald-900">
                Try <span className="text-orange-600 font-semibold">"{personalizedSuggestion.exerciseName}"</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => onOpenExercises?.(personalizedSuggestion.exerciseId)}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-500 hover:to-orange-500"
          >
            Let's Go
          </button>
        </div>
      </section>

      <SurveyModal 
        isOpen={isSurveyModalOpen} 
        onClose={() => setIsSurveyModalOpen(false)} 
      />

      <section className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <div className="space-y-4 text-emerald-900">
            <h2 className="text-3xl font-semibold">Meet BreatheSync</h2>
            <p className="text-base text-emerald-700/80">
              LUMA guides you through short, AI-personalized breathing sessions based on your detected mood or stress level.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-emerald-700/90">
              <li>Gemini 2.5 Flash analyzes your tone and suggests the right exercise.</li>
              <li>Live breathing circle keeps your inhale and exhale in sync.</li>
              <li>Calming visuals pair with optional background music for deeper relaxation.</li>
            </ul>
            <button 
              onClick={onOpenBreatheSync}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-600"
            >
              Start a BreatheSync Session
            </button>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 opacity-70" />
              <div className="absolute inset-4 rounded-full border-4 border-emerald-200 opacity-70 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                Breathe
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actionTiles.map((tile) => (
          <div
            key={tile.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur"
          >
            <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tile.accent}`}>
              {tile.title}
            </div>
            <p className="text-sm text-emerald-700/90">{tile.description}</p>
            {tile.actionLabel && tile.onClick && (
              <button
                onClick={tile.onClick}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-600"
              >
                {tile.actionLabel}
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
          <h3 className="text-xl font-semibold text-emerald-900">Today's Summary</h3>
          <div className="mt-4 flex items-start gap-3 rounded-3xl bg-emerald-50/80 p-5 text-sm text-emerald-700">
            <Sun className="h-6 w-6 text-amber-500" />
            <div>
              <p className="font-medium">Great job keeping up your mood!</p>
              <p>Mood: Happy</p>
            </div>
          </div>
        </div>
        <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
          <h3 className="text-xl font-semibold text-emerald-900">Quick Actions</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition hover:shadow ${action.tone}`}
              >
                <action.icon className="h-5 w-5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


