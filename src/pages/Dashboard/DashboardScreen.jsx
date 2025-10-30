import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/CSS/dashboard.css";

export default function DashboardScreen() {
  const navigate = useNavigate();
  
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/images/default-avatar.jpg",
    level: "Code Knight",
    currentXP: 850,
    nextLevelXP: 1000,
    dailyStreak: 7,
    totalCourses: 6,
    completedCourses: 2,
    hoursLearned: 45,
    rank: 15
  });

  // Recent activity data
  const [recentActivity] = useState([
    {
      id: 1,
      type: "lesson_complete",
      title: "Variables and Data Types",
      course: "Python Mastery",
      timestamp: "2 hours ago",
      xp: 50
    },
    {
      id: 2,
      type: "course_complete",
      title: "HTML & CSS Foundations",
      course: "Web Development",
      timestamp: "1 day ago",
      xp: 200
    },
    {
      id: 3,
      type: "streak_milestone",
      title: "7-day Learning Streak!",
      course: null,
      timestamp: "2 days ago",
      xp: 100
    },
    {
      id: 4,
      type: "lesson_complete",
      title: "Functions and Methods",
      course: "Python Mastery",
      timestamp: "3 days ago",
      xp: 75
    }
  ]);

  // Quick stats
  const quickStats = useMemo(() => [
    {
      title: "Courses in Progress",
      value: user.totalCourses - user.completedCourses,
      icon: "fas fa-book-open",
      color: "blue"
    },
    {
      title: "Completed Courses",
      value: user.completedCourses,
      icon: "fas fa-trophy",
      color: "gold"
    },
    {
      title: "Hours Learned",
      value: user.hoursLearned,
      icon: "fas fa-clock",
      color: "green"
    },
    {
      title: "Current Rank",
      value: `#${user.rank}`,
      icon: "fas fa-medal",
      color: "purple"
    }
  ], [user]);

  // Learning progress chart data (mock data)
  const [learningProgress] = useState([
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.1 },
    { day: "Fri", hours: 4.0 },
    { day: "Sat", hours: 3.5 },
    { day: "Sun", hours: 2.8 }
  ]);

  // Recommended courses
  const [recommendedCourses] = useState([
    {
      id: 7,
      title: "Node.js Backend",
      description: "Master server-side development with Node.js",
      level: "Intermediate",
      estimatedTime: "6 weeks",
      difficulty: 3
    },
    {
      id: 8,
      title: "Machine Learning Basics",
      description: "Introduction to AI and ML concepts",
      level: "Advanced",
      estimatedTime: "8 weeks",
      difficulty: 4
    },
    {
      id: 9,
      title: "Git Version Control",
      description: "Master version control with Git and GitHub",
      level: "Beginner",
      estimatedTime: "2 weeks",
      difficulty: 2
    }
  ]);

  const handleCourseClick = useCallback((courseId) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLeaderboardClick = () => {
    navigate("/leaderboards");
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "lesson_complete":
        return "fas fa-check-circle";
      case "course_complete":
        return "fas fa-trophy";
      case "streak_milestone":
        return "fas fa-fire";
      default:
        return "fas fa-star";
    }
  };

  const xpPercentage = useMemo(() => {
    return (user.currentXP / user.nextLevelXP) * 100;
  }, [user.currentXP, user.nextLevelXP]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-background"></div>

      {/* Navigation */}
      <nav className="dashboard-navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo" onClick={() => navigate("/main-menu")}>
              <img
                src="/icons/knight_icon.png"
                alt="Knight Icon"
                className="logo-icon"
              />
              <span className="logo-text">
                Dev <span className="highlight">Vanguard</span>
              </span>
            </div>
            
            <ul className="nav-links">
              <li><a onClick={() => navigate("/main-menu")}>Courses</a></li>
              <li><a onClick={() => navigate("/dashboard")} className="active">Dashboard</a></li>
              <li><a onClick={() => navigate("/leaderboards")}>Leaderboards</a></li>
            </ul>
          </div>
          
          <div className="nav-right">
            <button className="avatar-btn" onClick={handleProfileClick}>
              <img 
                src={user.avatar} 
                alt="User Avatar" 
                className="user-avatar"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </h1>
            <p className="welcome-subtitle">
              Track your learning journey and see your progress at a glance
            </p>
          </div>
          
          {/* User Progress Card */}
          <div className="user-progress-card">
            <div className="user-info">
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="user-avatar-large"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
              <div className="user-details">
                <h3 className="user-name">{user.name}</h3>
                <span className="user-level">{user.level}</span>
              </div>
            </div>
            
            <div className="xp-section">
              <div className="xp-info">
                <span className="xp-label">Experience Points</span>
                <span className="xp-value">{user.currentXP}/{user.nextLevelXP} XP</span>
              </div>
              <div className="xp-bar">
                <div 
                  className="xp-fill" 
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="streak-section">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <span className="streak-number">{user.dailyStreak}</span>
                <span className="streak-label">Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="quick-stats-grid">
          {quickStats.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Learning Progress Chart */}
          <div className="dashboard-widget progress-chart-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-chart-line"></i>
                Weekly Learning Progress
              </h3>
            </div>
            <div className="chart-container">
              {learningProgress.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${(day.hours / 4) * 100}%`,
                      backgroundColor: day.hours > 3 ? '#10b981' : day.hours > 2 ? '#f59e0b' : '#6b7280'
                    }}
                  ></div>
                  <span className="bar-label">{day.day}</span>
                  <span className="bar-value">{day.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-widget activity-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-history"></i>
                Recent Activity
              </h3>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <i className={getActivityIcon(activity.type)}></i>
                  </div>
                  <div className="activity-content">
                    <h4 className="activity-title">{activity.title}</h4>
                    {activity.course && (
                      <p className="activity-course">{activity.course}</p>
                    )}
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                  <div className="activity-xp">
                    +{activity.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="dashboard-widget recommended-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-lightbulb"></i>
                Recommended for You
              </h3>
            </div>
            <div className="recommended-courses">
              {recommendedCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="recommended-course"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="course-info">
                    <h4 className="course-title">{course.title}</h4>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span className="course-level">{course.level}</span>
                      <span className="course-time">{course.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="difficulty-stars">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i}
                        className={`fas fa-star ${i < course.difficulty ? 'filled' : ''}`}
                      ></i>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-widget actions-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-bolt"></i>
                Quick Actions
              </h3>
            </div>
            <div className="quick-actions">
              <button 
                className="action-btn primary"
                onClick={() => navigate("/main-menu")}
              >
                <i className="fas fa-play"></i>
                Continue Learning
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleLeaderboardClick}
              >
                <i className="fas fa-trophy"></i>
                View Leaderboard
              </button>
              <button 
                className="action-btn tertiary"
                onClick={handleProfileClick}
              >
                <i className="fas fa-user-cog"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}