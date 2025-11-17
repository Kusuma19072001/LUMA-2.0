import { useEffect, useState } from "react";
import { saveAnalyticsData, getAnalyticsData, saveAnalyticsSnapshot } from "../utils/indexedDB";

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    id: "main",
    moodEntries: 0,
    mindfulnessStreak: 0,
    totalSessions: 0,
    chatMessages: 0,
    timestamp: new Date().toISOString(),
    lastMoodCategory: 2,
    lastMoodSource: 'init',
    lastMoodText: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await getAnalyticsData("main");
      if (data) setAnalytics(data);
    };
    loadData();
  }, []);

  // New: record explicit mood from any source
  const recordExplicitMood = async (
    moodCategory: number, // 0-4
    source: 'chat' | 'canvas',
    text?: string
  ) => {
    const now = new Date().toISOString();
    const updated = {
      ...analytics,
      moodEntries: source === 'canvas' ? analytics.moodEntries + 1 : analytics.moodEntries,
      lastMoodCategory: moodCategory,
      lastMoodSource: source,
      lastMoodText: text || '',
      timestamp: now,
    };
    setAnalytics(updated);
    await saveAnalyticsData(updated);
    await saveAnalyticsSnapshot({
      id: Date.now().toString(),
      timestamp: now,
      moodEntries: updated.moodEntries,
      mindfulnessStreak: updated.mindfulnessStreak,
      totalSessions: updated.totalSessions,
      chatMessages: updated.chatMessages,
      moodCategory,
      moodSource: source,
      moodText: text || '',
    });
  };

  // Canvas mood is always category from mood canvas UI
  const recordMood = () => recordExplicitMood(3, 'canvas'); // Default "Happy" if no category passed
  const recordSession = async () => {
    const updated = { ...analytics, totalSessions: analytics.totalSessions + 1, timestamp: new Date().toISOString() };
    setAnalytics(updated);
    await saveAnalyticsData(updated);
    await saveAnalyticsSnapshot({
      id: Date.now().toString(),
      timestamp: updated.timestamp,
      moodEntries: updated.moodEntries,
      mindfulnessStreak: updated.mindfulnessStreak,
      totalSessions: updated.totalSessions,
      chatMessages: updated.chatMessages,
      moodCategory: updated.lastMoodCategory,
      moodSource: updated.lastMoodSource,
      moodText: updated.lastMoodText,
    });
  };
  const recordChat = async (detectedMoodCategory?: number, detectedText?: string) => {
    const updated = { ...analytics, chatMessages: analytics.chatMessages + 1, timestamp: new Date().toISOString() };
    setAnalytics(updated);
    await saveAnalyticsData(updated);
    await saveAnalyticsSnapshot({
      id: Date.now().toString(),
      timestamp: updated.timestamp,
      moodEntries: updated.moodEntries,
      mindfulnessStreak: updated.mindfulnessStreak,
      totalSessions: updated.totalSessions,
      chatMessages: updated.chatMessages,
      moodCategory: detectedMoodCategory ?? updated.lastMoodCategory,
      moodSource: detectedMoodCategory !== undefined ? 'chat' : updated.lastMoodSource,
      moodText: detectedText || updated.lastMoodText,
    });
    // If a mood category was parsed from chat, record it as explicit mood
    if (detectedMoodCategory !== undefined) {
      await recordExplicitMood(detectedMoodCategory, 'chat', detectedText);
    }
  };

  return { analytics, recordMood, recordSession, recordChat, recordExplicitMood };
};
