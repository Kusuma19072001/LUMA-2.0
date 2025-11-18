import { useState } from "react";
import { ArrowLeft, CalendarClock, Plus, Trash2 } from "lucide-react";

type Reminder = {
  id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
};

type RemindersPageProps = {
  onNavigate?: (tab: "canvas" | "home" | "chat" | "analytics" | "exercises" | "profile" | "breathesync" | "reminders" | "achievements") => void;
};

export const RemindersPage = ({ onNavigate }: RemindersPageProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Morning meditation",
      time: "08:00",
      date: new Date().toLocaleDateString(),
      completed: false,
    },
    {
      id: "2",
      title: "Evening reflection",
      time: "20:00",
      date: new Date().toLocaleDateString(),
      completed: true,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", time: "", date: "" });

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.time && newReminder.date) {
      setReminders([
        ...reminders,
        {
          id: crypto.randomUUID(),
          title: newReminder.title,
          time: newReminder.time,
          date: newReminder.date,
          completed: false,
        },
      ]);
      setNewReminder({ title: "", time: "", date: "" });
      setShowAddForm(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-emerald-900">Reminders</h1>
            <p className="text-sm text-emerald-700/80">Stay on track with your wellness routine</p>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-emerald-900">Your Reminders</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-emerald-900">New Reminder</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                />
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddReminder}
                  className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewReminder({ title: "", time: "", date: "" });
                  }}
                  className="flex-1 rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="py-12 text-center text-emerald-700/80">
            <CalendarClock className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <p>No reminders yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-4 rounded-3xl border p-4 transition ${
                  reminder.completed
                    ? "border-emerald-200 bg-emerald-50/50 opacity-75"
                    : "border-emerald-100 bg-white shadow-sm"
                }`}
              >
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => handleToggleComplete(reminder.id)}
                  className="h-5 w-5 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-300"
                />
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      reminder.completed
                        ? "text-emerald-600 line-through"
                        : "text-emerald-900"
                    }`}
                  >
                    {reminder.title}
                  </h3>
                  <p className="text-sm text-emerald-700/80">
                    {reminder.date} at {reminder.time}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

