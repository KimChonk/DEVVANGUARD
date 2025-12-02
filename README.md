# DevVanguard - Fantasy-Themed Coding Learning Platform

DevVanguard is an interactive, fantasy-themed web application designed to teach programming through quest-like challenges. Users solve coding problems, earn experience points (XP), and progress through courses while enjoying an immersive medieval-themed learning environment.

## Overview

DevVanguard transforms traditional coding education into an engaging adventure. The platform combines modern web technologies with gamification elements—XP rewards, progression tracking, leaderboards, and achievement badges—to make learning programming both fun and effective.

### Core Capabilities
- Interactive code editor with real-time execution (Monaco Editor + Piston API)
- Multi-language support (Python, JavaScript, Java, C++, and more)
- XP-based progression system with lesson completion tracking
- Forum system for community discussions
- User statistics dashboard and profile management
- Admin controls for content management

## Technology Stack

### Frontend
- React 18 with Vite bundler
- Monaco Editor for code editing
- Axios for API communication
- CSS3 with glass morphism and animations

### Backend
- C# .NET Core 8.0
- Entity Framework Core with PostgreSQL
- ASP.NET Core Web API
- JWT authentication via Supabase

### Execution
- Piston API for secure, sandboxed code execution
- Real-time output streaming
- Multi-language support

## Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- .NET 8.0 (for backend)

### Frontend Setup
```bash
cd devvangguard
npm install
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build
```

### Backend Setup
```bash
cd DEVVANGGUARD_API
dotnet restore
dotnet build
dotnet run        # Runs at http://localhost:5131
```

## Project Structure

```
devvangguard/
src/
  components/     - Reusable React components (CodeEditor, Discussion, BadgeNotification)
  pages/         - Page components (Course, Lesson, Dashboard, Authentication)
  services/      - API clients and business logic
  hooks/         - Custom React hooks (useUser, useCourses, usePvP)
  contexts/      - React context for global state (AuthContext)
  assets/CSS/    - Stylesheets for components and pages
  utils/         - Helper functions and utilities
public/
  images/        - Fantasy backgrounds and UI assets
  icons/         - Icon assets for UI elements
  Badges/        - User achievement badge images

DEVVANGGUARD_API/
Controllers/     - API endpoints (User, Course, Lesson, Forum, UserProgress)
Models/          - Entity models and database schemas
Repositories/    - Data access layer with Entity Framework
Program.cs       - Application configuration and middleware
```

## Key Features

### Learning System
- Interactive lessons with test case validation
- Real-time code execution with detailed output
- Lesson hints and NPC guidance system
- Completion tracking with visual status indicators

### Progression
- XP rewards for successful lesson completion
- Duplicate submission prevention (no XP farming)
- User statistics dashboard
- Course-based progression tracking

### Community
- Discussion forums for each course
- Post upvoting and commenting system
- User reputation through community voting

### User Experience
- Dark medieval-themed interface
- Glass morphism design for modern aesthetics
- Responsive layout for desktop and tablet
- Loading animations and success notifications

## API Endpoints

User Management: `POST /api/user/register`, `POST /api/user/login`, `GET /api/user/{userId}`
Courses: `GET /api/course`, `GET /api/course/{courseId}`
Lessons: `GET /api/lesson/{lessonId}`
User Progress: `POST /api/userprogress/submit-lesson`, `GET /api/userprogress/{userId}/{lessonId}`
Statistics: `GET /api/userstats/{userId}`, `POST /api/userstats`
Forum: `GET /api/forumpost`, `POST /api/forumpost`, `POST /api/forumcomment`

## Development

### Code Standards
- Use functional components with React hooks
- Maintain consistent CSS variable usage
- Keep components modular and reusable
- Use CSS Grid and Flexbox for layouts

### Running Tests
Tests and validation are performed through the code editor's test case system during development.

## Future Enhancements

- Multiplayer coding challenges
- Advanced leaderboard and ranking system
- Mobile app development
- Code submission history and version control
- AI-powered learning recommendations
- Progress analytics and reporting

## License

MIT License - See LICENSE file for details

---

**Built by the DevVanguard Team**
