import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { ChatPage } from "./pages/ChatPage";
import AnalyticsPage from "./pages/Analytics";
import { ExercisesPage } from "./pages/ExercisesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MoodCanvasPage } from "./pages/MoodCanvasPage";
import { BreatheSyncPage } from "./pages/BreatheSyncPage";
import { RemindersPage } from "./pages/RemindersPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { LiveSupportPage } from "./pages/LiveSupportPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChatPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AnalyticsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ExercisesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/canvas"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MoodCanvasPage onNavigate={(tab) => {
                    // Handle navigation - could use useNavigate hook
                    const routeMap: Record<string, string> = {
                      home: "/home",
                      chat: "/chat",
                      canvas: "/canvas",
                      analytics: "/analytics",
                      exercises: "/exercises",
                      profile: "/profile",
                      breathesync: "/breathesync",
                      reminders: "/reminders",
                      achievements: "/achievements",
                      live: "/live",
                    };
                    if (routeMap[tab]) {
                      window.location.href = routeMap[tab];
                    }
                  }} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/breathesync"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BreatheSyncPage onNavigate={(tab) => {
                    const routeMap: Record<string, string> = {
                      home: "/home",
                      chat: "/chat",
                      canvas: "/canvas",
                      analytics: "/analytics",
                      exercises: "/exercises",
                      profile: "/profile",
                      breathesync: "/breathesync",
                      reminders: "/reminders",
                      achievements: "/achievements",
                      live: "/live",
                    };
                    if (routeMap[tab]) {
                      window.location.href = routeMap[tab];
                    }
                  }} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RemindersPage onNavigate={(tab) => {
                    const routeMap: Record<string, string> = {
                      home: "/home",
                      chat: "/chat",
                      canvas: "/canvas",
                      analytics: "/analytics",
                      exercises: "/exercises",
                      profile: "/profile",
                      breathesync: "/breathesync",
                      reminders: "/reminders",
                      achievements: "/achievements",
                      live: "/live",
                    };
                    if (routeMap[tab]) {
                      window.location.href = routeMap[tab];
                    }
                  }} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AchievementsPage onNavigate={(tab) => {
                    const routeMap: Record<string, string> = {
                      home: "/home",
                      chat: "/chat",
                      canvas: "/canvas",
                      analytics: "/analytics",
                      exercises: "/exercises",
                      profile: "/profile",
                      breathesync: "/breathesync",
                      reminders: "/reminders",
                      achievements: "/achievements",
                      live: "/live",
                    };
                    if (routeMap[tab]) {
                      window.location.href = routeMap[tab];
                    }
                  }} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LiveSupportPage onNavigate={(tab) => {
                    const routeMap: Record<string, string> = {
                      home: "/home",
                      chat: "/chat",
                      canvas: "/canvas",
                      analytics: "/analytics",
                      exercises: "/exercises",
                      profile: "/profile",
                      breathesync: "/breathesync",
                      reminders: "/reminders",
                      achievements: "/achievements",
                      live: "/live",
                    };
                    if (routeMap[tab]) {
                      window.location.href = routeMap[tab];
                    }
                  }} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
