import React from "react";
import { X } from "lucide-react";
import { saveSurveyResponse } from "../services/database";

type SurveyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Section 1: Emotional & Mood
const MOOD_OPTIONS = [
  { value: "Happy", emoji: "😊" },
  { value: "Calm", emoji: "😌" },
  { value: "Sad", emoji: "😢" },
  { value: "Anxious", emoji: "😰" },
  { value: "Frustrated", emoji: "😤" },
  { value: "Tired", emoji: "😴" },
  { value: "Neutral", emoji: "😐" },
];

const FEELING_OPTIONS = [
  "Grateful",
  "Lonely",
  "Focused",
  "Relaxed",
  "Stressed",
  "Hopeful",
  "Overwhelmed",
];

// Section 2: Physical Energy & Rest
const ENERGY_LEVELS = ["Low", "Moderate", "High"];

const PHYSICAL_ACTIVITIES = [
  { value: "Yoga", emoji: "🧘‍♀️" },
  { value: "Walk", emoji: "🚶‍♀️" },
  { value: "Exercise", emoji: "🏃‍♀️" },
  { value: "Rest Day", emoji: "🪑" },
];

// Section 3: Connection & Support
const INTERACTION_FEELINGS = ["Uplifted", "Neutral", "Draining"];

// Section 5: Tomorrow's Focus
const TOMORROW_FOCUS_OPTIONS = [
  "Calm",
  "Motivation",
  "Sleep",
  "Productivity",
  "Balance",
  "Joy",
];

// Slider Component
const SliderInput = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel: string;
  rightLabel: string;
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-emerald-700">
        {label}
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={min}
            max={max}
            value={value || min}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-sm font-semibold text-emerald-700 min-w-[3rem] text-center">
            {value || min}
          </span>
        </div>
        <div className="flex justify-between text-xs text-emerald-600">
          <span>{min} = {leftLabel}</span>
          <span>{max} = {rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

// Toggle Component
const ToggleInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-emerald-700">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-emerald-600 min-w-[3rem]">
        {value === undefined ? "" : value ? "Yes" : "No"}
      </span>
    </div>
  );
};

