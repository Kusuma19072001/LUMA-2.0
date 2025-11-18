import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WelcomePage } from './WelcomePage';

export function HomePage() {
  // const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a greeting message from navigation state
    if (location.state?.greeting) {
      setGreeting(location.state.greeting);
      // Clear the state after showing
      setTimeout(() => {
        setGreeting(null);
        window.history.replaceState({}, document.title);
      }, 3000);
    }
  }, [location.state]);

  // Convert tab navigation to route navigation
  const handleTabNavigation = (tab: string) => {
    const routeMap: Record<string, string> = {
      chat: '/chat',
      canvas: '/canvas',
      exercises: '/exercises',
      analytics: '/analytics',
      profile: '/profile',
      breathesync: '/breathesync',
      reminders: '/reminders',
      achievements: '/achievements',
      live: '/live',
    };
    
    if (routeMap[tab]) {
      navigate(routeMap[tab]);
    }
  };

  return (
    <div>
      {greeting && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-white shadow-xl">
            <p className="font-semibold">{greeting}</p>
          </div>
        </div>
      )}
      <WelcomePage
        onStartChat={() => handleTabNavigation('chat')}
        onOpenMoodCanvas={() => handleTabNavigation('canvas')}
        onOpenExercises={(exerciseId) => {
          handleTabNavigation('exercises');
          if (exerciseId) {
            sessionStorage.setItem('startExercise', exerciseId);
          }
        }}
        onOpenBreatheSync={() => handleTabNavigation('breathesync')}
        onOpenReminders={() => handleTabNavigation('reminders')}
        onOpenAchievements={() => handleTabNavigation('achievements')}
      />
    </div>
  );
}

