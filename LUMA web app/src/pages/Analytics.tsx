import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { Trophy, ArrowUpCircle, Flame, ChevronsRight, CheckCircle } from "lucide-react";
import { getAnalyticsHistory } from "../utils/indexedDB";

const moodLevels = [
  { value: 0, label: "Sad" },
  { value: 1, label: "Stressed" },
  { value: 2, label: "Okay" },
  { value: 3, label: "Happy" },
  { value: 4, label: "Energetic" }
];

const daysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function getWeekData(history) {
  const len = history.length;
  const current = history.slice(len - 7, len);
  const prev = history.slice(Math.max(0, len - 14), Math.max(0, len - 7));
  return { current, prev };
}

function getStreaks(history) {
  let curStreak = 0, maxStreak = 0, streak = 0;
  for (let i = 0; i < history.length; ++i) {
    if ((history[i].mindfulnessStreak || 0) > 0) streak++;
    else streak = 0;
    if (streak > maxStreak) maxStreak = streak;
  }
  for (let i = history.length - 1; i >= 0; --i) {
    if ((history[i].mindfulnessStreak || 0) > 0) curStreak++;
    else break;
  }
  return { curStreak, maxStreak };
}

function formatShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function calcWellbeing(s) {
  return (
    (s.moodEntries ?? 0) * 2 + (s.totalSessions ?? 0) * 3 + (s.chatMessages ?? 0) * 0.5 + (s.mindfulnessStreak ?? 0) * 4
  );
}

function percentChange(now, prev) {
  if (prev === 0) return 100;
  return Math.round(((now-prev)/Math.abs(prev))*100);
}

const fallbackMood = [
  { day: "Mon", mood: 2 },
  { day: "Tue", mood: 2 },
  { day: "Wed", mood: 3 },
  { day: "Thu", mood: 1 },
  { day: "Fri", mood: 3 },
  { day: "Sat", mood: 4 },
  { day: "Sun", mood: 2 },
];
const fallbackWell = [70,80,68,92,85,78,88];
const fallbackSessions = [1,0,2,1,2,3,1];

