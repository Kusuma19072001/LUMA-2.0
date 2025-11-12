import { CalendarClock, Sparkles, Star, Sun } from "lucide-react";

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

export const WelcomePage = ({ onStartChat, onOpenMoodCanvas, onOpenExercises, onOpenBreatheSync, onOpenReminders, onOpenAchievements }: WelcomePageProps) => {
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
        <p className="text-base text-emerald-700/80">
          Welcome back, Demo User. Take a deep breath—your wellbeing companion is ready.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-600/80">Hello, Demo User!</p>
              <h2 className="mt-1 text-2xl font-semibold text-emerald-900">
                Ready to check in?
              </h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
          <button
            onClick={onStartChat}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Start Chat
          </button>
        </div>

        <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-emerald-700">
            <Sun className="h-10 w-10 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
                Personalized Suggestion
              </h3>
              <p className="text-base text-emerald-900">
                Try the “Deep Sleep Meditation” exercise today!
              </p>
            </div>
          </div>
          <button 
            onClick={() => onOpenExercises?.("deep-sleep-meditation")}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-amber-900 shadow-lg transition hover:bg-amber-500"
          >
            Let's Go
          </button>
        </div>
      </section>

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
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
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


