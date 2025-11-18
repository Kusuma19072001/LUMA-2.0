import { useEffect, useState } from "react";
import { getAnalyticsData } from "../services/database.ts";
import type { AnalyticsData } from "../types/database.ts";

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalyticsData();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-emerald-900">Analytics</h1>
          <p className="text-sm text-emerald-700/80">Loading your wellbeing data...</p>
        </header>
      </div>
    );
  }

  // Calculate mood balance percentage (simplified: positive vs negative moods)
  const recentMoods = analytics.moodTrends.slice(-7);
  const totalMoodEntries = recentMoods.reduce((sum, day) => sum + day.count, 0);
  const moodBalance = totalMoodEntries > 0 ? Math.min(100, Math.round((totalMoodEntries / 7) * 100)) : 0;

  // Calculate average breathing/exercise sessions per week
  const totalSessions = analytics.totalBreathingSessions + analytics.totalExerciseSessions;
  const avgSessionsPerWeek = totalSessions > 0 ? (totalSessions / Math.max(1, Math.floor((Date.now() - analytics.lastActivityDate) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1) : "0";

  const analyticsCards = [
    {
      title: "Mood Entries",
      value: analytics.totalMoodEntries.toString(),
      trend: totalMoodEntries > 0 ? `${totalMoodEntries} this week` : "Start tracking your mood",
      tone: "from-emerald-200 via-emerald-100 to-white text-emerald-800",
    },
    {
      title: "Mindfulness Streak",
      value: `${analytics.activityStreak} days`,
      trend: analytics.activityStreak > 0 ? "Keep it going!" : "Start your journey",
      tone: "from-amber-200 via-amber-100 to-white text-amber-800",
    },
    {
      title: "Total Sessions",
      value: totalSessions.toString(),
      trend: `${analytics.totalBreathingSessions} breathing, ${analytics.totalExerciseSessions} exercises`,
      tone: "from-sky-200 via-sky-100 to-white text-sky-800",
    },
    {
      title: "Chat Messages",
      value: analytics.totalChatMessages.toString(),
      trend: analytics.totalChatMessages > 0 ? "Meaningful conversations" : "Start chatting with LUMA",
      tone: "from-rose-200 via-rose-100 to-white text-rose-800",
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-emerald-900">Analytics</h1>
        <p className="text-sm text-emerald-700/80">
          Track your wellbeing trends and celebrate steady progress.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {analyticsCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-3xl border border-white/60 bg-gradient-to-br p-6 shadow-xl backdrop-blur ${card.tone}`}
          >
            <p className="text-sm uppercase tracking-wide text-emerald-900/60">
              {card.title}
            </p>
            <p className="mt-4 text-4xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm font-medium">{card.trend}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <h2 className="text-lg font-semibold text-emerald-900">Weekly Activity</h2>
        <div className="mt-4 space-y-3">
          {analytics.weeklyActivity.map((day, index) => (
            <div key={index} className="flex items-center justify-between text-sm text-emerald-700/90">
              <span className="font-medium">{day.day}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, (day.activities / Math.max(1, Math.max(...analytics.weeklyActivity.map(d => d.activities)))) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs">{day.activities}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {analytics.totalMoodEntries > 0 && (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
          <h2 className="text-lg font-semibold text-emerald-900">Mood Trends (Last 7 Days)</h2>
          <div className="mt-4 space-y-2 text-sm text-emerald-700/90">
            {analytics.moodTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="font-medium">{trend.count} {trend.count === 1 ? 'entry' : 'entries'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};


