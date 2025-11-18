# LUMA 2.0 - Emotional Wellness Companion

LUMA is a compassionate emotional wellness companion built with React, TypeScript, and Google Gemini AI. It provides a safe space for users to express their emotions, track their mood, practice mindfulness exercises, and receive personalized emotional support through AI-powered conversations.

## 🌟 Features

### Core Features

- **🤖 AI-Powered Chat Companion**
  - Conversational AI powered by Google Gemini 2.5 Flash
  - Emotion-aware responses with tone analysis
  - Personalized micro-coaching plans
  - Voice input and output support
  - Context-aware conversation history
  - Real-time chat interface with message history

- **🎨 MoodCanvas**
  - Visual mood expression through AI-generated artwork
  - Emotional reflection and analysis
  - Mood tracking and comparison over time
  - Journal entries attached to mood entries
  - Download and save mood artwork
  - AI-powered mood visualization

- **🧘 Mindfulness Exercises**
  - Guided meditation sessions
  - Breathing exercises (BreatheSync)
  - Exercise tracking and history
  - Personalized exercise recommendations
  - Progress tracking
  - Session duration tracking

- **📊 Analytics Dashboard**
  - Mood trends visualization with interactive charts
  - Activity streaks tracking
  - Weekly activity overview
  - Comprehensive usage statistics
  - Engagement metrics
  - Data visualization using Recharts

- **👤 User Profile & Authentication**
  - Secure user authentication (login/signup)
  - Customizable user preferences
  - PIN security for privacy
  - Personalization settings
  - Support focus selection
  - Notification preferences
  - Theme customization (light/dark mode)
  - User statistics tracking

- **🔔 Reminders & Achievements**
  - Customizable reminders
  - Achievement tracking
  - Progress milestones
  - Engagement rewards
  - Streak tracking

- **📝 Wellness Surveys**
  - Daily mood check-ins
  - Comprehensive wellness assessments
  - Personalized suggestions based on responses
  - Survey history tracking

- **💬 Live Support**
  - Live support page for user assistance
  - Direct access to help resources

- **🏠 Welcome & Home**
  - Welcome page for new users
  - Home dashboard with quick access to features

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.2** - Build tool and dev server
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **React Router DOM 7.9.6** - Client-side routing
- **Lucide React 0.553.0** - Icon library
- **Recharts 3.4.1** - Chart library for analytics

### AI & Services
- **Google Gemini AI (@google/generative-ai 0.24.1)** - Conversational AI and image generation
- **IndexedDB** - Local browser database for data persistence
- **Web Speech API** - Voice input/output capabilities

### Additional Libraries
- **@tensorflow/tfjs 4.15.0** - TensorFlow.js for machine learning
- **face-api.js 0.22.2** & **@vladmandic/face-api 1.7.14** - Face detection capabilities

### Development Tools
- **PostCSS 8.4.49** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixes
- **TypeScript** - Type checking and static analysis

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Luma Analytics"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_MODEL=gemini-2.5-flash
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🏗️ Project Structure

```
Luma Analytics/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AppLayout.tsx           # Main application layout
│   │   ├── ChatBubble.tsx          # Chat message bubbles
│   │   ├── ChatInput.tsx           # Chat input component
│   │   ├── EditPreferencesModal.tsx # User preferences modal
│   │   ├── PinSecurityModal.tsx    # PIN security setup
│   │   ├── PlanCard.tsx            # Coaching plan cards
│   │   ├── ProtectedRoute.tsx      # Route protection component
│   │   ├── SignalCard.tsx          # Signal/notification cards
│   │   └── SurveyModal.tsx         # Wellness survey modal
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx         # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useAnalytics.ts         # Analytics data hook
│   │   ├── useChat.ts              # Chat functionality hook
│   │   └── useVoice.ts             # Voice input/output hook
│   ├── pages/               # Page components
│   │   ├── AchievementsPage.tsx    # Achievements tracking
│   │   ├── Analytics.tsx           # Analytics page (alternative)
│   │   ├── AnalyticsPage.tsx       # Analytics dashboard
│   │   ├── BreatheSyncPage.tsx     # Breathing exercises
│   │   ├── ChatPage.tsx            # AI chat interface
│   │   ├── ExercisesPage.tsx       # Mindfulness exercises
│   │   ├── ForgotPasswordPage.tsx  # Password recovery
│   │   ├── HomePage.tsx            # Home dashboard
│   │   ├── LiveSupportPage.tsx     # Live support
│   │   ├── LoginPage.tsx           # User login
│   │   ├── MoodCanvasPage.tsx      # Mood canvas
│   │   ├── ProfilePage.tsx         # User profile
│   │   ├── RemindersPage.tsx       # Reminders management
│   │   ├── SignupPage.tsx          # User registration
│   │   └── WelcomePage.tsx         # Welcome screen
│   ├── services/            # API and database services
│   │   ├── database.ts             # IndexedDB operations
│   │   ├── gemini.ts               # Gemini chat API
│   │   └── geminiImage.ts          # Gemini image generation
│   ├── types/               # TypeScript type definitions
│   │   ├── chat.ts                 # Chat-related types
│   │   └── database.ts             # Database schema types
│   ├── utils/               # Utility functions
│   │   ├── indexedDB.ts            # IndexedDB utilities
│   │   └── userDB.ts               # User database utilities
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   └── vite.svg
├── dist/                    # Build output (generated)
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
├── postcss.config.cjs       # PostCSS configuration
└── README.md                # This file
```

## 📜 Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement.

### Build
```bash
npm run build
```
Builds the app for production. Outputs to the `dist/` directory.

### Preview
```bash
npm run preview
```
Previews the production build locally.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `VITE_GEMINI_MODEL` | Gemini model to use (default: `gemini-2.5-flash`) | No |