export const SurveyModal = ({ isOpen, onClose }: SurveyModalProps) => {
  // Section 1: Emotional & Mood
  const [presentMood, setPresentMood] = React.useState("");
  const [feelingRightNow, setFeelingRightNow] = React.useState("");
  const [stressLevel, setStressLevel] = React.useState<number | undefined>(undefined);
  const [whatsOnMind, setWhatsOnMind] = React.useState("");

  // Section 2: Physical Energy & Rest
  const [sleepHours, setSleepHours] = React.useState("");
  const [sleepRestfulness, setSleepRestfulness] = React.useState<number | undefined>(undefined);
  const [energyLevel, setEnergyLevel] = React.useState("");
  const [physicalActivity, setPhysicalActivity] = React.useState<string[]>([]);

  // Section 3: Connection & Support
  const [interactedToday, setInteractedToday] = React.useState<boolean | undefined>(undefined);
  const [interactionFeeling, setInteractionFeeling] = React.useState("");
  const [supportLevel, setSupportLevel] = React.useState<number | undefined>(undefined);

  // Section 4: Mindfulness & Gratitude
  const [pausedReflected, setPausedReflected] = React.useState<boolean | undefined>(undefined);
  const [gratefulFor, setGratefulFor] = React.useState("");
  const [smallWin, setSmallWin] = React.useState("");

  // Section 5: Tomorrow's Focus
  const [tomorrowFocus, setTomorrowFocus] = React.useState("");
  const [wantActivitySuggestion, setWantActivitySuggestion] = React.useState<boolean | undefined>(undefined);

  // Section 6: Notes
  const [additionalNotes, setAdditionalNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSection, setCurrentSection] = React.useState(1);

  React.useEffect(() => {
    if (!isOpen) {
      // Reset all form fields when modal closes
      setPresentMood("");
      setFeelingRightNow("");
      setStressLevel(undefined);
      setWhatsOnMind("");
      setSleepHours("");
      setSleepRestfulness(undefined);
      setEnergyLevel("");
      setPhysicalActivity([]);
      setInteractedToday(undefined);
      setInteractionFeeling("");
      setSupportLevel(undefined);
      setPausedReflected(undefined);
      setGratefulFor("");
      setSmallWin("");
      setTomorrowFocus("");
      setWantActivitySuggestion(undefined);
      setAdditionalNotes("");
      setCurrentSection(1);
    }
  }, [isOpen]);

  const handleActivityToggle = (activity: string) => {
    setPhysicalActivity((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = {
        id: crypto.randomUUID(),
        presentMood: presentMood || undefined,
        feelingRightNow: feelingRightNow || undefined,
        stressLevel,
        whatsOnMind: whatsOnMind || undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        sleepRestfulness,
        energyLevel: energyLevel || undefined,
        physicalActivity: physicalActivity.length > 0 ? physicalActivity : undefined,
        interactedToday,
        interactionFeeling: interactionFeeling || undefined,
        supportLevel,
        pausedReflected,
        gratefulFor: gratefulFor || undefined,
        smallWin: smallWin || undefined,
        tomorrowFocus: tomorrowFocus || undefined,
        wantActivitySuggestion,
        additionalNotes: additionalNotes || undefined,
        createdAt: Date.now(),
      };

      await saveSurveyResponse(response);
      onClose();
    } catch (error) {
      console.error("Failed to save survey:", error);
      alert("Failed to save survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalSections = 6;
  const sectionTitles = [
    "Emotional & Mood",
    "Physical Energy & Rest",
    "Connection & Support",
    "Mindfulness & Gratitude",
    "Tomorrow's Focus",
    "Notes (Optional)",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50 z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-emerald-900">
            LUMA Daily Well-Being Check-In
          </h2>
          <p className="mt-1 text-sm text-emerald-700/80">
            Section {currentSection} of {totalSections}: {sectionTitles[currentSection - 1]}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Emotional & Mood */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Section 1: Emotional & Mood
                </h3>
                <p className="text-xs text-emerald-700/80">
                  Goal: Capture emotional tone and stress.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  1. How&apos;s your present mood?
                </label>
                <select
                  value={presentMood}
                  onChange={(e) => setPresentMood(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                >
                  <option value="">Select your mood</option>
                  {MOOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  2. How are you feeling right now?
                </label>
                <select
                  value={feelingRightNow}
                  onChange={(e) => setFeelingRightNow(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                >
                  <option value="">Select how you&apos;re feeling</option>
                  {FEELING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <SliderInput
                label="3. Did you feel stressed or tense today?"
                value={stressLevel}
                onChange={setStressLevel}
                leftLabel="Very calm"
                rightLabel="Very stressed"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  4. What&apos;s been on your mind the most today?
                </label>
                <input
                  type="text"
                  value={whatsOnMind}
                  onChange={(e) => setWhatsOnMind(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                  placeholder="e.g., Worrying about work, Excited about a new idea"
                />
              </div>
            </div>
          )}

          {/* Section 2: Physical Energy & Rest */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  💪 Section 2: Physical Energy & Rest
                </h3>
                <p className="text-xs text-emerald-700/80">
                  Goal: Correlate physical health with mood.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  5. How long did you sleep last night? (hours)
                </label>
                <input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  min="0"
                  max="24"
                  step="0.5"
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                  placeholder="e.g., 7.5"
                />
              </div>

              <SliderInput
                label="6. How restful was your sleep?"
                value={sleepRestfulness}
                onChange={setSleepRestfulness}
                leftLabel="Poor"
                rightLabel="Deep rest"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  7. How&apos;s your energy level today?
                </label>
                <select
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                >
                  <option value="">Select energy level</option>
                  {ENERGY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-emerald-700">
                  8. Did you do any physical activity today?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PHYSICAL_ACTIVITIES.map((activity) => (
                    <button
                      key={activity.value}
                      type="button"
                      onClick={() => handleActivityToggle(activity.value)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                        physicalActivity.includes(activity.value)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-emerald-200 bg-white text-emerald-600 hover:border-emerald-300"
                      }`}
                    >
                      <span>{activity.emoji}</span>
                      <span>{activity.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Connection & Support */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Section 3: Connection & Support
                </h3>
                <p className="text-xs text-emerald-700/80">
                  Goal: Detect social well-being and isolation trends.
                </p>
              </div>

              <ToggleInput
                label="9. Did you interact with anyone today?"
                value={interactedToday}
                onChange={setInteractedToday}
              />

              {interactedToday === true && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-emerald-700">
                    10. How did that interaction make you feel?
                  </label>
                  <select
                    value={interactionFeeling}
                    onChange={(e) => setInteractionFeeling(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                  >
                    <option value="">Select feeling</option>
                    {INTERACTION_FEELINGS.map((feeling) => (
                      <option key={feeling} value={feeling}>
                        {feeling}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <SliderInput
                label="11. Do you feel supported by people around you?"
                value={supportLevel}
                onChange={setSupportLevel}
                leftLabel="Not at all"
                rightLabel="Deeply supported"
              />
            </div>
          )}

          {/* Section 4: Mindfulness & Gratitude */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Section 4: Mindfulness & Gratitude
                </h3>
                <p className="text-xs text-emerald-700/80">
                  Goal: Encourage positivity and balance.
                </p>
              </div>

              <ToggleInput
                label="12. Did you take a moment to pause or reflect today?"
                value={pausedReflected}
                onChange={setPausedReflected}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  13. What&apos;s one thing you&apos;re grateful for today?
                </label>
                <input
                  type="text"
                  value={gratefulFor}
                  onChange={(e) => setGratefulFor(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                  placeholder="e.g., A quiet morning walk"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  14. What&apos;s one small win from today?
                </label>
                <input
                  type="text"
                  value={smallWin}
                  onChange={(e) => setSmallWin(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                  placeholder="e.g., Finished a task I was avoiding"
                />
              </div>
            </div>
          )}

          {/* Section 5: Tomorrow's Focus */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Section 5: Tomorrow&apos;s Focus
                </h3>
                <p className="text-xs text-emerald-700/80">
                  Goal: Give LUMA data to offer next-day guidance.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  15. What would you like to focus on tomorrow?
                </label>
                <select
                  value={tomorrowFocus}
                  onChange={(e) => setTomorrowFocus(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                >
                  <option value="">Select focus area</option>
                  {TOMORROW_FOCUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <ToggleInput
                label="16. Would you like LUMA to suggest an activity later?"
                value={wantActivitySuggestion}
                onChange={setWantActivitySuggestion}
              />
            </div>
          )}

          {/* Section 6: Notes (Optional) */}
          {currentSection === 6 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Section 6: Notes (Optional)
                </h3>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-700">
                  17. Additional notes
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60 resize-none"
                  placeholder='e.g., "Felt better after my meditation session."'
                />
              </div>
            </div>
          )}

          {/* Navigation and Submit */}
          <div className="flex gap-3 pt-4 border-t border-emerald-200">
            {currentSection > 1 && (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection - 1)}
                className="rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Previous
              </button>
            )}
            <div className="flex-1" />
            {currentSection < totalSections ? (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Submit Survey"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
