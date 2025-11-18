// IndexedDB service for LUMA local database

import type {
  MoodEntry,
  ChatConversation,
  BreathingSession,
  ExerciseSession,
  UserActivity,
  AnalyticsData,
  SurveyResponse,
} from "../types/database.ts";

const DB_NAME = "LUMA_DB";
const DB_VERSION = 2;

// Store names
const STORES = {
  MOOD_ENTRIES: "moodEntries",
  CHAT_CONVERSATIONS: "chatConversations",
  BREATHING_SESSIONS: "breathingSessions",
  EXERCISE_SESSIONS: "exerciseSessions",
  USER_ACTIVITIES: "userActivities",
  SURVEY_RESPONSES: "surveyResponses",
} as const;

let dbInstance: IDBDatabase | null = null;

// Initialize database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.MOOD_ENTRIES)) {
        const moodStore = db.createObjectStore(STORES.MOOD_ENTRIES, {
          keyPath: "id",
        });
        moodStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CHAT_CONVERSATIONS)) {
        const chatStore = db.createObjectStore(STORES.CHAT_CONVERSATIONS, {
          keyPath: "id",
        });
        chatStore.createIndex("lastMessageAt", "lastMessageAt", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.BREATHING_SESSIONS)) {
        const breathingStore = db.createObjectStore(STORES.BREATHING_SESSIONS, {
          keyPath: "id",
        });
        breathingStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.EXERCISE_SESSIONS)) {
        const exerciseStore = db.createObjectStore(STORES.EXERCISE_SESSIONS, {
          keyPath: "id",
        });
        exerciseStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_ACTIVITIES)) {
        const activityStore = db.createObjectStore(STORES.USER_ACTIVITIES, {
          keyPath: "id",
        });
        activityStore.createIndex("createdAt", "createdAt", { unique: false });
        activityStore.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SURVEY_RESPONSES)) {
        const surveyStore = db.createObjectStore(STORES.SURVEY_RESPONSES, {
          keyPath: "id",
        });
        surveyStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
};

// Helper to get database instance
const getDB = async (): Promise<IDBDatabase> => {
  if (!dbInstance) {
    await initDatabase();
  }
  return dbInstance!;
};

// ========== Mood Entries ==========

export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOOD_ENTRIES], "readwrite");
    const store = transaction.objectStore(STORES.MOOD_ENTRIES);
    const request = store.put(entry);

    request.onsuccess = () => {
      // Also save as activity
      saveUserActivity({
        id: crypto.randomUUID(),
        type: "mood_entry",
        metadata: { moodEntryId: entry.id },
        createdAt: Date.now(),
      }).catch(console.error);
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save mood entry"));
    };
  });
};

export const getMoodEntries = async (
  limit?: number
): Promise<MoodEntry[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOOD_ENTRIES], "readonly");
    const store = transaction.objectStore(STORES.MOOD_ENTRIES);
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev"); // Descending order

    const entries: MoodEntry[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || entries.length < limit)) {
        entries.push(cursor.value);
        cursor.continue();
      } else {
        resolve(entries);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get mood entries"));
    };
  });
};

export const getMoodEntryById = async (id: string): Promise<MoodEntry | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOOD_ENTRIES], "readonly");
    const store = transaction.objectStore(STORES.MOOD_ENTRIES);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error("Failed to get mood entry"));
    };
  });
};

// ========== Chat Conversations ==========

export const saveChatConversation = async (
  conversation: ChatConversation
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHAT_CONVERSATIONS], "readwrite");
    const store = transaction.objectStore(STORES.CHAT_CONVERSATIONS);
    const request = store.put(conversation);

    request.onsuccess = () => {
      // Save activity for each message
      conversation.messages.forEach((message) => {
        saveUserActivity({
          id: crypto.randomUUID(),
          type: "chat_message",
          metadata: {
            conversationId: conversation.id,
            messageId: message.id,
            role: message.role,
          },
          createdAt: message.createdAt,
        }).catch(console.error);
      });
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save chat conversation"));
    };
  });
};

export const getChatConversations = async (
  limit?: number
): Promise<ChatConversation[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHAT_CONVERSATIONS], "readonly");
    const store = transaction.objectStore(STORES.CHAT_CONVERSATIONS);
    const index = store.index("lastMessageAt");
    const request = index.openCursor(null, "prev");

    const conversations: ChatConversation[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || conversations.length < limit)) {
        conversations.push(cursor.value);
        cursor.continue();
      } else {
        resolve(conversations);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get chat conversations"));
    };
  });
};

// ========== Breathing Sessions ==========

export const saveBreathingSession = async (
  session: BreathingSession
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.BREATHING_SESSIONS], "readwrite");
    const store = transaction.objectStore(STORES.BREATHING_SESSIONS);
    const request = store.put(session);

    request.onsuccess = () => {
      saveUserActivity({
        id: crypto.randomUUID(),
        type: "breathing_session",
        metadata: { sessionId: session.id },
        createdAt: session.createdAt,
      }).catch(console.error);
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save breathing session"));
    };
  });
};

export const getBreathingSessions = async (
  limit?: number
): Promise<BreathingSession[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.BREATHING_SESSIONS], "readonly");
    const store = transaction.objectStore(STORES.BREATHING_SESSIONS);
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev");

    const sessions: BreathingSession[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || sessions.length < limit)) {
        sessions.push(cursor.value);
        cursor.continue();
      } else {
        resolve(sessions);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get breathing sessions"));
    };
  });
};

// ========== Exercise Sessions ==========

