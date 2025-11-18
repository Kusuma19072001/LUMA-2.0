// Type for analytics data
export type AnalyticsData = {
  id: string;
  moodEntries: number;
  mindfulnessStreak: number;
  totalSessions: number;
  chatMessages: number;
  timestamp: string;
};

// Type for analytics history snapshot
export type AnalyticsSnapshot = {
  id: string;
  timestamp: string;
  moodEntries: number;
  mindfulnessStreak: number;
  totalSessions: number;
  chatMessages: number;
};

const DB_NAME = 'LumaAnalyticsDB';
const STORE_NAME = 'analytics';
const HISTORY_STORE = 'analytics_history';
const DB_VERSION = 2; // Bump version for new store

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveAnalyticsData(data: AnalyticsData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
    };
  });
}

export async function getAnalyticsData(id: string): Promise<AnalyticsData | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
    };
  });
}

export async function saveAnalyticsSnapshot(snapshot: AnalyticsSnapshot): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    const request = store.put(snapshot);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
    };
  });
}

export async function getAnalyticsHistory(): Promise<AnalyticsSnapshot[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const store = tx.objectStore(HISTORY_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      // Sort by timestamp ascending
      const all = request.result || [];
      resolve(
        all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      );
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
    };
  });
}
