import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../utils/userDB';
import { getUserByEmail, getUserById, createUser, updateUser, getTheme, saveTheme } from '../utils/userDB';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserStats: (updates: Partial<Pick<User, 'streak' | 'completedExercises' | 'reflectionsCount'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'luma_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load session and theme on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
          const { userId } = JSON.parse(sessionData);
          const userData = await getUserById(userId);
          if (userData) {
            setUser(userData);
          } else {
            // Invalid session
            localStorage.removeItem(SESSION_KEY);
          }
        }
        
        // Load theme
        const savedTheme = await getTheme();
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const login = async (email: string, password: string) => {
    const userData = await getUserByEmail(email);
    if (!userData) {
      throw new Error('Email not found');
    }
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }
    
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: userData.id }));
    
    // Load user's theme preference
    const userTheme = await getTheme(userData.id);
    setTheme(userTheme);
    applyTheme(userTheme);
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password, // In production, hash this
    });
    
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.id }));
    
    // Set default theme
    await saveTheme('light', newUser.id);
    setTheme('light');
    applyTheme('light');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateUserStats = async (updates: Partial<Pick<User, 'streak' | 'completedExercises' | 'reflectionsCount'>>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    await updateUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        theme,
        login,
        signup,
        logout,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