### Tailwind CSS

The project uses Tailwind CSS for styling. Custom configurations can be found in `tailwind.config.cjs`:
- Custom fonts (Poppins for headings, Nunito for body)
- Custom animations (bubbleIn, auraPulse)
- Custom color palettes

### TypeScript

TypeScript is configured with strict mode enabled. Configuration can be found in `tsconfig.json`.

## 💾 Database Schema

LUMA uses IndexedDB for local data storage. The database schema includes:

### Object Stores

1. **moodEntries** - Mood tracking entries with artwork
2. **chatConversations** - Chat conversation history
3. **breathingSessions** - Breathing exercise sessions
4. **exerciseSessions** - Meditation and exercise sessions
5. **userActivities** - User activity tracking
6. **surveyResponses** - Wellness survey responses

### Data Types

See `src/types/database.ts` for complete type definitions:

- `MoodEntry` - Mood entries with artwork and reflections
- `ChatConversation` - Chat conversations with messages and plans
- `BreathingSession` - Breathing exercise sessions
- `ExerciseSession` - Exercise/meditation sessions
- `UserActivity` - Activity tracking
- `AnalyticsData` - Analytics and statistics
- `SurveyResponse` - Wellness survey responses
- `UserPreferences` - User settings and preferences

## 🎨 Key Features Explained

### AI Chat

The chat feature uses Google Gemini AI to provide:
- Emotion-aware responses
- Tone analysis (calm, compassionate, encouraging, etc.)
- Personalized micro-coaching plans
- Context-aware conversations
- Voice input/output support

### MoodCanvas

Users can:
- Express moods through text prompts
- Generate AI artwork representing their emotions
- Receive emotional reflections and insights
- Compare moods over time
- Attach journal entries to mood entries
- Download and save artwork

### Analytics

The analytics dashboard provides:
- Mood trends over time
- Activity streaks
- Weekly activity overview
- Total usage statistics
- Engagement metrics

### Exercises

The app includes:
- Guided meditation sessions
- Breathing exercises (BreatheSync)
- Exercise tracking
- Personalized recommendations
- Progress tracking

## 🔒 Privacy & Security

- **Local-First Architecture**: All user data is stored locally in the browser (IndexedDB)
- **No External Data Storage**: No data is sent to external servers except for AI API calls to Google Gemini
- **PIN Security**: Optional PIN protection for profile access
- **Session Management**: Secure session handling using localStorage
- **Privacy Settings**: User preferences for privacy settings and journal privacy
- **Client-Side Processing**: All data processing happens client-side
- **No Backend Required**: Fully functional as a client-side application

## 🐛 Troubleshooting

### API Key Issues

If you encounter API key errors:
1. Verify your `.env` file exists in the root directory
2. Ensure `VITE_GEMINI_API_KEY` is set correctly
3. Restart the development server after adding the key
4. Check that your API key is valid and has quota remaining

### Database Issues

If you encounter database errors:
1. Clear browser cache and IndexedDB
2. Restart the application
3. Check browser console for specific error messages

### Build Issues

If the build fails:
1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript errors: `npm run build`
3. Verify Node.js version is 18 or higher
4. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Voice Features Not Working

If voice input/output doesn't work:
1. Ensure you're using a browser that supports Web Speech API (Chrome, Edge, Safari)
2. Check browser permissions for microphone access
3. Verify HTTPS connection (required for microphone access in most browsers)

### Database Not Initializing

If the database fails to initialize:
1. Check browser console for specific error messages
2. Clear browser storage: Open DevTools > Application > Clear storage
3. Ensure IndexedDB is enabled in your browser settings
4. Try in an incognito/private window to rule out extension conflicts

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling (no component libraries like Ant Design, MUI, or Chakra UI)
- Maintain type safety throughout
- Use functional components with hooks
- Follow the existing project structure and naming conventions

### Adding New Features

1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add types in `src/types/`
4. Add services in `src/services/`
5. Add custom hooks in `src/hooks/` if needed
6. Add contexts in `src/contexts/` for shared state
7. Update database schema if needed
8. Add routes in `src/App.tsx`
9. Update this README if adding major features

### Component Guidelines

- Use Tailwind CSS utility classes for styling
- Keep components focused and reusable
- Use TypeScript interfaces for props
- Implement proper error handling
- Follow accessibility best practices

### Database Migrations

When updating the database schema:
1. Increment `DB_VERSION` in `src/services/database.ts`
2. Add migration logic in `onupgradeneeded`
3. Update TypeScript types in `src/types/database.ts`

### Routing

The application uses React Router for navigation:
- Public routes: `/login`, `/signup`, `/forgot-password`
- Protected routes: `/home`, `/chat`, `/analytics`, `/exercises`, `/profile`, `/canvas`, `/breathesync`, `/reminders`, `/achievements`, `/live`
- Default route redirects to `/home`

### Authentication

- User authentication is handled through `AuthContext`
- Session management using localStorage
- User data stored in IndexedDB via `userDB.ts`
- Protected routes require authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Google Gemini AI for conversational AI capabilities
- React team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon library

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

- **Static Hosting**: Deploy the `dist/` folder to any static hosting service
- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Deploy the `dist/` folder or connect your repository
- **GitHub Pages**: Deploy the `dist/` folder to GitHub Pages

**Note**: Remember to set your `VITE_GEMINI_API_KEY` environment variable in your hosting platform's environment settings.

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🔄 Version History

- **v2.0** - Current version with full feature set
  - AI-powered chat companion
  - MoodCanvas with AI artwork
  - Analytics dashboard
  - Mindfulness exercises
  - User authentication
  - Reminders and achievements

---

**Built with ❤️ for emotional wellness and mindfulness**

