import React, { useState } from "react";
import { X, Lock } from "lucide-react";

type PinSecurityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean;
  title?: string;
  description?: string;
};

const PIN_STORAGE_KEY = "luma_positive_reflections_pin";

// Get or set the pin from localStorage
const getStoredPin = (): string | null => {
  return localStorage.getItem(PIN_STORAGE_KEY);
};

const setStoredPin = (pin: string): void => {
  localStorage.setItem(PIN_STORAGE_KEY, pin);
};

export const PinSecurityModal = ({
  isOpen,
  onClose,
  onVerify,
  title = "Secure Access",
  description = "Enter your PIN to access your positive reflections",
}: PinSecurityModalProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      // Check if pin is already set
      const storedPin = getStoredPin();
      setIsSettingUp(!storedPin);
      setPin("");
      setConfirmPin("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSettingUp) {
      // Setting up new PIN
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match");
        return;
      }
      setStoredPin(pin);
      setIsSettingUp(false);
      setPin("");
      setConfirmPin("");
      onVerify(pin);
      onClose();
    } else {
      // Verifying existing PIN
      const storedPin = getStoredPin();
      if (!storedPin) {
        setError("No PIN set. Please set up a PIN first.");
        setIsSettingUp(true);
        return;
      }
      if (pin !== storedPin) {
        setError("Incorrect PIN. Please try again.");
        setPin("");
        return;
      }
      onVerify(pin);
      onClose();
      setPin("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Lock className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-emerald-900">
              {isSettingUp ? "Set Up PIN" : title}
            </h2>
            <p className="mt-2 text-sm text-emerald-700/80">
              {isSettingUp
                ? "Create a PIN to secure your positive reflections"
                : description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="pin"
              className="mb-2 block text-sm font-medium text-emerald-700"
            >
              {isSettingUp ? "Enter PIN (min 4 digits)" : "Enter PIN"}
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only numbers
                setPin(value);
                setError("");
              }}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-center text-2xl tracking-widest text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
              placeholder="••••"
              maxLength={10}
              autoFocus
              required
            />
          </div>

          {isSettingUp && (
            <div>
              <label
                htmlFor="confirmPin"
                className="mb-2 block text-sm font-medium text-emerald-700"
              >
                Confirm PIN
              </label>
              <input
                type="password"
                id="confirmPin"
                value={confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only numbers
                  setConfirmPin(value);
                  setError("");
                }}
                className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-center text-2xl tracking-widest text-emerald-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/60"
                placeholder="••••"
                maxLength={10}
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              {isSettingUp ? "Set PIN" : "Verify"}
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