export const saveExerciseSession = async (
  session: ExerciseSession
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXERCISE_SESSIONS], "readwrite");
    const store = transaction.objectStore(STORES.EXERCISE_SESSIONS);
    const request = store.put(session);

    request.onsuccess = () => {
      saveUserActivity({
        id: crypto.randomUUID(),
        type: "exercise_session",
        metadata: { sessionId: session.id, exerciseId: session.exerciseId },
        createdAt: session.createdAt,
      }).catch(console.error);
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save exercise session"));
    };
  });
};

export const getExerciseSessions = async (
  limit?: number
): Promise<ExerciseSession[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXERCISE_SESSIONS], "readonly");
    const store = transaction.objectStore(STORES.EXERCISE_SESSIONS);
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev");

    const sessions: ExerciseSession[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || sessions.length < limit)) {
        sessions.push(cursor.value);
        cursor.continue();
      } else {
        resolve(sessions);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get exercise sessions"));
    };
  });
};

// ========== User Activities ==========

export const saveUserActivity = async (activity: UserActivity): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_ACTIVITIES], "readwrite");
    const store = transaction.objectStore(STORES.USER_ACTIVITIES);
    const request = store.put(activity);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      reject(new Error("Failed to save user activity"));
    };
  });
};

export const getUserActivities = async (
  limit?: number,
  type?: UserActivity["type"]
): Promise<UserActivity[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_ACTIVITIES], "readonly");
    const store = transaction.objectStore(STORES.USER_ACTIVITIES);
    
    let request: IDBRequest<IDBCursorWithValue | null>;
    
    if (type) {
      const index = store.index("type");
      request = index.openCursor(IDBKeyRange.only(type), "prev");
    } else {
      const index = store.index("createdAt");
      request = index.openCursor(null, "prev");
    }

    const activities: UserActivity[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || activities.length < limit)) {
        activities.push(cursor.value);
        cursor.continue();
      } else {
        resolve(activities);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get user activities"));
    };
  });
};

// ========== Analytics ==========

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  const [
    moodEntries,
    chatConversations,
    breathingSessions,
    exerciseSessions,
    activities,
  ] = await Promise.all([
    getMoodEntries(),
    getChatConversations(),
    getBreathingSessions(),
    getExerciseSessions(),
    getUserActivities(),
  ]);

  // Calculate mood trends (last 7 days)
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentMoods = moodEntries.filter((m) => m.createdAt >= sevenDaysAgo);

  const moodTrends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const dayMoods = recentMoods.filter((m) => {
      const moodDate = new Date(m.createdAt).toISOString().split("T")[0];
      return moodDate === dateStr;
    });
    moodTrends.push({
      date: dateStr,
      count: dayMoods.length,
    });
  }

  // Calculate activity streak
  const sortedActivities = activities.sort((a, b) => b.createdAt - a.createdAt);
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.createdAt);
    activityDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (currentDate.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysDiff === streak) {
      streak++;
      currentDate = new Date(activityDate);
    } else if (daysDiff > streak) {
      break;
    }
  }

  // Weekly activity (last 7 days)
  const weeklyActivity = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dayName = dayNames[date.getDay()];
    const dateStr = date.toISOString().split("T")[0];
    const dayActivities = activities.filter((a) => {
      const activityDate = new Date(a.createdAt).toISOString().split("T")[0];
      return activityDate === dateStr;
    });
    weeklyActivity.push({
      day: dayName,
      activities: dayActivities.length,
    });
  }

  const lastActivity = sortedActivities[0];
  const totalChatMessages = chatConversations.reduce(
    (sum, conv) => sum + conv.messageCount,
    0
  );

  return {
    totalMoodEntries: moodEntries.length,
    totalChatMessages,
    totalBreathingSessions: breathingSessions.length,
    totalExerciseSessions: exerciseSessions.length,
    moodTrends,
    activityStreak: streak,
    lastActivityDate: lastActivity?.createdAt || now,
    weeklyActivity,
  };
};

// ========== Survey Responses ==========

export const saveSurveyResponse = async (response: SurveyResponse): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SURVEY_RESPONSES], "readwrite");
    const store = transaction.objectStore(STORES.SURVEY_RESPONSES);
    const request = store.put(response);

    request.onsuccess = () => {
      // Also save as activity
      saveUserActivity({
        id: crypto.randomUUID(),
        type: "mood_check",
        metadata: { surveyId: response.id },
        createdAt: response.createdAt,
      }).catch(console.error);
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save survey response"));
    };
  });
};

export const getSurveyResponses = async (
  limit?: number
): Promise<SurveyResponse[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SURVEY_RESPONSES], "readonly");
    const store = transaction.objectStore(STORES.SURVEY_RESPONSES);
    const index = store.index("createdAt");
    const request = index.openCursor(null, "prev");

    const responses: SurveyResponse[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && (!limit || responses.length < limit)) {
        responses.push(cursor.value);
        cursor.continue();
      } else {
        resolve(responses);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get survey responses"));
    };
  });
};

// ========== Utility Functions ==========

export const clearAllData = async (): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [
        STORES.MOOD_ENTRIES,
        STORES.CHAT_CONVERSATIONS,
        STORES.BREATHING_SESSIONS,
        STORES.EXERCISE_SESSIONS,
        STORES.USER_ACTIVITIES,
        STORES.SURVEY_RESPONSES,
      ],
      "readwrite"
    );

    let completed = 0;
    const total = 6;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        resolve();
      }
    };

    transaction.objectStore(STORES.MOOD_ENTRIES).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.CHAT_CONVERSATIONS).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.BREATHING_SESSIONS).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.EXERCISE_SESSIONS).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.USER_ACTIVITIES).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.SURVEY_RESPONSES).clear().onsuccess = checkComplete;

    transaction.onerror = () => {
      reject(new Error("Failed to clear data"));
    };
  });
};

