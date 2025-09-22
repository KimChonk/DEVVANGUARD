import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/CSS/mainmenu.css";

export default function MainMenu() {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/images/default-avatar.jpg",
    level: "Code Knight",
    currentXP: 850,
    nextLevelXP: 1000,
    dailyStreak: 7
  });

  // Random daily advice that changes each time page loads
  const dailyAdvices = [
    "A true knight never stops learning. Code a little every day!",
    "The path to mastery is paved with curiosity and practice.",
    "Every bug you fix makes you a stronger warrior.",
    "Great code, like great quests, starts with a single line.",
    "Debug with patience, code with passion.",
    "The best time to learn was yesterday. The second best time is now.",
    "Your next breakthrough is just one lesson away.",
    "Consistency beats intensity. Keep your coding streak alive!",
    "Every master was once a beginner. Every pro was once an amateur.",
    "Code is poetry written in logic. Make yours beautiful."
  ];

  const [dailyAdvice] = useState(() => {
    return dailyAdvices[Math.floor(Math.random() * dailyAdvices.length)];
  });

  // Sample courses data
  const [courses] = useState([
    {
      id: 1,
      title: "Python Mastery",
      description: "Master the ancient art of Python programming and unlock the secrets of data manipulation.",
      level: "Beginner",
      lessons: 24,
      progress: 35,
      status: "continue"
    },
    {
      id: 2,
      title: "HTML & CSS Foundations",
      description: "Build the foundation of web development with HTML structure and CSS styling magic.",
      level: "Beginner",
      lessons: 18,
      progress: 100,
      status: "completed"
    },
    {
      id: 3,
      title: "JavaScript Adventures",
      description: "Embark on dynamic adventures with JavaScript and bring your web pages to life.",
      level: "Intermediate",
      lessons: 32,
      progress: 0,
      status: "start"
    },
    {
      id: 4,
      title: "React Kingdom",
      description: "Rule the React kingdom and build powerful, interactive user interfaces.",
      level: "Advanced",
      lessons: 28,
      progress: 0,
      status: "start"
    },
    {
      id: 5,
      title: "Database Dungeons",
      description: "Navigate through database dungeons and master the art of data storage and retrieval.",
      level: "Intermediate",
      lessons: 20,
      progress: 60,
      status: "continue"
    },
    {
      id: 6,
      title: "Algorithm Arena",
      description: "Battle in the algorithm arena and sharpen your problem-solving skills.",
      level: "Advanced",
      lessons: 25,
      progress: 0,
      status: "start"
    }
  ]);

  const handleCourseClick = useCallback((courseId) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const getLevelIcon = useCallback((level) => {
    switch (level) {
      case "Beginner":
        return <i className="fas fa-star"></i>;
      case "Intermediate":
        return <><i className="fas fa-star"></i><i className="fas fa-star"></i></>;
      case "Advanced":
        return <><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i></>;
      default:
        return <i className="fas fa-star"></i>;
    }
  }, []);

  const xpPercentage = useMemo(() => {
    return (user.currentXP / user.nextLevelXP) * 100;
  }, [user.currentXP, user.nextLevelXP]);

  return (
    <div className="main-menu-container">
      <div className="main-menu-background"></div>

      {/* Navigation */}
      <nav className="main-navbar">
        <div className="main-nav-container">
          <div className="main-nav-logo">
            <img src="/icons/knight_icon.png" alt="Knight Icon" className="main-logo-icon" />
            <span className="main-logo-text">
              Dev <span className="main-highlight">Vanguard</span>
            </span>
          </div>
          <div className="main-nav-center">
            <h1 className="main-nav-title">Knight's Academy</h1>
          </div>
          <div className="main-nav-right">
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="user-avatar"
              onError={(e) => {
                e.target.src = "/icons/knight_icon.png";
              }}
            />
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* User Stats Sidebar */}
        <div className="user-stats-sidebar">
          {/* User Profile Card */}
          <div className="stats-card">
            <h3 className="stats-title">
              <i className="fas fa-user-circle"></i> {user.name}
            </h3>
            <div className="user-level">
              <span className="level-badge">{user.level}</span>
            </div>
            <div className="xp-display">
              <div className="xp-label">
                <span>Experience</span>
                <span>{user.currentXP}/{user.nextLevelXP} XP</span>
              </div>
              <div className="xp-bar">
                <div 
                  className="xp-fill" 
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Daily Streak Card */}
          <div className="stats-card">
            <h3 className="stats-title">
              <i className="fas fa-fire"></i> Daily Streak
            </h3>
            <div className="streak-display">
              <span className="streak-number">{user.dailyStreak}</span>
              <div className="streak-fire">🔥</div>
              <span className="streak-label">Days in a row!</span>
            </div>
          </div>

          {/* Daily Advice Card */}
          <div className="daily-advice">
            <div className="advice-title">
              <i className="fas fa-scroll"></i>
              Sage's Wisdom
            </div>
            <p className="advice-text">{dailyAdvice}</p>
          </div>
        </div>

        {/* Courses Main Section */}
        <div className="courses-main">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h1 className="welcome-title">Welcome Back, {user.name}!</h1>
            <p className="welcome-subtitle">
              Your coding adventure continues! Choose a quest to advance your skills and grow stronger as a Code Knight.
            </p>
          </section>

          {/* Courses Section */}
          <section className="courses-section">
            <div className="courses-header">
              <h2 className="courses-title">Available Quests</h2>
            </div>

            <div className="courses-grid">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="course-card"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-meta">
                    <div className="course-level">
                      {getLevelIcon(course.level)}
                      <span>{course.level}</span>
                    </div>
                    <div className="course-lessons">
                      {course.lessons} Lessons
                    </div>
                  </div>

                  {course.progress > 0 && (
                    <div className="course-progress">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="course-action">
                    {course.status === "start" && (
                      <button className="start-course-btn">
                        <i className="fas fa-play"></i> Start Quest
                      </button>
                    )}
                    {course.status === "continue" && (
                      <button className="continue-course-btn">
                        <i className="fas fa-arrow-right"></i> Continue Quest
                      </button>
                    )}
                    {course.status === "completed" && (
                      <button className="continue-course-btn">
                        <i className="fas fa-check"></i> Review Quest
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}