export default function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  const [userName] = useState("Friend");
  const [range, setRange] = useState("week");

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getAnalyticsHistory();
      setHistory(Array.isArray(data) ? [...data] : []);
    };
    fetchHistory();
    const t = setInterval(fetchHistory, 3000);
    return () => clearInterval(t);
  }, []);

  // --- Mood / Wellbeing (latest-mood approach) ---
  const lastMoodEntry = history.length
    ? [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    : undefined;
  const moodNum = lastMoodEntry?.moodCategory ?? 2;
  const moodSource = lastMoodEntry?.moodSource ?? "unknown";
  const moodString = moodLevels[moodNum]?.label || "Okay";

  // This and previous week (still for trends)
  const { current: weekCurrent, prev: weekPrev } = getWeekData(history);
  // Weekly Mood Trend (keep for chart, but not used for summary card any more)
  const moodTrend = weekCurrent.length === 7 ? weekCurrent.map((h, i) => ({
    day: daysOfWeek[i],
    mood: h.moodCategory ?? 2
  })) : fallbackMood;
  // Wellbeing trend for week
  const wellTrend = weekCurrent.length === 7 ? weekCurrent.map((h,i) => ({
    day: daysOfWeek[i],
    score: calcWellbeing(h)
  })) : fallbackWell.map((w,i) => ({ day: daysOfWeek[i], score: w }));

  // For comparison, find the last moodEntry in previous 7
  const prevMoodEntry = weekPrev.length
    ? [...weekPrev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : undefined;
  const prevMoodNum = prevMoodEntry?.moodCategory ?? 2;
  const highlightImprovement = percentChange(moodNum, prevMoodNum);

  // Current/longest streak
  const streaks = getStreaks(history);

  // Session streak for radial chart (days active, not sum of sessions)
  const sessionStreak = weekCurrent.length === 7 ? weekCurrent.map((h, i) => ({
    day: daysOfWeek[i],
    sessions: h.totalSessions || 0
  })) : daysOfWeek.map((d,i) => ({ day: d, sessions: fallbackSessions[i] }));
  const sessionActiveDays = sessionStreak.filter(day => day.sessions > 0).length;
  const sessionProgress = Math.min((sessionActiveDays / 7) * 100, 100);

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col items-center p-6">
      <div className="max-w-7xl w-full">
        {/* Header & Pro/Engagement */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2 pb-6">
          <div className="text-3xl font-bold text-brown-900 flex items-center gap-2">
            Hello, {userName}! <span className="ml-1 text-amber-400 text-2xl">👋</span>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-300 rounded-2xl shadow px-6 py-3 flex flex-col md:flex-row items-center gap-1 text-yellow-900">
            <div className="font-bold text-lg flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400"/>
              {streaks.maxStreak > 3 ? `Best Streak: ${streaks.maxStreak.toFixed(0)} days!` : "Ready for a mindful moment?"}
            </div>
            <div className="text-yellow-700 text-sm font-semibold ml-2 hidden md:block">Keep up your daily practice for rewards!</div>
          </div>
        </header>

        {/* Hero Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {/* Mood & Wellbeing Card -- now always shows latest mood from any source */}
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-emerald-400 p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-emerald-400"/>
              <span className="font-semibold text-emerald-900 text-lg">Mood / Wellbeing</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
              {moodString} <span className="text-lg text-gray-400">({moodNum})</span>
            </div>
            <span className="text-xl mt-2 font-bold text-emerald-800">{highlightImprovement > 0 ? `+${highlightImprovement}` : highlightImprovement}%</span>
            <span className="text-gray-500 font-medium text-sm">vs last week</span>
            {lastMoodEntry && (
              <span className="inline-flex items-center gap-2 px-3 py-1 w-max rounded-full text-emerald-600 font-medium bg-emerald-100 text-xs mt-2">
                <CheckCircle className="w-4 h-4"/> {`Last recorded from ${lastMoodEntry.moodSource === 'chat' ? 'Chat' : 'MoodCanvas'}`}
              </span>
            )}
          </div>
          {/* Longest Streak Card */}
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-orange-400 p-6 flex flex-col gap-2 items-start">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400"/>
              <span className="font-semibold text-orange-900 text-lg">Streaks</span>
            </div>
            <div className="text-3xl font-extrabold text-orange-500 flex items-center gap-2">{streaks.curStreak || 0}d<span className="text-base text-orange-300 font-bold">active</span></div>
            <span className="text-base text-orange-700 font-bold">Longest: {streaks.maxStreak}d</span>
            <span className="text-orange-700 text-xs font-medium">Current streak counted from today.</span>
          </div>
          {/* Pro/Engagement Card */}
          <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-white border-l-4 border-yellow-300 rounded-2xl shadow-lg p-6 flex flex-col gap-2 items-start">
            <div className="flex items-center gap-2 mb-2">
              <ChevronsRight className="w-5 h-5 text-yellow-600 rotate-90"/>
              <span className="font-semibold text-yellow-900 text-lg">Keep Growing</span>
            </div>
            <span className="text-lg font-bold text-yellow-700">Try a new Mood Canvas reflection, or celebrate your wins 🎨✨</span>
            <span className="text-gray-600 font-medium">Progress each day unlocks rewards and insight.</span>
            <button className="mt-2 inline-block px-4 py-2 rounded-xl bg-yellow-400/90 text-yellow-900 font-bold hover:bg-yellow-300 shadow">Check In Today</button>
          </div>
        </div>

        {/* Main Analytics: Mood Trend, Wellbeing, Session Progress */}
        <div className="grid md:grid-cols-2 gap-8 my-10">
          {/* Weekly Mood Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-emerald-400 flex flex-col min-h-[320px]">
            <div className="text-2xl font-bold text-slate-900 mb-2">Weekly Mood Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodTrend}>
                <defs>
                  <linearGradient id="moodgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.7}/>
                  </linearGradient>
                  <filter id="moodglow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#67e8f9" floodOpacity="0.45" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontWeight: 500, fontSize: 16 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="number"
                  domain={[0,4]}
                  ticks={moodLevels.map(l => l.value)}
                  tickFormatter={v => moodLevels.find(m => m.value === v)?.label || ""}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  allowDecimals={false}
                  style={{ fontWeight: 500, fontSize: 15 }}
                />
                <Tooltip contentStyle={{ borderRadius: 18, background: "#fff", boxShadow: "0 8px 32px #bef26455" }} formatter={v => moodLevels.find(m => m.value === v)?.label}/>
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="url(#moodgrad)"
                  strokeWidth={4}
                  dot={{ r: 7, fill: "#fff", stroke: "#14b8a6", strokeWidth: 4, filter: "url(#moodglow)" }}
                  activeDot={{ r: 11, fill: "#06b6d4", stroke: "#fff", strokeWidth: 3, filter: "url(#moodglow)" }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Wellbeing Score Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-indigo-400 flex flex-col min-h-[320px]">
            <div className="text-2xl font-bold text-slate-900 mb-2">Wellbeing Score Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wellTrend}>
                <defs>
                  <linearGradient id="wellgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.18}/>
                  </linearGradient>
                  <filter id="wellglow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#a5b4fc" floodOpacity="0.25" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontWeight: 500, fontSize: 16 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 15, background: "#fff" }}/>    
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#wellgrad)"
                  strokeWidth={4}
                  dot={{ r: 7, fill: "#fff", stroke: "#6366f1", strokeWidth: 3, filter: "url(#wellglow)" }}
                  activeDot={{ r: 10, fill: "#818cf8", stroke: "#fff", strokeWidth: 2, filter: "url(#wellglow)" }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut/Radial Progress Widget for Sessions (bottom row) */}
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl border-l-4 border-green-400 p-8 md:p-10 flex flex-col items-center">
            <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2"><CheckCircle className="text-green-400 w-5 h-5"/> Mindful Sessions This Week</div>
            <RadialBarChart width={230} height={170} cx={115} cy={85} innerRadius={60} outerRadius={80}
              barSize={18}
              data={[{ name: "Active Days", value: sessionProgress, fill: "#14b8a6" }]}
              startAngle={90}
              endAngle={450}
            >
              <RadialBar
                minAngle={10}
                background
                clockWise
                dataKey="value"
                cornerRadius={14}
              />
              <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right"/>
            </RadialBarChart>
            <div className="mt-3 mb-3 text-emerald-700 text-xl font-bold">{(sessionProgress).toFixed(0)}% of days
              <span className="text-base font-normal ml-2 text-gray-400">({sessionActiveDays} / 7)</span>
            </div>
            <span className="text-xs font-medium text-gray-500">Complete 7/7 to unlock an achievement!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
