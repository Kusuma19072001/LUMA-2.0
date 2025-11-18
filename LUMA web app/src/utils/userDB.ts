// IndexedDB helper for user authentication and theme storage
// Database: luma_users_db
// Stores: users, theme

export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  firstName: string;
  lastName: string;
  createdAt: number;
  streak?: number;
  completedExercises?: number;
  reflectionsCount?: number;
}

export interface Theme {
  id: string;
  theme: 'light' | 'dark';
  userId?: string; // Optional: per-user theme, or global
}

const DB_NAME = 'luma_users_db';
const USER_STORE = 'users';
const THEME_STORE = 'theme';
const DB_VERSION = 2; // Bumped to handle existing databases

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion || 0;
      
      // Create users store if it doesn't exist
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      } else if (oldVersion < 2) {
        // If upgrading from version 1, ensure email index exists
        const tx = request.transaction;
        if (tx) {
          const userStore = tx.objectStore(USER_STORE);
          if (userStore && !userStore.indexNames.contains('email')) {
            userStore.createIndex('email', 'email', { unique: true });
          }
        }
      }
      
      // Create theme store if it doesn't exist
      if (!db.objectStoreNames.contains(THEME_STORE)) {
        db.createObjectStore(THEME_STORE, { keyPath: 'id' });
      }
    };
    
    request.onerror = () => {
      const error = request.error;
      // Provide a more helpful error message
      if (error?.name === 'VersionError') {
        reject(new Error('Database version mismatch. Please refresh the page or clear your browser data.'));
      } else {
        reject(error || new Error('Failed to open database'));
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      
      // Verify stores exist - if not, we need to recreate the database
      if (!db.objectStoreNames.contains(USER_STORE) || !db.objectStoreNames.contains(THEME_STORE)) {
        db.close();
        // Delete and recreate with proper stores
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = () => {
          // Retry opening after deletion
          const retryRequest = indexedDB.open(DB_NAME, DB_VERSION);
          retryRequest.onupgradeneeded = (event) => {
            const newDb = (event.target as IDBOpenDBRequest).result;
            const userStore = newDb.createObjectStore(USER_STORE, { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true });
            newDb.createObjectStore(THEME_STORE, { keyPath: 'id' });
          };
          retryRequest.onsuccess = () => resolve(retryRequest.result);
          retryRequest.onerror = () => reject(retryRequest.error);
        };
        deleteRequest.onerror = () => reject(new Error('Failed to recreate database'));
      } else {
        resolve(db);
      }
    };
  });
}

// User operations
export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Check if email already exists
    const tx = db.transaction(USER_STORE, 'readonly');
    const store = tx.objectStore(USER_STORE);
    const emailIndex = store.index('email');
    const checkRequest = emailIndex.get(user.email);
    
    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error('Email already exists'));
        return;
      }
      
      // Create new user
      const newUser: User = {
        ...user,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        streak: 0,
        completedExercises: 0,
        reflectionsCount: 0,
      };
      
      const writeTx = db.transaction(USER_STORE, 'readwrite');
      const writeStore = writeTx.objectStore(USER_STORE);
      const putRequest = writeStore.put(newUser);
      
      putRequest.onsuccess = () => {
        resolve(newUser);
      };
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    checkRequest.onerror = () => reject(checkRequest.error);
  });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(USER_STORE, 'readonly');
    const store = tx.objectStore(USER_STORE);
    const emailIndex = store.index('email');
    const request = emailIndex.get(email);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(USER_STORE, 'readonly');
    const store = tx.objectStore(USER_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateUser(user: User): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(USER_STORE, 'readwrite');
    const store = tx.objectStore(USER_STORE);
    const request = store.put(user);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Theme operations
export async function getTheme(userId?: string): Promise<'light' | 'dark'> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(THEME_STORE, 'readonly');
    const store = tx.objectStore(THEME_STORE);
    const id = userId || 'global';
    const request = store.get(id);
    
    request.onsuccess = () => {
      const theme = request.result as Theme | undefined;
      resolve(theme?.theme || 'light');
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveTheme(theme: 'light' | 'dark', userId?: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(THEME_STORE, 'readwrite');
    const store = tx.objectStore(THEME_STORE);
    const id = userId || 'global';
    const themeData: Theme = { id, theme, userId };
    const request = store.put(themeData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

