# DevVanguard - Fantasy-Themed Coding Learning Platform

DevVanguard is a fantasy-themed web application designed to teach programming concepts through interactive lessons and coding challenges. Users embark on a quest-like journey where they solve coding problems, earn XP rewards, and track their progress in a gamified learning environment.

## Features

### Core Learning Features
- Interactive code editor with syntax highlighting (Monaco Editor)
- Real-time code execution and validation using Piston API
- Multi-language support (Python, JavaScript, Java, C++, etc.)
- Test case validation with detailed feedback
- Problem descriptions with formatted markdown rendering
- NPC Guide system with contextual hints and feedback

### User Progression System
- XP-based reward system for completed lessons
- Lesson completion tracking and status visualization
- Spam prevention: Users cannot re-submit completed lessons for additional XP
- User statistics dashboard showing total XP, lessons completed, and time spent
- Profile management and user account features

### Community Features
- Forum system for discussions and Q&A
- Post and comment creation with upvote/downvote functionality
- Course-specific discussion threads
- User reputation system through voting

### UI/UX Enhancements
- Fantasy-themed dark interface with cyberpunk aesthetics
- Loading screens with animated zombie character
- Success notification bubbles with particle effects and XP reward display
- Alert notifications for duplicate lesson submission warnings
- Responsive design for desktop and tablet views
- Custom icon set for lesson features (hints, code, discussion)

## Technology Stack

### Frontend
- React 18 with Vite bundler
- Monaco Editor for code editing
- Axios for API communication
- CSS3 with animations and backdrop filters
- JavaScript ES6+

### Backend
- C# .NET Core 8.0
- Entity Framework Core with PostgreSQL
- ASP.NET Core Web API
- JWT authentication
- CORS enabled for frontend integration

### Database
- PostgreSQL relational database
- Supabase for authentication backend
- Tables: users, courses, lessons, user_progress, user_stats, forum_posts, forum_comments

### Code Execution
- Piston API for secure code compilation and execution
- Support for multiple programming languages
- Real-time output streaming

### Authentication
- Supabase JWT token-based authentication
- Protected routes with role-based access control
- Admin and user role differentiation

## Installation and Setup

### Backend Setup
```bash
cd DEVVANGGUARD_API
dotnet restore
dotnet build
dotnet run
```
Backend runs on http://localhost:5131

### Frontend Setup
```bash
cd devvangguard
npm install
npm run dev      # Development
npm run build    # Production build
```
Frontend runs on http://localhost:5173

## Project Structure

```
DEVVANGGUARD_API/
  Controllers/          # API endpoints
  Models/              # Entity models
  Repositories/        # Data access layer
  Program.cs
  appsettings.json

devvangguard/
  src/
    components/        # Reusable React components
    pages/            # Page components
    services/         # API and business logic
    hooks/            # Custom React hooks
    utils/            # Helper functions
    assets/CSS/       # Stylesheets
  public/
    UX/               # GIF animations
    icons/            # Icon assets
```

## API Endpoints

### User Management
- POST /api/user/register
- POST /api/user/login
- GET /api/user/{userId}

### Courses and Lessons
- GET /api/course
- GET /api/course/{courseId}
- GET /api/lesson/{lessonId}

### User Progress
- POST /api/userprogress/submit-lesson
- GET /api/userprogress/{userId}/{lessonId}

### User Statistics
- GET /api/userstats/{userId}
- POST /api/userstats
- PUT /api/userstats/{statId}

### Forum
- GET /api/forumpost
- POST /api/forumpost
- POST /api/forumcomment

## Key Features Implementation

### Lesson Submission System
When users submit a completed lesson:
1. System checks if lesson has already been completed by the user
2. If not completed: Creates user_progress record, awards XP, increments lesson count
3. If already completed: Shows alert notification preventing duplicate submission and XP gain
4. Automatically redirects user back to course list after notification

