import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import { authService } from "../../services/supabaseClient";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/mainmenu.css";

// Map course names to their image files
const courseImageMap = {
  python: "python_course.jpg",
  java: "java_course.png",
  javascript: "html_course.jpg",
  "c++": "csharp_course.png",
  "c#": "csharp_course.png",
  css: "css_course.jpg",
  html: "html_course.jpg",
  c: "c_course.png",
};

const getCourseImage = (courseName) => {
  const name = courseName?.toLowerCase() || "";
  for (const [key, image] of Object.entries(courseImageMap)) {
    if (name.includes(key)) {
      return `/images/${image}`;
    }
  }
  return `/images/python_course.jpg`;
};

export default function MainMenu() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useCourses();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const { rankData, loading: rankLoading } = useUserRank();

  const [user, setUser] = useState({
    name: "Knight Coder",
    avatar: "/images/avatars/default-avatar.jpg",
    level: "Beginner",
    currentXP: 850,
    nextLevelXP: 1000,
    totalLessonsCompleted: 0,
  });

  const [selectedFilter, setSelectedFilter] = useState("all");

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

  useEffect(() => {
    if (stats) {
      setUser((prev) => ({
        ...prev,
        currentXP: parseInt(stats.xp) || 0,
        nextLevelXP: 1000,
      }));
    }
  }, [stats]);

  useEffect(() => {
    if (rankData) {
      setUser((prev) => ({
        ...prev,
        level: rankData.rank_title || prev.level,
        currentXP: rankData.xp || 0,
        totalLessonsCompleted: rankData.total_lessons_completed || 0,
      }));
    }
  }, [rankData]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const handleCourseClick = useCallback(
    (courseId) => {
      setIsLoading(true);
      setLoadingMessage("Loading course...");
      setTimeout(() => {
        navigate(`/course/${courseId}`);
        setIsLoading(false);
      }, 1000);
    },
    [navigate]
  );

  const handleAvatarClick = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage("Loading profile...");
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

  const xpPercentage = useMemo(() => {
    return (user.currentXP / user.nextLevelXP) * 100;
  }, [user.currentXP, user.nextLevelXP]);

  const filteredCourses = useMemo(() => {
    if (selectedFilter === "all") return courses;
    return courses?.filter((course) =>
      course.language?.toLowerCase().includes(selectedFilter.toLowerCase())
    ) || [];
  }, [courses, selectedFilter]);

  const categories = useMemo(() => {
    const cats = new Set(courses?.map((c) => c.language) || []);
    return ["All Courses", ...Array.from(cats)].filter(Boolean);
  }, [courses]);

  return (
    <div className="main-menu-container">
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />

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
                <a onClick={() => navigate("/leaderboards")}>Leaderboards</a>
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
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content-wrapper">
        {/* User Profile Card - Left Side */}
        <div className="user-profile-card">
          <div className="profile-header">
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="profile-avatar"
              onError={(e) => {
                e.target.src = "/icons/knight_icon.png";
              }}
            />
            <div className="profile-info">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-level">{user.level}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <img src="/icons/xp-icon.png" alt="XP" className="stat-icon-img" />
              <div className="stat-content">
                <span className="stat-value">{user.currentXP}</span>
                <span className="stat-label">Total XP</span>
              </div>
            </div>

            <div className="stat-item">
              <img src="/icons/level-icon.png" alt="Level" className="stat-icon-img" />
              <div className="stat-content">
                <span className="stat-value">{user.level}</span>
                <span className="stat-label">Level</span>
              </div>
            </div>

            <div className="stat-item">
              <img src="/icons/streak.png" alt="Lessons" className="stat-icon-img" />
              <div className="stat-content">
                <span className="stat-value">{user.totalLessonsCompleted}</span>
                <span className="stat-label">Lessons completed</span>
              </div>
            </div>
          </div>

          <button className="view-profile-btn" onClick={handleAvatarClick}>
            View profile
          </button>
        </div>

        {/* Courses Section - Right Side */}
        <div className="courses-section-wrapper">
          <div className="courses-header-section">
            <h1 className="courses-main-title">
              <i className="fas fa-book"></i> All Courses
            </h1>
            
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedFilter === category.toLowerCase() || (selectedFilter === "all" && category === "All Courses") ? "active" : ""}`}
                  onClick={() => setSelectedFilter(category === "All Courses" ? "all" : category.toLowerCase())}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="courses-grid">
            {coursesLoading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <p>Loading Courses...</p>
              </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.courseId || course.id}
                  className="course-card-new"
                  onClick={() => handleCourseClick(course.courseId || course.id)}
                >
                  <div className="course-image-container">
                    <img
                      src={getCourseImage(course.name || course.title)}
                      alt={course.name || course.title}
                      className="course-image"
                      onError={(e) => {
                        e.target.src = "/images/python_course.jpg";
                      }}
                    />
                    <span className="course-badge">NEW!</span>
                  </div>

                  <div className="course-info">
                    <span className="course-label">COURSE</span>
                    <h3 className="course-title-new">{course.name || course.title}</h3>
                    <p className="course-desc">
                      {course.description || "Learn this amazing course"}
                    </p>
                    
                    <div className="course-footer">
                      <span className="course-level-badge">
                        <i className="fas fa-bar-chart"></i> {course.language || "General"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <p>No courses available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}