import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import { userService, lessonService, userProgressService, userProgressPracticeService, pvpProblemService } from "../../services/apiClient";
import LoadingScreen from "../../components/LoadingScreen";
import { useCourses } from "../../hooks/useCourses";
import "../../assets/CSS/profilescreen.css";
import "../../assets/CSS/mainmenu.css"; 

const courseImageMap = {
  python: "python_background.gif",  
  java: "Java_background.gif",
  javascript: "html_course.jpg",
  "c++": "C_background.gif",
  "c#": "csharp_background.gif",
  css: "C_background.gif",
  html: "html_course.jpg",
  c: "csharp_background.gif",
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

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats } = useUserStats();
  const { rankData } = useUserRank();

  const { courses, loading: coursesLoading } = useCourses(); // Lấy data cho dropdown
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);

  const [totalLessons, setTotalLessons] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() { // Đổi tên hàm
      try {
        setDataLoading(true);

        // Gọi 4 API cùng lúc: lessons, lesson progress, practice progress, problems
        const [lessonResponse, progressResponse, practiceProgressResponse, problemsResponse] = await Promise.all([
          lessonService.getAllLessons(),
          userProgressService.getMyProgress(),
          userProgressPracticeService.getMyPracticeProgress(),
          pvpProblemService.getAllProblems()
        ]);
        
        let lessons = [];
        let problems = [];
        
        // Xử lý Lesson Response (cho Donut chart VÀ map tên)
        if (lessonResponse.success && Array.isArray(lessonResponse.data)) {
          setTotalLessons(lessonResponse.data.length);
          lessons = lessonResponse.data; // Lưu lại để map
        } else {
          setTotalLessons(0);
        }

        // Xử lý Problems Response
        if (problemsResponse.success && Array.isArray(problemsResponse.data)) {
          problems = problemsResponse.data;
        }

        // Combine Lesson Activities + Practice Activities
        let allActivities = [];

        // Lesson Activities
        if (progressResponse.success && Array.isArray(progressResponse.data)) {
          const allProgress = progressResponse.data;
          const completed = allProgress.filter(p => p.status === 'completed');
          
          const lessonActivities = completed.map(progress => {
            const lesson = lessons.find(l => l.lessonId === progress.lessonId);
            return {
              id: `lesson-${progress.progressId}`,
              title: lesson ? lesson.lessonTitle : 'Unknown Lesson',
              type: 'Lesson Completion',
              xp: lesson ? lesson.xpReward : 0,
              date: new Date(progress.lastAccessed),
              timestamp: new Date(progress.lastAccessed).getTime(),
            };
          });
          
          allActivities.push(...lessonActivities);
        }

        // Practice Activities
        if (practiceProgressResponse.success && Array.isArray(practiceProgressResponse.data)) {
          const allPractice = practiceProgressResponse.data;
          const completed = allPractice.filter(p => p.status === 'completed');
          
          const practiceActivities = completed.map(progress => {
            const problem = problems.find(p => p.problemId === progress.problemId);
            return {
              id: `practice-${progress.progressId}`,
              title: problem ? problem.title : 'Unknown Problem',
              type: 'Practice Completion',
              xp: 20, // Practice always gives 20 XP
              date: new Date(progress.lastAccessed),
              timestamp: new Date(progress.lastAccessed).getTime(),
            };
          });
          
          allActivities.push(...practiceActivities);
        }

        // Sort by timestamp (newest first) and take top 3
        allActivities.sort((a, b) => b.timestamp - a.timestamp);
        const recentTop3 = allActivities.slice(0, 3);
        
        setRecentActivity(recentTop3);

      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setDataLoading(false); // Hoàn tất loading
      }
    }
    
    fetchProfileData();
  }, []); // []

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    avatarName: "default-avatar.png",
  });

  // Available avatars
  const availableAvatars = [
    "default-avatar.png",
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
    "avatar5.png",
    "avatar6.png",
  ];

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        avatarName: profile.avatarName || "default-avatar.png",
      });
    }
  }, [profile]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        avatarName: profile.avatarName || "default-avatar.png",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (avatarName) => {
    setEditFormData((prev) => ({
      ...prev,
      avatarName,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Loading changes...");

      const response = await userService.updateProfile({
        fullName: editFormData.fullName,
        avatarName: editFormData.avatarName,
      });

      if (response.success) {
        if (response.data) {
          setEditFormData({
            fullName: response.data.fullName || editFormData.fullName,
            avatarName: response.data.avatarName || editFormData.avatarName,
          });
        }
        setIsEditMode(false);
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert("Lỗi: " + response.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    setLoadingMessage("Logging out...");
    setTimeout(() => {
      navigate("/login");
      setIsLoading(false);
    }, 1000);
  };

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
  
  const handlePvPClick = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage("Loading battle arena...");
    setTimeout(() => {
      navigate("/pvp/lobby");
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  if (profileLoading || dataLoading || coursesLoading) {
    return <LoadingScreen isVisible={true} message="Loading profile..." />;
  }

  const totalLessonsCount = totalLessons > 0 ? totalLessons : 1; // Tránh chia cho 0
  const completedLessons = rankData?.total_lessons_completed || 0;
  const percentage = (completedLessons / totalLessonsCount) * 100;
  const currentAvatar = editFormData.avatarName || "default-avatar.png";
  const displayName = editFormData.fullName || "Knight Coder";

  return (
    <>
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />

      <div className="profile-page">
        {/* Header */}
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
                  <a className="dropdown-toggle">
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
              {/* === NÚT LOGOUT TỪ PROFILE HEADER CŨ === */}
              
              
            </div>
          </div>
        </nav>

        {/* === Main Content (LAYOUT MỚI) === */}
        <div className="profile-main-content">
          
          {/* ===== CỘT 1: SIDEBAR (Trái) ===== */}
          <div className="profile-sidebar">
            
            {/* Card thông tin User */}
            <div className="user-info-card">
              {/* Avatar Section */}
              <div className="avatar-section">
                <img
                  src={`/images/avatars/${currentAvatar}`}
                  alt="Profile Avatar"
                  className="profile-avatar"
                />
                <div className="profile-basic-info">
                  <h2 className="profile-name">{displayName}</h2>
                  <div className="profile-rank">
                    <span className="rank-badge">
                      {rankData?.rank_title || "Newbie"}
                    </span>
                    <span className="xp-text">{rankData?.xp || 0} XP</span>
                  </div>
                </div>
              </div>

              {/* Edit/Save Buttons */}
              <div className="profile-actions">
                <button className="btn-edit" onClick={handleEditClick}>Edit Profile</button>
                <button className="btn-edit" onClick={handleLogout}>Log out</button>
              </div>
              
              {/* Edit Mode */}
              
            </div>
            
            {/* Card thông tin Account */}
            <div className="info-card">
              <h3>Account Information</h3>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{profile?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">
                  <span className="role-badge">
                    {profile?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </span>
              </div>
            </div>


            
          </div>

          {/* ===== CỘT 2: MAIN (Phải) ===== */}
          <div className="profile-main-area">

            {/* Card Stats Grid */}
            <div className="info-card">
              {/* <h3>Statistics</h3> (Tùy chọn: thêm tiêu đề) */}
              <h3>Stats</h3>
              <div className="stats-grid">
                <div className="stat-box stat-box-icon-layout">
                    <img src="/icons/xp.png" alt="XP" className="stat-main-icon" />

                  <div className="stat-text-content">
                      <div className="stat-value">{rankData?.xp || 0}</div>
                      <div className="stat-label">Total XP</div>
                   </div>
                </div>
                <div className="stat-box stat-box-icon-layout">
                   <img src="/icons/lesson-completed.png" alt="Lessons" className="stat-main-icon" />
                   <div className="stat-text-content">
                      <div className="stat-value">{rankData?.total_lessons_completed || 0}</div>
                      <div className="stat-label">Lessons Completed</div>
                   </div>
                </div>
                <div className="stat-box stat-box-icon-layout">
                   <img src="/icons/rank.png" alt="Rank" className="stat-main-icon" />
                   <div className="stat-text-content">
                      <div className="stat-value">{rankData?.rank_title || "Newbie"}</div>
                      <div className="stat-label">Current Rank Knight</div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Card Rank Progress */}
            <div className="info-card">
              {/* Thêm container 2 cột (Donut + Stats) */}
              <div className="main-stats-container">
              
                {/* Cột 1: Donut Chart */}
                <div className="lesson-progress-chart">
                  <div 
                    className="progress-circle" 
                    style={{
                      '--percentage': `${percentage}%` 
                    }}
                  >
                    <div className="progress-circle-inner">
                      <span className="progress-solved">{rankData?.total_lessons_completed || 0}</span>
                      <span className="progress-total">/ {totalLessons}</span>
                      <div className="progress-label">Lessons Solved</div>
                    </div>
                  </div>
                  {/* Bạn có thể thêm "Attempting" ở đây nếu có data */}
                </div>

                {/* Cột 2: Stats Grid (cũ) và Badges (mới) */}
                <div className="detailed-stats-breakdown">
                  {/* Phần Badges (MỚI - mô phỏng theo LeetCode) */}
                  <div className="badges-section">
                    <h3>Badges</h3>
                    <div className="badge-item">
                      <span>0</span>
                      <div className="badge-label">Total Badges</div>
                    </div>
                    <div className="badge-locked">
                      <span>Locked Badge</span>
                      <div className="badge-label">Fantasy Coder Challenge</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="info-card">
              <h3>Recent Activity</h3>
              
              {recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {recentActivity.map(activity => (
                    <li key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-title">{activity.title}</span>
                        <span className="activity-course">{"   "+activity.type}</span>
                      </div>
                      <span className="activity-xp">+{activity.xp || 0} XP</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="activity-empty">
                  <i className="fas fa-moon"></i>
                  <span>No recent activity to show.</span>
                </div>
              )}
            </div>        
            {/* Bạn có thể thêm card "Badges" hoặc "Submissions" ở đây */}

          </div>

        </div>
        {isEditMode && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Profile</h2>
                <button className="close-modal-btn" onClick={handleCancelEdit}>&times;</button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Select Avatar</label>
                  <div className="avatar-selector">
                    {availableAvatars.map((avatar) => (
                      <div
                        key={avatar}
                        className={`avatar-option ${
                          editFormData.avatarName === avatar ? "selected" : ""
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <img
                          src={`/images/avatars/${avatar}`}
                          alt={avatar}
                          className="avatar-thumbnail"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}