import { type ComponentType, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, HeartPulse, Home, MessageCircle, Palette, User, Video } from "lucide-react";

export type TabKey = "home" | "canvas" | "chat" | "analytics" | "exercises" | "profile" | "breathesync" | "reminders" | "achievements" | "live";

const navItems: Array<{
  id: TabKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
}> = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  { id: "canvas", label: "MoodCanvas", icon: Palette, path: "/canvas" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
  { id: "live", label: "Live", icon: Video, path: "/live" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "exercises", label: "Exercises", icon: HeartPulse, path: "/exercises" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    // Determine active tab from current path
    const path = location.pathname;
    const item = navItems.find((item) => item.path === path);
    return item?.id || "home";
  });

  const handleTabClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8FFF5] to-[#F6FAFF] font-body text-slate-800 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <header className="mx-auto w-full max-w-5xl px-4 pt-8">
        <nav className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/60 bg-white/70 px-4 py-2 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-emerald-50/80 sm:flex-none sm:px-6 dark:hover:bg-emerald-900/20 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md dark:bg-emerald-600"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="pb-20">{children}</main>
    </div>
  );
}

