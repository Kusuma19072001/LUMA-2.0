const exercises = [
  {
    title: "Deep Sleep Meditation",
    duration: "12 min",
    description: "Ease into restorative rest with guided breathing and visualization.",
  },
  {
    title: "Midday Reset",
    duration: "7 min",
    description: "Release tension and ground yourself with a calming body scan.",
  },
  {
    title: "Compassion Check-In",
    duration: "10 min",
    description: "Cultivate gentle self-talk and gratitude for your day so far.",
  },
  {
    title: "Focus Builder",
    duration: "5 min",
    description: "Re-center and clarify priorities before your next task.",
  },
];

export const ExercisesPage = () => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-emerald-900">Exercises</h1>
        <p className="text-sm text-emerald-700/80">
          Short guided practices to help you rest, recharge, and stay centered.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {exercises.map((exercise) => (
          <article
            key={exercise.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
              {exercise.duration}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-emerald-900">
              {exercise.title}
            </h2>
            <p className="mt-2 text-sm text-emerald-700/90">{exercise.description}</p>
            <button className="mt-5 inline-flex items-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600">
              Start Session
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};


