import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import { authService } from "../../services/supabaseClient";
import LoadingScreen from "../../components/LoadingScreen";
import InteractiveGreeting from "../../components/InteractiveGreeting";
import "../../assets/CSS/mainmenu.css";

// Map course names to their image files
const courseImageMap = {
  python: "python_background.gif",  
  java: "Java_background.gif",
  "c++": "Cpp_background.gif",
  c: "C_background.gif",
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

// Random greeting messages
const greetings = [
  "What's up? Hakuna matata, good vibes only!",
  "Welcome back, young coder! Let's make some magic!",
  "Ayo! Ready to level up your skills?",
  "Great to see you! Time to code like a warrior!",
  "Let's go! The realm of code awaits!",
  "Hey there! Ready to conquer new challenges?",
  "Welcome, adventurer! Your coding quest begins here!",
  "Lights, camera, action! Let's code something awesome!",
  "Greetings, noble knight! Time for some legendary coding!",
  "Ready to unlock new powers? Let's start learning!"
];

const getRandomGreeting = () => {
  return greetings[Math.floor(Math.random() * greetings.length)];
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
  const [compniGreeting, setCompniGreeting] = useState(getRandomGreeting());
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

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
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState(""); // "success", "error", ""

  const handleCourseClick = useCallback(
    (courseId, courseName) => {
      setIsLoading(true);
      setLoadingMessage("Loading course...");
      setTimeout(() => {
        navigate(`/course/${courseId}`, { state: { courseName } });
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

  const handlePvPClick = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage("Loading battle arena...");
    setTimeout(() => {
      navigate("/pvp/lobby");
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    const result = await authService.signOut();
    if (result.success) {
      navigate("/login");
    }
  }, [navigate]);

  const handleInviteFriend = useCallback(async () => {
    if (!inviteEmail || !inviteEmail.trim()) {
      setInviteStatus("error");
      setInviteMessage("Please enter a valid email address");
      setTimeout(() => setInviteStatus(""), 5000);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteStatus("error");
      setInviteMessage("Please enter a valid email address");
      setTimeout(() => setInviteStatus(""), 5000);
      return;
    }

    try {
      const result = await authService.inviteUser(inviteEmail);
      if (result.success) {
        setInviteStatus("success");
        setInviteMessage(`✓ Invitation sent to ${inviteEmail}!`);
        setInviteEmail("");
        setTimeout(() => setInviteStatus(""), 5000);
      } else {
        setInviteStatus("error");
        setInviteMessage(result.message || "Failed to send invitation");
        setTimeout(() => setInviteStatus(""), 5000);
      }
    } catch (error) {
      setInviteStatus("error");
      setInviteMessage("An error occurred while sending the invitation");
      setTimeout(() => setInviteStatus(""), 5000);
    }
  }, [inviteEmail]);

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
              <li 
                className="nav-dropdown"
                onMouseEnter={() => setShowLearnDropdown(true)}
              >
                <a 
                  className="dropdown-toggle"
                >
                  Learn <i className="fas fa-chevron-down"></i>
                </a>
                {showLearnDropdown && (
                  <div 
                    className="dropdown-menu learn-dropdown"
                    onMouseLeave={() => setShowLearnDropdown(false)}
                  >
                    <div className="dropdown-content">
                      <div className="dropdown-left">
                        <h4 className="dropdown-title">Recommended</h4>
                        <div className="recommended-courses">
                          {courses && courses.length > 0 && courses.slice(0, 2).map((course) => (
                            <div 
                              key={course.courseId} 
                              className="recommended-item"
                              onClick={() => {
                                handleCourseClick(course.courseId, course.name);
                                setShowLearnDropdown(false);
                              }}
                            >
                              <img 
                                src={`/images/${getCourseImage(course.name).split('/').pop()}`}
                                alt={course.name}
                                className="recommended-thumb"
                                onError={(e) => e.target.style.display = "none"}
                              />
                              <div className="recommended-info">
                                <span className="recommended-name">{course.name}</span>
                                <span className="recommended-lang">{course.language}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="dropdown-right">
                        <h4 className="dropdown-title">All Courses</h4>
                        <div className="courses-list">
                          {courses && courses.length > 0 && courses.map((course) => (
                            <a 
                              key={course.courseId}
                              className="course-list-item"
                              onClick={() => {
                                handleCourseClick(course.courseId, course.name);
                                setShowLearnDropdown(false);
                              }}
                            >
                              <span className="course-list-name">{course.name}</span>
                              <span className="course-list-lang">{course.language}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
              <li>
                <a onClick={() => navigate("/leaderboards")}>
                  Leaderboards
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/practice")}>
                  Practice
                </a>
              </li>
              <li>
                <a onClick={() => handlePvPClick()}>
                  Battle PvP
                </a>
              </li>
            </ul>
          </div>
          <div className="main-nav-right">
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content-wrapper">
        {/* Interactive Greeting Section */}
        <InteractiveGreeting />

        {/* User Profile Card - Right Side */}
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
                  onClick={() => handleCourseClick(course.courseId || course.id, course.name || course.title)}
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

        {/* ...existing code... */}
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">Dev Vanguard</h4>
            <p className="footer-desc">Learn to code. Build amazing projects. Become a legend.</p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a onClick={() => navigate("/main-menu")}>Home</a></li>
              <li><a onClick={() => navigate("/leaderboards")}>Leaderboards</a></li>
              <li><a onClick={() => alert("Coming soon!")}>About</a></li>
              <li><a onClick={() => alert("Coming soon!")}>Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-discord"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a onClick={() => alert("Coming soon!")}>Help Center</a></li>
              <li><a onClick={() => alert("Coming soon!")}>FAQ</a></li>
              <li><a onClick={() => alert("Coming soon!")}>Privacy Policy</a></li>
              <li><a onClick={() => alert("Coming soon!")}>Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Dev Vanguard. All rights reserved.</p>
          <div className="footer-legal">
            <a onClick={() => alert("Coming soon!")}>Privacy</a>
            <span className="separator">•</span>
            <a onClick={() => alert("Coming soon!")}>Terms</a>
            <span className="separator">•</span>
            <a onClick={() => alert("Coming soon!")}>Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}