import { useState, useEffect } from "react";
import { EditPreferencesModal } from "../components/EditPreferencesModal";
import { PinSecurityModal } from "../components/PinSecurityModal";
import type { UserPreferences } from "../types/database";
import { getAnalyticsData, getExerciseSessions, getMoodEntries, getSurveyResponses, getBreathingSessions } from "../services/database";
import { Sun, Wind, BookOpen, Heart, Sparkles, Music, Moon, Shield, Bell, Circle, Quote } from "lucide-react";

type TabKey = "home" | "canvas" | "chat" | "analytics" | "exercises" | "profile" | "breathesync" | "reminders" | "achievements";

interface ProfilePageProps {
  onNavigate?: (tab: TabKey) => void;
}

interface PerformanceStats {
  mindfulnessStreak: number;
  completedExercises: number;
  journalEntries: number;
  breathingSessions: number;
  averageMood: string;
  recentReflections: Array<{
    text: string;
    date: number;
    type: "mood" | "survey";
  }>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  userName: "Demo User",
  supportFocus: "Stress recovery and mindful check-ins",
  notificationStyle: "Gentle reminders, weekday mornings",
  voiceGuidance: "Enabled for evening sessions",
  journalPrivacy: "End-to-end encryption with biometric unlock",
};

const STORAGE_KEY = "luma_user_preferences";

// Inspirational quotes
const WELLNESS_QUOTES = [
  "Small steps toward calm create lasting peace.",
  "Your breath is your anchor. Your body, your sanctuary.",
  "Progress isn't always visible, but it's always there.",
  "In stillness, we find our strength.",
  "Every moment of mindfulness is a gift to yourself.",
];

