import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import { authService } from "../../services/supabaseClient";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/mainmenu.css";


export default function MainMenu() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useCourses();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const { rankData, loading: rankLoading } = useUserRank();

  const [user, setUser] = useState({
    name: "Knight Coder",
    avatar: "/images/avatars/default-avatar.jpg",
    level: "Code Knight",
    currentXP: 850,
    nextLevelXP: 1000,
    dailyStreak: 7,
  });

  // Update user info từ API
  useEffect(() => {
    if (profile) {
      setUser((prev) => ({
        ...prev,
        name: profile.fullName || profile.email || prev.name,
        avatar: profile.avatarName 
          ? `/images/avatars/${profile.avatarName}` 
          : `/images/avatars/default-avatar.jpg`,
      }));
    }
  }, [profile]);

  // Update XP từ stats
  useEffect(() => {
    if (stats) {
      setUser((prev) => ({
        ...prev,
        currentXP: parseInt(stats.xp) || 0,
        nextLevelXP: 1000,
      }));
    }
  }, [stats]);

  // Update rank từ rankData (Supabase view)
  useEffect(() => {
    if (rankData) {
      setUser((prev) => ({
        ...prev,
        level: rankData.rank_title || prev.level,
        currentXP: rankData.xp || 0,
      }));
    }
  }, [rankData]);

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
    "Code is poetry written in logic. Make yours beautiful.",
  ];

  const [dailyAdvice] = useState(() => {
    return dailyAdvices[Math.floor(Math.random() * dailyAdvices.length)];
  });

  const [isLearnMenuOpen, setLearnMenuOpen] = useState(false);
  const [isPracticeMenuOpen, setPracticeMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");
  
  const toggleLearnMenu = () => {
    setLearnMenuOpen((prevState) => !prevState);
  }; 

  const handleCourseClick = useCallback(
    (courseId) => {
      setIsLoading(true);
      setLoadingMessage("Đang tải khóa học...");
      setTimeout(() => {
        navigate(`/course/${courseId}`);
        setIsLoading(false);
      }, 1000);
      setMobileMenuOpen(false);
    },
    [navigate]
  );

  // OPTIMIZATION: Wrapped in useCallback
  const handleAvatarClick = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage("Đang tải hồ sơ...");
    setTimeout(() => {
      navigate("/profile");
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    const result = await authService.signOut();
    if (result.success) {
      navigate("/login");
    }
  }, [navigate]);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("main");

  // OPTIMIZATION: Wrapped in useCallback
  const showQuestsView = useCallback(() => {
    setMobileMenuView("quests");
  }, []);

  // OPTIMIZATION: Wrapped in useCallback
  const showMainView = useCallback(() => {
    setMobileMenuView("main");
  }, []);

  // OPTIMIZATION: Wrapped in useCallback
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prevState) => !prevState);
  }, []);
  
  // OPTIMIZATION: Wrapped in useCallback
  const handleMobileNav = useCallback(
    (path) => {
      navigate(path);
      setMobileMenuOpen(false); // Đóng menu mobile
    },
    [navigate]
  );

  const getLevelIcon = useCallback((level) => {
    switch (level) {
      case "Beginner":
        return <i className="fas fa-star"></i>;
      case "Intermediate":
        return (
          <>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
          </>
        );
      case "Advanced":
        return (
          <>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
          </>
        );
      default:
        return <i className="fas fa-star"></i>;
    }
  }, []);

  const xpPercentage = useMemo(() => {
    return (user.currentXP / user.nextLevelXP) * 100;
  }, [user.currentXP, user.nextLevelXP]);

  return (
    <div className="main-menu-container">
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
      <div className="main-menu-background"></div>

      {/* Navigation */}
      <nav className="main-navbar">
        <div className="main-nav-container">
          <div className="main-nav-left">
            <a className="logo-link" onClick={() => navigate("/main-menu")}>
                <div className="main-nav-logo">
                <img
                    src="/icons/knight_icon.png"
                    alt="Knight Icon"
                    className="main-logo-icon"
                />
                <span className="main-logo-text">
                    Dev <span className="main-highlight">Vanguard</span>
                </span>
                </div>
            </a>

            <ul className="main-nav-links">
              <li>
                <a onClick={() => navigate("/dashboard")}>Dashboard</a>
              </li>
              <li>
                <a onClick={() => navigate("/leaderboards")} className="nav-button">Leaderboards</a>
              </li>
            </ul>
          </div>
          <div className="main-nav-right">
            <button className="avatar-btn" onClick={handleAvatarClick}>
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="user-avatar"
              onError={(e) => {
                e.target.src = "/icons/knight_icon.png";
              }}
            />
          </button>
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
                <span>
                  {user.currentXP}/{user.nextLevelXP} XP
                </span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Lessons Completed Card */}
          <div className="stats-card">
            <h3 className="stats-title">
              <i className="fas fa-book"></i> Total Lessons
            </h3>
            <div className="lessons-display">
              <span className="lessons-number">{rankData?.total_lessons_completed || 0}</span>
              <span className="lessons-label">Completed</span>
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
              Your coding adventure continues! Choose a quest to advance your
              skills and grow stronger as a Code Knight.
            </p>
          </section>

          {/* Courses Section */}
          <section className="courses-section">
            <div className="courses-header">
              <h2 className="courses-title">Available Quests</h2>
            </div>

            <div className="courses-grid">
              {coursesLoading ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                  <p>Đang tải các khóa học...</p>
                </div>
              ) : courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.courseId || course.id}
                    className="course-card"
                    onClick={() => handleCourseClick(course.courseId || course.id)}
                  >
                    <h3 className="course-title">{course.name || course.title}</h3>
                    <p className="course-description">
                      {course.description || "Bài học chuyên biệt"}
                    </p>

                    <div className="course-meta">
                      <div className="course-level">
                        <i className="fas fa-star"></i>
                        <span>{course.language || "General"}</span>
                      </div>
                      <div className="course-lessons">
                        {Array.isArray(course.lessons) ? course.lessons.length : "0"} Lessons
                      </div>
                    </div>

                    <div className="course-action">
                      <button className="start-course-btn">
                        <i className="fas fa-play"></i> Start Quest
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                  <p>Chưa có khóa học nào. Hãy quay lại sau!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}