const analyticsCards = [
  {
    title: "Mood Balance",
    value: "78%",
    trend: "+6% vs last week",
    tone: "from-emerald-200 via-emerald-100 to-white text-emerald-800",
  },
  {
    title: "Sleep Consistency",
    value: "6.8 hrs",
    trend: "+0.5 hrs vs average",
    tone: "from-sky-200 via-sky-100 to-white text-sky-800",
  },
  {
    title: "Mindfulness Streak",
    value: "12 days",
    trend: "Keep it going!",
    tone: "from-amber-200 via-amber-100 to-white text-amber-800",
  },
  {
    title: "Stress Recovery",
    value: "Low",
    trend: "Great improvement",
    tone: "from-rose-200 via-rose-100 to-white text-rose-800",
  },
];

export const AnalyticsPage = () => {
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
        <h2 className="text-lg font-semibold text-emerald-900">Weekly Highlights</h2>
        <ul className="mt-4 space-y-3 text-sm text-emerald-700/90">
          <li>You maintained a mindful check-in streak across 5 days.</li>
          <li>Your average stress response time improved by 14%.</li>
          <li>Sleep consistency reached your best average in the past month.</li>
        </ul>
      </section>
    </div>
  );
};


