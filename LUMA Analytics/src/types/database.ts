// Database types for LUMA local storage

export interface MoodEntry {
  id: string;
  moodPrompt: string;
  artworkDataUrl: string;
  artworkMimeType: string;
  reflection?: {
    reflection: string;
    guidanceType: "breathing" | "meditation" | "grounding" | "celebration";
    guidancePrompt: string;
    tone: {
      label: string;
      confidence: number;
      summary: string;
      palette: string;
    };
  };
  moodComparison?: {
    before: string;
    after: string;
    improvementDetected: boolean;
  };
  journalEntry?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatConversation {
  id: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
    signal?: {
      tone: string;
      confidence: number;
      summary: string;
      palette: string;
    };
  }>;
  plans?: Array<{
    headline: string;
    steps: string[];
    createdAt: number;
  }>;
  startedAt: number;
  lastMessageAt: number;
  messageCount: number;
}

export interface BreathingSession {
  id: string;
  patternName: string;
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  cyclesCompleted: number;
  durationSeconds: number;
  completed: boolean;
  createdAt: number;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  durationMinutes: number;
  durationSeconds: number;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

export interface UserActivity {
  id: string;
  type: "mood_entry" | "chat_message" | "breathing_session" | "exercise_session" | "mood_check";
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface AnalyticsData {
  totalMoodEntries: number;
  totalChatMessages: number;
  totalBreathingSessions: number;
  totalExerciseSessions: number;
  moodTrends: Array<{
    date: string;
    count: number;
    averageSentiment?: number;
  }>;
  activityStreak: number;
  lastActivityDate: number;
  weeklyActivity: Array<{
    day: string;
    activities: number;
  }>;
}

export interface UserPreferences {
  userName: string;
  supportFocus: string;
  notificationStyle: string;
  voiceGuidance: string;
  journalPrivacy: string;
}

export interface SurveyResponse {
  id: string;
  // Section 1: Emotional & Mood
  presentMood?: string; // Happy, Calm, Sad, Anxious, Frustrated, Tired, Neutral
  feelingRightNow?: string; // Grateful, Lonely, Focused, Relaxed, Stressed, Hopeful, Overwhelmed
  stressLevel?: number; // 1-5 slider: Very calm → Very stressed
  whatsOnMind?: string; // Short text
  
  // Section 2: Physical Energy & Rest
  sleepHours?: number; // Numeric: hours (e.g., 7.5)
  sleepRestfulness?: number; // 1-5 slider: Poor → Deep rest
  energyLevel?: string; // Low / Moderate / High
  physicalActivity?: string[]; // Checkbox: Yoga, Walk, Exercise, Rest Day
  
  // Section 3: Connection & Support
  interactedToday?: boolean; // Toggle: Yes / No
  interactionFeeling?: string; // Uplifted / Neutral / Draining (conditional)
  supportLevel?: number; // 1-5 slider: Not at all → Deeply supported
  
  // Section 4: Mindfulness & Gratitude
  pausedReflected?: boolean; // Toggle: Yes / No
  gratefulFor?: string; // Short text
  smallWin?: string; // Short text
  
  // Section 5: Tomorrow's Focus
  tomorrowFocus?: string; // Calm / Motivation / Sleep / Productivity / Balance / Joy
  wantActivitySuggestion?: boolean; // Toggle: Yes / No
  
  // Section 6: Notes (Optional)
  additionalNotes?: string; // Long text
  
  createdAt: number;
}