export const ProfilePage = ({ onNavigate }: ProfilePageProps = {}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [stats, setStats] = useState<PerformanceStats>({
    mindfulnessStreak: 0,
    completedExercises: 0,
    journalEntries: 0,
    breathingSessions: 0,
    averageMood: "calm",
    recentReflections: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(WELLNESS_QUOTES[0]);
  const [growthProgress, setGrowthProgress] = useState(0);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [positiveReflections, setPositiveReflections] = useState<PerformanceStats["recentReflections"]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserPreferences;
        setPreferences(parsed);
      } catch (error) {
        console.error("Failed to parse saved preferences:", error);
      }
    }
  }, []);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => {
        const currentIndex = WELLNESS_QUOTES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % WELLNESS_QUOTES.length;
        return WELLNESS_QUOTES[nextIndex];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Load performance stats from database
  useEffect(() => {
    const loadPerformanceStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Fetch all data
        const [analytics, exerciseSessions, moodEntries, surveyResponses, breathingSessions] = await Promise.all([
          getAnalyticsData(),
          getExerciseSessions(),
          getMoodEntries(),
          getSurveyResponses(),
          getBreathingSessions(),
        ]);
        
        // Count completed exercises
        const completedExercises = exerciseSessions.filter(
          (session) => session.completed === true
        ).length;
        
        // Calculate journal entries
        const journalEntries = moodEntries.length + surveyResponses.length;
        
        // Calculate average mood from recent entries
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const recentMoods = moodEntries.filter((m) => m.createdAt >= sevenDaysAgo);
        const recentSurveys = surveyResponses.filter((s) => s.createdAt >= sevenDaysAgo);
        
        let moodLabels: string[] = [];
        recentMoods.forEach((entry) => {
          if (entry.reflection?.tone?.label) {
            moodLabels.push(entry.reflection.tone.label);
          }
        });
        recentSurveys.forEach((survey) => {
          if (survey.presentMood) {
            moodLabels.push(survey.presentMood.toLowerCase());
          }
        });
        
        // Determine average mood
        let averageMood = "calm";
        if (moodLabels.length > 0) {
          const calmCount = moodLabels.filter((m) => m.includes("calm") || m.includes("peaceful") || m === "calm").length;
          const happyCount = moodLabels.filter((m) => m.includes("happy") || m.includes("uplift") || m === "happy").length;
          const stressedCount = moodLabels.filter((m) => m.includes("stress") || m.includes("anxious") || m === "anxious").length;
          
          if (calmCount > happyCount && calmCount > stressedCount) {
            averageMood = "calm";
          } else if (happyCount > stressedCount) {
            averageMood = "uplifted";
          } else if (stressedCount > calmCount) {
            averageMood = "mixed";
          }
        }
        
        // Get recent reflections (all types for stats)
        const allReflections: PerformanceStats["recentReflections"] = [];
        
        // Add mood entry reflections - prioritize full reflection text over summary
        recentMoods.forEach((entry) => {
          let reflectionText = "";
          
          // Priority 1: Full reflection text (most meaningful)
          if (entry.reflection?.reflection && entry.reflection.reflection.trim().length > 10) {
            reflectionText = entry.reflection.reflection;
          }
          // Priority 2: Mood prompt (what user actually wrote)
          else if (entry.moodPrompt && entry.moodPrompt.trim().length > 10) {
            reflectionText = entry.moodPrompt;
          }
          // Priority 3: Tone summary (one sentence insight)
          else if (entry.reflection?.tone?.summary && entry.reflection.tone.summary.trim().length > 10) {
            reflectionText = entry.reflection.tone.summary;
          }
          
          if (reflectionText) {
            // Truncate to 100 characters for better display
            const truncated = reflectionText.length > 100 
              ? reflectionText.substring(0, 100).trim() + "..." 
              : reflectionText.trim();
            
            allReflections.push({
              text: truncated,
              date: entry.createdAt,
              type: "mood",
            });
          }
        });
        
        // Add survey reflections
        recentSurveys.forEach((survey) => {
          // Priority: smallWin, then gratefulFor, then whatsOnMind
          let reflectionText = "";
          
          if (survey.smallWin && survey.smallWin.trim().length > 5) {
            reflectionText = survey.smallWin;
          } else if (survey.gratefulFor && survey.gratefulFor.trim().length > 5) {
            reflectionText = survey.gratefulFor;
          } else if (survey.whatsOnMind && survey.whatsOnMind.trim().length > 5) {
            reflectionText = survey.whatsOnMind;
          }
          
          if (reflectionText) {
            const truncated = reflectionText.length > 100 
              ? reflectionText.substring(0, 100).trim() + "..." 
              : reflectionText.trim();
            
            allReflections.push({
              text: truncated,
              date: survey.createdAt,
              type: "survey",
            });
          }
        });
        
        // Sort by date and take most recent 3
        const sortedReflections = allReflections
          .sort((a, b) => b.date - a.date)
          .slice(0, 3);

        // Get positive reflections (celebration type) - separate from regular reflections
        const positiveReflectionsList: PerformanceStats["recentReflections"] = [];
        
        // Get all mood entries (not just recent) to find positive ones
        const allMoodEntries = await getMoodEntries();
        
        allMoodEntries.forEach((entry) => {
          // Only include entries with celebration guidance type
          if (entry.reflection?.guidanceType === "celebration") {
            let reflectionText = "";
            
            // Priority 1: Full reflection text
            if (entry.reflection?.reflection && entry.reflection.reflection.trim().length > 10) {
              reflectionText = entry.reflection.reflection;
            }
            // Priority 2: Journal entry (if saved)
            else if (entry.journalEntry && entry.journalEntry.trim().length > 10) {
              reflectionText = entry.journalEntry;
            }
            // Priority 3: Mood prompt
            else if (entry.moodPrompt && entry.moodPrompt.trim().length > 10) {
              reflectionText = entry.moodPrompt;
            }
            // Priority 4: Tone summary
            else if (entry.reflection?.tone?.summary && entry.reflection.tone.summary.trim().length > 10) {
              reflectionText = entry.reflection.tone.summary;
            }
            
            if (reflectionText) {
              // Truncate to 100 characters for better display
              const truncated = reflectionText.length > 100 
                ? reflectionText.substring(0, 100).trim() + "..." 
                : reflectionText.trim();
              
              positiveReflectionsList.push({
                text: truncated,
                date: entry.createdAt,
                type: "mood",
              });
            }
          }
        });
        
        // Sort positive reflections by date (most recent first)
        const sortedPositiveReflections = positiveReflectionsList
          .sort((a, b) => b.date - a.date);
        
        setPositiveReflections(sortedPositiveReflections);
        
        // Calculate growth progress (percentage of weekly goal: 7 days of activity)
        const weeklyActivity = analytics.weeklyActivity.reduce((sum, day) => sum + day.activities, 0);
        const maxWeeklyActivity = 7 * 3; // 7 days * 3 activities per day (ideal)
        const progress = Math.min(100, Math.round((weeklyActivity / maxWeeklyActivity) * 100));
        setGrowthProgress(progress);
        
        setStats({
          mindfulnessStreak: analytics.activityStreak,
          completedExercises,
          journalEntries,
          breathingSessions: breathingSessions.length,
          averageMood,
          recentReflections: sortedReflections,
        });
      } catch (error) {
        console.error("Failed to load performance stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadPerformanceStats();
  }, []);

  const handleSavePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get mood summary text
  const getMoodSummary = (): string => {
    if (isLoadingStats) return "Loading your journey...";
    
    const { mindfulnessStreak, averageMood } = stats;
    
    if (mindfulnessStreak === 0) {
      return "Start your journey today. Every moment of mindfulness matters. 🌱";
    }
    
    if (mindfulnessStreak >= 7) {
      return `You've been calm and balanced this week. Keep nurturing your peace. 🌿`;
    }
    
    if (averageMood === "calm") {
      return "You've been calm and balanced this week. Keep nurturing your peace. 🌿";
    } else if (averageMood === "uplifted") {
      return "Your energy is bright and uplifting. Continue spreading that light. ✨";
    } else {
      return "You're making progress every day. Remember to be gentle with yourself. 💚";
    }
  };

  // Get mood avatar color
  const getMoodAvatarColor = (): string => {
    const { averageMood } = stats;
    switch (averageMood) {
      case "calm":
        return "bg-teal-200 text-teal-700";
      case "uplifted":
        return "bg-yellow-200 text-yellow-700";
      case "mixed":
        return "bg-violet-200 text-violet-700";
      default:
        return "bg-emerald-200 text-emerald-700";
    }
  };

  // Format mood label
  const formatMoodLabel = (mood: string): string => {
    switch (mood) {
      case "calm":
        return "Calm";
      case "uplifted":
        return "Uplifted";
      case "mixed":
        return "Mixed";
      default:
        return "Balanced";
    }
  };

  // Progress cards data
  const progressCards = [
    {
      title: "Days of Calm",
      value: isLoadingStats ? "..." : stats.mindfulnessStreak,
      subtitle: isLoadingStats ? "Loading..." : stats.mindfulnessStreak === 1 ? "day in a row" : "days in a row",
      icon: Sun,
      gradient: "from-amber-100 via-yellow-50 to-white",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Guided Sessions",
      value: isLoadingStats ? "..." : stats.completedExercises + stats.breathingSessions,
      subtitle: isLoadingStats ? "Loading..." : "completed this week",
      icon: Wind,
      gradient: "from-teal-100 via-emerald-50 to-white",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Reflections Logged",
      value: isLoadingStats ? "..." : stats.journalEntries,
      subtitle: isLoadingStats ? "Loading..." : stats.journalEntries === 1 ? "reflection" : "reflections",
      icon: BookOpen,
      gradient: "from-sky-100 via-blue-50 to-white",
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Average Mood",
      value: isLoadingStats ? "..." : formatMoodLabel(stats.averageMood),
      subtitle: isLoadingStats ? "Loading..." : "this week",
      icon: Heart,
      gradient: "from-purple-100 via-violet-50 to-white",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Calculate circular progress for growth ring
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (growthProgress / 100) * circumference;

  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {/* Header Section - My Wellbeing Journey */}
        <header className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-emerald-900">
                My Wellbeing Journey
              </h1>
              <p className="mt-3 text-lg text-emerald-700/90">
                Hi {preferences.userName.split(" ")[0]}, {getMoodSummary()}
              </p>
            </div>
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${getMoodAvatarColor()} text-2xl font-semibold shadow-md transition-transform hover:scale-105`}>
              {getInitials(preferences.userName)}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4CC9B0] to-[#3AA58A] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Sparkles className="h-4 w-4" />
            Personalize My Space
          </button>
        </header>

        {/* Quote Banner */}
        <div className="rounded-3xl border border-white/60 bg-gradient-to-r from-purple-50 via-pink-50 to-white p-6 shadow-lg backdrop-blur">
          <div className="flex items-start gap-4">
            <Quote className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
            <p className="text-lg italic text-purple-800/90 font-medium">
              "{currentQuote}"
            </p>
          </div>
        </div>

        {/* Progress Snapshot - This Week's Growth */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-emerald-900">
            This Week's Growth
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {progressCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${card.gradient} p-6 shadow-lg backdrop-blur transition-all hover:scale-105 hover:shadow-xl`}
                >
                  <div className={`absolute right-4 top-4 rounded-full ${card.bgColor} p-3 opacity-80`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70">
                      {card.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-900">
                      {card.value}
                    </p>
                    <p className="mt-1 text-sm text-emerald-700/80">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Visual Growth Ring & Reflection Snapshot */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Your Calm Cycle - Circular Progress */}
          <section className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
            <h2 className="mb-6 text-xl font-semibold text-emerald-900">
              Your Calm Cycle
            </h2>
            <div className="flex items-center justify-center">
              <div className="relative h-40 w-40">
                <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4CC9B0" />
                      <stop offset="100%" stopColor="#A689E1" />
                    </linearGradient>
                  </defs>
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E6FAF3"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#growthGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-900">{growthProgress}%</p>
                    <p className="text-xs text-emerald-700/70">Weekly Goal</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-emerald-700/80">
              <div className="flex items-center justify-between">
                <span>Reflections</span>
                <span className="font-semibold">{stats.journalEntries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Breathing Sessions</span>
                <span className="font-semibold">{stats.breathingSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Exercises</span>
                <span className="font-semibold">{stats.completedExercises}</span>
              </div>
            </div>
          </section>

          {/* Positive Reflections Snapshot */}
          <section className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
            <h2 className="mb-6 text-xl font-semibold text-emerald-900">
              Your Positive Reflections at a Glance
            </h2>
            {isLoadingStats ? (
              <p className="text-emerald-700/70">Loading reflections...</p>
            ) : !isPinVerified ? (
              <div className="rounded-2xl bg-emerald-50/50 p-6 text-center">
                <p className="text-emerald-700/70">Secure your positive moments</p>
                <p className="mt-2 text-sm text-emerald-600/60">
                  Enter your PIN to view your collection of positive reflections
                </p>
              </div>
            ) : positiveReflections.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50/50 p-6 text-center">
                <p className="text-emerald-700/70">No positive reflections yet</p>
                <p className="mt-2 text-sm text-emerald-600/60">
                  Create positive mood entries to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {positiveReflections.map((reflection, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <p className="text-sm text-emerald-900/90">{reflection.text}</p>
                    <p className="mt-2 text-xs text-emerald-600/60">
                      {new Date(reflection.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                if (!isPinVerified) {
                  setIsPinModalOpen(true);
                } else {
                  if (onNavigate) {
                    onNavigate("canvas");
                  } else {
                    // Fallback: try to navigate using browser navigation or event
                    window.location.hash = "#canvas";
                    // Dispatch custom event as alternative fallback
                    window.dispatchEvent(new CustomEvent("navigate", { detail: "canvas" }));
                  }
                }
              }}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#4CC9B0] to-[#3AA58A] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              {isPinVerified ? "Open MoodCanvas" : "View Positive Reflections"}
            </button>
          </section>
        </div>

        {/* Your Mindful Setup */}
        <section className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-xl font-semibold text-emerald-900">
            Your Mindful Setup
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Voice Guidance */}
            <div className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Music className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Voice Guidance</p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    {preferences.voiceGuidance.includes("Enabled") ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Mode */}
            <div className="group rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3">
                  <Circle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Focus Mode</p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    {preferences.supportFocus.includes("Stress") ? "Calm" : 
                     preferences.supportFocus.includes("productivity") ? "Productivity" : 
                     "Emotional Balance"}
                  </p>
                </div>
              </div>
            </div>

            {/* Evening Reminder */}
            <div className="group rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-3">
                  <Moon className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Evening Reminder</p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    {preferences.notificationStyle.includes("morning") ? "Morning" : 
                     preferences.notificationStyle.includes("evening") ? "8:00 PM" : 
                     "Custom schedule"}
                  </p>
                </div>
              </div>
            </div>

            {/* Journal Privacy */}
            <div className="group rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-teal-100 p-3">
                  <Shield className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Journal Privacy</p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    {preferences.journalPrivacy.includes("Encrypted") ? "Encrypted Cloud" : "Local"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Style */}
            <div className="group rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-rose-100 p-3">
                  <Bell className="h-5 w-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Notification Style</p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    {preferences.notificationStyle.includes("Gentle") ? "Gentle reminders" : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <EditPreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
      />

      <PinSecurityModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={(_pin) => {
          setIsPinVerified(true);
          return true;
        }}
        title="Access Positive Reflections"
        description="Enter your PIN to view your collection of positive moments and reflections"
      />
    </>
  );
};
