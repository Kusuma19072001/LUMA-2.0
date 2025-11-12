import React from "react";
import { X } from "lucide-react";
import type { UserPreferences } from "../types/database";

type EditPreferencesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
};

export const EditPreferencesModal = ({
  isOpen,
  onClose,
  preferences,
  onSave,
}: EditPreferencesModalProps) => {
  const [formData, setFormData] = React.useState<UserPreferences>(preferences);

  React.useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (
    field: keyof UserPreferences,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-semibold text-emerald-900">
          Edit Preferences
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="userName"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              User Name
            </label>
            <input
              type="text"
              id="userName"
              value={formData.userName}
              onChange={(e) => handleChange("userName", e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="supportFocus"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              Support Focus
            </label>
            <select
              id="supportFocus"
              value={formData.supportFocus}
              onChange={(e) => handleChange("supportFocus", e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="Stress recovery and mindful check-ins">
                Stress recovery and mindful check-ins
              </option>
              <option value="Anxiety management and calm techniques">
                Anxiety management and calm techniques
              </option>
              <option value="Sleep improvement and relaxation">
                Sleep improvement and relaxation
              </option>
              <option value="Focus and productivity enhancement">
                Focus and productivity enhancement
              </option>
              <option value="Emotional regulation and balance">
                Emotional regulation and balance
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notificationStyle"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              Notification Style
            </label>
            <select
              id="notificationStyle"
              value={formData.notificationStyle}
              onChange={(e) => handleChange("notificationStyle", e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="Gentle reminders, weekday mornings">
                Gentle reminders, weekday mornings
              </option>
              <option value="Daily morning and evening check-ins">
                Daily morning and evening check-ins
              </option>
              <option value="Weekly summary on Sundays">
                Weekly summary on Sundays
              </option>
              <option value="Custom schedule (set in reminders)">
                Custom schedule (set in reminders)
              </option>
              <option value="No notifications">No notifications</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="voiceGuidance"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              Voice Guidance
            </label>
            <select
              id="voiceGuidance"
              value={formData.voiceGuidance}
              onChange={(e) => handleChange("voiceGuidance", e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="Enabled for evening sessions">
                Enabled for evening sessions
              </option>
              <option value="Enabled for all sessions">
                Enabled for all sessions
              </option>
              <option value="Enabled for morning sessions only">
                Enabled for morning sessions only
              </option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="journalPrivacy"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              Journal Privacy
            </label>
            <select
              id="journalPrivacy"
              value={formData.journalPrivacy}
              onChange={(e) => handleChange("journalPrivacy", e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="End-to-end encryption with biometric unlock">
                End-to-end encryption with biometric unlock
              </option>
              <option value="Local encryption with passphrase">
                Local encryption with passphrase
              </option>
              <option value="Standard local storage">
                Standard local storage
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