### XP Reward System
- Each lesson has configurable XP reward
- XP is only awarded on first successful completion
- Prevents spam submissions and maintains game balance
- User statistics automatically updated with new XP total

### Course Display
- Shows all available courses with lesson previews
- Displays completion status with visual indicators
- Start button for incomplete lessons, Completed status for finished ones
- Formatted problem descriptions with syntax highlighting
- Completion status color-coded in green for completed lessons

### Code Execution Pipeline
1. User writes code in Monaco Editor
2. Piston API executes code with test cases
3. Output displayed in real-time
4. All test cases must pass before submission allowed
5. NPC provides contextual feedback for success or errors

## Database Schema

### Users Table
- user_id (UUID)
- email (unique)
- full_name
- role (user, admin)
- created_at, updated_at

### User_Progress Table
- progress_id (UUID)
- user_id (foreign key)
- lesson_id (foreign key)
- status (in_progress, completed)
- last_accessed (timestamp)

### User_Stats Table
- stat_id (UUID)
- user_id (foreign key)
- xp (integer)
- total_lessons_completed (integer)
- total_time_spent (integer)
- last_updated (timestamp)

### Lessons Table
- lesson_id (UUID)
- course_id (foreign key)
- lesson_title
- problem_description (markdown text)
- solution_template
- test_cases (JSON)
- xp_reward (integer)

## Development Notes

- All timestamps use local datetime for PostgreSQL compatibility
- Problem descriptions are parsed and rendered with syntax highlighting
- Code execution is sandboxed via Piston API for security
- User sessions managed through Supabase JWT tokens
- Admin features require elevated permissions
- Duplicate submission prevention uses local client-side validation before API call

## Future Enhancements

- Leaderboard system with user rankings
- Achievement and badge system
- Code submission history and version control
- Difficulty levels for lessons
- Multi-player coding challenges
- Mobile app support
- Advanced analytics and user progress reports
- Achievement badges and milestones

## ⚔️ Features

### 🎭 Immersive Medieval Theme
- **Fantasy UI Design** - Complete medieval/fantasy aesthetic with knights, castles, and magical effects
- **Glass Morphism Cards** - Modern transparent designs that showcase beautiful fantasy backgrounds
- **Magical Animations** - Sparkle effects, floating elements, and smooth transitions
- **Custom Medieval Typography** - Using `MedievalSharp` and `Cinzel` fonts for authentic feel

### 📚 Learning Management System
- **Quest-Based Courses** - Programming courses presented as epic quests to complete
- **Multiple Skill Levels** - Beginner, Intermediate, and Advanced courses with star ratings
- **Progress Tracking** - Visual progress bars and completion percentages
- **Course Categories** - Python, HTML/CSS, JavaScript, React, Databases, and Algorithms

### 📊 Gamification & User Engagement
- **Daily Streak System** - Track consecutive learning days with fire animations
- **XP & Leveling** - Gain experience points and level up your coding knight
- **Random Daily Advice** - Motivational coding wisdom that changes each visit
- **User Stats Dashboard** - Personal profile with level badges and progress tracking

### 🔐 Authentication System
- **Complete Auth Flow** - Login, Registration, and Forgot Password pages
- **Medieval-Themed Forms** - Fantasy-styled authentication with magical effects
- **Social Login Options** - Google and GitHub integration ready
- **Responsive Design** - Works seamlessly on all devices

### 📱 Modern UX/UI
- **Responsive Design** - Mobile-first approach with elegant breakpoints
- **Smooth Navigation** - React Router integration for seamless page transitions
- **Loading States** - Beautiful animations and transitions
- **Accessibility** - Enhanced text shadows and contrast for readability

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** - Modern React with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **React Router Dom** - Client-side routing for SPA navigation

### Styling & Design
- **CSS3** - Custom CSS with modern features (Grid, Flexbox, Backdrop Filter)
- **CSS Variables** - Consistent theming with custom properties
- **Google Fonts** - Medieval and elegant typography (MedievalSharp, Cinzel)
- **Font Awesome** - Icon library for UI elements

