import { type ComponentType, useState } from "react";
import { BarChart3, HeartPulse, Home, MessageCircle, Palette, User } from "lucide-react";
import { WelcomePage } from "./pages/WelcomePage.tsx";
import { ChatPage } from "./pages/ChatPage.tsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.tsx";
import { ExercisesPage } from "./pages/ExercisesPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { MoodCanvasPage } from "./pages/MoodCanvasPage.tsx";
import { BreatheSyncPage } from "./pages/BreatheSyncPage.tsx";
import { RemindersPage } from "./pages/RemindersPage.tsx";
import { AchievementsPage } from "./pages/AchievementsPage.tsx";

type TabKey = "home" | "canvas" | "chat" | "analytics" | "exercises" | "profile" | "breathesync" | "reminders" | "achievements";

const navItems: Array<{
  id: TabKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "home", label: "Home", icon: Home },
  { id: "canvas", label: "MoodCanvas", icon: Palette },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "exercises", label: "Exercises", icon: HeartPulse },
  { id: "profile", label: "Profile", icon: User },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8FFF5] to-[#F6FAFF] font-body text-slate-800">
      <header className="mx-auto w-full max-w-5xl px-4 pt-8">
        <nav className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/60 bg-white/70 px-4 py-2 shadow-xl backdrop-blur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-emerald-50/80 sm:flex-none sm:px-6 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-emerald-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="pb-20">
        {activeTab === "home" && (
          <WelcomePage
            onStartChat={() => setActiveTab("chat")}
            onOpenMoodCanvas={() => setActiveTab("canvas")}
            onOpenExercises={(exerciseId) => {
              setActiveTab("exercises");
              if (exerciseId) {
                // Store the exercise ID to start when ExercisesPage loads
                sessionStorage.setItem("startExercise", exerciseId);
              }
            }}
            onOpenBreatheSync={() => setActiveTab("breathesync")}
            onOpenReminders={() => setActiveTab("reminders")}
            onOpenAchievements={() => setActiveTab("achievements")}
          />
        )}
        {activeTab === "canvas" && (
          <MoodCanvasPage
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "chat" && <ChatPage />}
        {activeTab === "analytics" && <AnalyticsPage />}
        {activeTab === "exercises" && <ExercisesPage />}
        {activeTab === "profile" && (
          <ProfilePage
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "breathesync" && (
          <BreatheSyncPage
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "reminders" && (
          <RemindersPage
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "achievements" && (
          <AchievementsPage
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
