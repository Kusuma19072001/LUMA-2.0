const milestones = [
  { title: "Mindfulness Streak", detail: "12 days in a row", tone: "bg-emerald-50 text-emerald-700" },
  { title: "Completed Exercises", detail: "34 guided sessions", tone: "bg-amber-50 text-amber-700" },
  { title: "Journal Entries", detail: "16 reflections logged", tone: "bg-sky-50 text-sky-700" },
];

export const ProfilePage = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="rounded-4xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">
              Demo User
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-emerald-900">
              Profile Overview
            </h1>
            <p className="mt-2 text-sm text-emerald-700/80">
              Update your preferences and review your wins with Luma.
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-semibold">
            DU
          </div>
        </div>
        <button className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600">
          Edit Preferences
        </button>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur"
          >
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${milestone.tone}`}>
              {milestone.title}
            </div>
            <p className="mt-3 text-lg font-semibold text-emerald-900">
              {milestone.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <h2 className="text-lg font-semibold text-emerald-900">Wellbeing Preferences</h2>
        <dl className="mt-4 grid gap-4 text-sm text-emerald-700/90 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-emerald-600">Support Focus</dt>
            <dd>Stress recovery and mindful check-ins.</dd>
          </div>
          <div>
            <dt className="font-medium text-emerald-600">Notification Style</dt>
            <dd>Gentle reminders, weekday mornings.</dd>
          </div>
          <div>
            <dt className="font-medium text-emerald-600">Voice Guidance</dt>
            <dd>Enabled for evening sessions.</dd>
          </div>
          <div>
            <dt className="font-medium text-emerald-600">Journal Privacy</dt>
            <dd>End-to-end encryption with biometric unlock.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};


