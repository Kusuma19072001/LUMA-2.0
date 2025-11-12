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

- **🎨 MoodCanvas**
  - Visual mood expression through AI-generated artwork
  - Emotional reflection and analysis
  - Mood tracking and comparison over time
  - Journal entries attached to mood entries
  - Download and save mood artwork

- **🧘 Mindfulness Exercises**
  - Guided meditation sessions
  - Breathing exercises (BreatheSync)
  - Exercise tracking and history
  - Personalized exercise recommendations
  - Progress tracking

- **📊 Analytics Dashboard**
  - Mood trends visualization
  - Activity streaks tracking
  - Weekly activity overview
  - Comprehensive usage statistics
  - Engagement metrics

- **👤 User Profile**
  - Customizable user preferences
  - PIN security for privacy
  - Personalization settings
  - Support focus selection
  - Notification preferences

- **🔔 Reminders & Achievements**
  - Customizable reminders
  - Achievement tracking
  - Progress milestones
  - Engagement rewards

- **📝 Wellness Surveys**
  - Daily mood check-ins
  - Comprehensive wellness assessments
  - Personalized suggestions based on responses
  - Survey history tracking

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.2** - Build tool and dev server
- **Tailwind CSS 3.4.14** - Styling
- **Lucide React** - Icon library

### AI & Services
- **Google Gemini AI** - Conversational AI and image generation
- **IndexedDB** - Local browser database
- **Web Speech API** - Voice input/output

### Development Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **TypeScript** - Type checking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "LUMA NEW 2.0"
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
LUMA NEW 2.0/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── EditPreferencesModal.tsx
│   │   ├── PinSecurityModal.tsx
│   │   ├── PlanCard.tsx
│   │   ├── SignalCard.tsx
│   │   └── SurveyModal.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useChat.ts
│   │   └── useVoice.ts
│   ├── pages/               # Page components
│   │   ├── AchievementsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── BreatheSyncPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── ExercisesPage.tsx
│   │   ├── MoodCanvasPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RemindersPage.tsx
│   │   └── WelcomePage.tsx
│   ├── services/            # API and database services
│   │   ├── database.ts      # IndexedDB operations
│   │   ├── gemini.ts        # Gemini chat API
│   │   └── geminiImage.ts   # Gemini image generation
│   ├── types/               # TypeScript type definitions
│   │   ├── chat.ts
│   │   └── database.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Build output
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── postcss.config.cjs       # PostCSS configuration
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

- All data is stored locally in the browser (IndexedDB)
- No data is sent to external servers except for AI API calls
- PIN security option for profile access
- User preferences for privacy settings
- Optional journal privacy settings

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

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices
- Use Tailwind CSS for styling (no component libraries)
- Maintain type safety throughout
- Use functional components with hooks

### Adding New Features

1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add types in `src/types/`
4. Add services in `src/services/`
5. Update database schema if needed
6. Add tests if applicable

### Database Migrations

When updating the database schema:
1. Increment `DB_VERSION` in `src/services/database.ts`
2. Add migration logic in `onupgradeneeded`
3. Update TypeScript types in `src/types/database.ts`

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

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ for emotional wellness and mindfulness**