### Development Tools
- **ESLint** - Code quality and consistency
- **Vite HMR** - Hot Module Replacement for instant development feedback
- **Modern JavaScript** - ES6+ features and clean code practices

### Assets & Media
- **Optimized Images** - Fantasy backgrounds and themed imagery
- **Icon System** - Organized icon assets in `/public/icons/`
- **Background Images** - High-quality fantasy landscapes in `/public/images/`

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devvangguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the magic! ✨

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
devvangguard/
├── public/
│   ├── images/          # Background and UI images
│   ├── icons/           # Icon assets
│   └── index.html       # Main HTML template
├── src/
│   ├── assets/
│   │   └── CSS/         # Stylesheets for each component
│   │       ├── auth.css      # Authentication pages styling
│   │       ├── coursescreen.css  # Course detail page styling
│   │       ├── intro.css     # Landing page styling
│   │       └── mainmenu.css  # Main dashboard styling
│   ├── pages/
│   │   ├── Account/     # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── Course/      # Course-related components
│   │   │   └── CourseScreen.jsx
│   │   ├── Menu/        # Main dashboard
│   │   │   └── MainMenu.jsx
│   │   └── intro.jsx    # Landing page
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
└── package.json         # Dependencies and scripts
```

## 🎨 Design Philosophy

### Medieval Fantasy Aesthetic
DevVanguard transforms the typical coding education experience into an immersive medieval adventure. Every element, from the navigation to the course cards, is designed to make users feel like they're embarking on a grand coding quest.

### Glass Morphism & Modern UI
While maintaining the fantasy theme, the platform uses cutting-edge design trends like glass morphism, creating transparent, floating elements that showcase the beautiful fantasy backgrounds while maintaining excellent readability.

### Gamification for Engagement
Learning is enhanced through game-like elements:
- **Daily streaks** encourage consistent practice
- **XP systems** provide progression feedback
- **Quest metaphors** make learning feel like an adventure
- **Achievement tracking** celebrates milestones

## 🎯 Key Pages & Features

### 🏠 Landing Page (`/`)
- Hero section with medieval branding
- Course showcase with fantasy styling
- Developer team presentation
- Call-to-action for registration

### 🔐 Authentication (`/login`, `/register`, `/forgot-password`)
- Fantasy-themed login and registration forms
- Social authentication options
- Password recovery with magical styling
- Sparkle effects and animations

### 🏰 Main Dashboard (`/main-menu`)
- User stats sidebar with streak tracking
- Random daily advice system
- Course grid with progress tracking
- Glass morphism course cards

### 📖 Course Details (`/course/:id`)
- Detailed course information
- Lesson breakdown with progress
- Difficulty ratings and time estimates
- Beautiful quest-themed backgrounds

## 🔧 Development Guidelines

### Code Standards
- Use functional components with React hooks
- Maintain consistent CSS variable usage
- Follow the established naming conventions
- Keep components modular and reusable

### Styling Approach
- Each page has its own CSS file for maintainability
- Use CSS Grid and Flexbox for layouts
- Implement glass morphism with `backdrop-filter`
- Maintain consistent medieval color palette

### Asset Management
- Store images in `/public/images/`
- Store icons in `/public/icons/`
- Use relative paths from public root (`/images/filename.jpg`)
- Optimize images for web performance

## 🌟 Future Enhancements

- [ ] User authentication backend integration
- [ ] Real course content and video lessons
- [ ] Achievement system with badges
- [ ] Community features and forums
- [ ] Mobile app development
- [ ] Advanced progress analytics
- [ ] Multiplayer coding challenges
- [ ] AI-powered learning recommendations

## 🤝 Contributing

We welcome contributions to make DevVanguard even more magical! Please feel free to:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Live Demo

*Add your deployed URL here when available*

---

**Built with ❤️ and ⚔️ by the DevVanguard Team**

*"May your code be bug-free and your coffee be strong!"* ☕✨
