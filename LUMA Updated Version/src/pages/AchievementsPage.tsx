import { ArrowLeft, Star, Trophy, Award, Target } from "lucide-react";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: typeof Star;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
};

type AchievementsPageProps = {
  onNavigate?: (tab: "canvas" | "home" | "chat" | "analytics" | "exercises" | "profile" | "breathesync" | "reminders" | "achievements") => void;
};

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first chat session",
    icon: Star,
    unlocked: true,
    unlockedDate: "2024-11-10",
  },
  {
    id: "2",
    title: "Mindful Week",
    description: "Use LUMA for 7 consecutive days",
    icon: Trophy,
    unlocked: false,
    progress: 3,
    target: 7,
  },
  {
    id: "3",
    title: "Breath Master",
    description: "Complete 10 BreatheSync sessions",
    icon: Award,
    unlocked: false,
    progress: 2,
    target: 10,
  },
  {
    id: "4",
    title: "Art Collector",
    description: "Generate 5 mood canvases",
    icon: Target,
    unlocked: false,
    progress: 1,
    target: 5,
  },
  {
    id: "5",
    title: "Consistent Check-in",
    description: "Chat with LUMA 30 times",
    icon: Star,
    unlocked: false,
    progress: 12,
    target: 30,
  },
  {
    id: "6",
    title: "Exercise Enthusiast",
    description: "Complete 20 exercise sessions",
    icon: Trophy,
    unlocked: false,
    progress: 5,
    target: 20,
  },
];

export const AchievementsPage = ({ onNavigate }: AchievementsPageProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-emerald-900">Achievements</h1>
            <p className="text-sm text-emerald-700/80">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate("home");
            }
          }}
          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-2">Your Progress</h2>
          <div className="h-3 w-full rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-emerald-700/80">
            {Math.round((unlockedCount / totalCount) * 100)}% complete
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const progressPercent =
              achievement.progress && achievement.target
                ? (achievement.progress / achievement.target) * 100
                : 0;

            return (
              <div
                key={achievement.id}
                className={`rounded-3xl border p-6 transition ${
                  achievement.unlocked
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-md"
                    : "border-emerald-100 bg-white/80 shadow-sm opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                      achievement.unlocked
                        ? "bg-amber-400 text-amber-900"
                        : "bg-emerald-100 text-emerald-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        achievement.unlocked ? "text-amber-900" : "text-emerald-700"
                      }`}
                    >
                      {achievement.title}
                    </h3>
                    <p className="mt-1 text-sm text-emerald-700/80">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <p className="mt-2 text-xs text-amber-700/80">
                        Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </p>
                    )}
                    {!achievement.unlocked && achievement.progress && achievement.target && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-emerald-700/80 mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} / {achievement.target}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

