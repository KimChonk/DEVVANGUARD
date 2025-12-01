import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import { lessonService, userProgressService } from "../../services/apiClient";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import LoadingScreen from "../../components/LoadingScreen";
import ProblemDescription from "../../components/ProblemDescription";
import "../../assets/CSS/coursescreen.css";

// Map course names to their image files (same as MainMenu)
const courseImageMap = {
  python: "python_background.gif",  
  java: "Java_background.gif",
  javascript: "html_course.jpg",
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
  return `/images/python_background.gif`;
};

export default function CourseScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { course, loading: courseLoading } = useCourse(courseId);
  const { profile } = useUserProfile();
  const { stats } = useUserStats();
  const { rankData } = useUserRank();
  
  // Lấy courseName từ location state (truyền từ MainMenu)
  const courseName = location.state?.courseName || course?.name;
  const heroImageUrl = getCourseImage(courseName);
  
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Trạng thái hoàn thành bài học
  const [completedLessons, setCompletedLessons] = useState({});
  
  // Spam warning
  const [showSpamWarning, setShowSpamWarning] = useState(false);
  const [spamWarningMessage, setSpamWarningMessage] = useState("");

  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: "Knight Coder",
    avatar: "/images/avatars/default-avatar.jpg",
    level: "Beginner",
    currentXP: 0,
  });

  useEffect(() => {
    if (profile) {
      setUserProfile((prev) => ({
        ...prev,
        name: profile.fullName || profile.email || prev.name,
        avatar: profile.avatarName 
          ? `/images/avatars/${profile.avatarName}` 
          : `/images/avatars/default-avatar.jpg`,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (rankData) {
      setUserProfile((prev) => ({
        ...prev,
        level: rankData.rank_title || prev.level,
        currentXP: rankData.xp || 0,
      }));
    }
  }, [rankData]);

  // Check for spam: if user submits >5 times in 1 minute for the same lesson
  const checkSpamSubmission = (lessonId) => {
    const submissionKey = `lesson_${lessonId}_submissions`;
    const now = Date.now();
    const submissions = JSON.parse(localStorage.getItem(submissionKey) || '[]');
    
    // Filter submissions from the last minute
    const recentSubmissions = submissions.filter(time => now - time < 60000);
    
    if (recentSubmissions.length >= 5) {
      setSpamWarningMessage(`⚠️ Spam detected! You have submitted ${recentSubmissions.length} times in 1 minute. Please try to complete the lesson reasonably, do not spam to gain experience!`);
      setShowSpamWarning(true);
      return true;
    }

    // Add new submission time
    recentSubmissions.push(now);
    localStorage.setItem(submissionKey, JSON.stringify(recentSubmissions));
    return false;
  };

  useEffect(() => {
    if (!courseId) return;
    const fetchLessons = async () => {
      try {
        const result = await lessonService.getLessonsByCourseId(courseId);
        if (result.success) {
          const lessonList = Array.isArray(result.data) ? result.data : [];
          setLessons(lessonList);
          
          // Lấy trạng thái hoàn thành cho từng bài
          const completed = {};
          for (const lesson of lessonList) {
            try {
              const progressResult = await userProgressService.getUserProgressByLessonId(lesson.lessonId);
              if (progressResult.success && progressResult.data) {
                completed[lesson.lessonId] = progressResult.data.status === 'completed';
              }
            } catch (err) {
            }
          }
          setCompletedLessons(completed);
        }
      } finally {
        setLessonsLoading(false);
      }
    };
    fetchLessons();
  }, [courseId]);

  if (courseLoading || !course) return <LoadingScreen isVisible={true} message="Loading course..." />;

  if (isNavigating) return <LoadingScreen isVisible={true} message="Loading..." />;

  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="course-screen-container">
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
      
      {/* Hero Section with Course Banner */}
      <div className="course-hero-section" style={{
        backgroundImage: `url('${heroImageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="course-hero-overlay"></div>
        <div className="course-hero-content">
          <div className="course-hero-info">
            <span className="course-badge">COURSE</span>
            <h1 className="course-hero-title">{course.name}</h1>
            <p className="course-hero-description">
              {course.description || "Learn programming fundamentals with this comprehensive course"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="course-background"></div>
      
      <nav className="course-navbar">
        <div className="navbar-left">
          <button 
            className="back-btn" 
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => navigate("/main-menu"), 500);
            }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
      </nav>
      
      <div className="course-main-new">
        {/* LEFT PANEL - Lessons Grid */}
        <section className="lessons-panel-new">
          <div className="lessons-header-new">
            <h2>Lessons</h2>
            <span className="lessons-count-new">{completedCount}/{lessons.length}</span>
          </div>
          
          <div className="lessons-list-container-new">
            {lessonsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading lessons...</p>
              </div>
            ) : lessons.length > 0 ? (
              <div className="lessons-list-new">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons[lesson.lessonId];
                  const isExpanded = expandedLessonId === lesson.lessonId;
                  
                  // Check if lesson is locked (first lesson is always unlocked, others need previous lesson completed)
                  const isFirstLesson = index === 0;
                  const previousLessonCompleted = index === 0 ? true : completedLessons[lessons[index - 1].lessonId];
                  const isLocked = !isFirstLesson && !previousLessonCompleted;
                  
                  return (
                    <div
                      key={lesson.lessonId}
                      className={`lesson-card-new ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                    >
                      <div
                        className="lesson-card-header-new"
                        onClick={() => !isLocked && setExpandedLessonId(isExpanded ? null : lesson.lessonId)}
                      >
                        <div className="lesson-index-new">
                          {isCompleted ? (
                            <i className="fas fa-check"></i>
                          ) : isLocked ? (
                            <i className="fas fa-lock"></i>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="lesson-info-new">
                          <h4>{lesson.lessonTitle}</h4>
                          <p className="lesson-status-text">
                            {isCompleted ? '✓ Completed' : isLocked ? 'Locked' : 'Not completed'}
                          </p>
                        </div>

                        <button 
                          className="expand-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            !isLocked && setExpandedLessonId(isExpanded ? null : lesson.lessonId);
                          }}
                          disabled={isLocked}
                        >
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </button>
                      </div>

                      {/* Expandable Description */}
                      {!isLocked && (
                        <div className={`lesson-card-expanded ${isExpanded ? 'open' : ''}`}>
                          <div className="expanded-content">
                            {lesson.problemDescription ? (
                              <div className="description-section-new">
                                <ProblemDescription description={lesson.problemDescription} />
                              </div>
                            ) : (
                              <p style={{ color: 'rgba(232, 232, 232, 0.6)' }}>No description available</p>
                            )}
                          </div>

                          <div className="expanded-actions">
                            <button
                              className="start-lesson-btn-new"
                              onClick={() => {
                                if (checkSpamSubmission(lesson.lessonId)) {
                                  return;
                                }
                                setIsLoading(true);
                                setLoadingMessage("Loading lesson...");
                                setTimeout(() => {
                                  navigate(`/lesson/${lesson.lessonId}`);
                                  setIsLoading(false);
                                }, 1000);
                              }}
                            >
                              <i className={`fas fa-${isCompleted ? 'check' : 'play'}`}></i> 
                              {isCompleted ? 'Completed' : 'Start Lesson'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lock message for locked lessons */}
                      {isLocked && (
                        <div className="lesson-locked-message">
                          <i className="fas fa-lock"></i>
                          <p>Complete the previous lesson to unlock this one</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No lessons available</p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL - User Profile Card */}
        <aside className="profile-panel-new">
          <div className="profile-card-new">
            <div className="profile-header-new">
              <img 
                src={userProfile.avatar} 
                alt="Avatar" 
                className="profile-avatar-new"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
              <div className="profile-info-new">
                <h3 className="profile-name-new">{userProfile.name}</h3>
                <p className="profile-level-new">{userProfile.level}</p>
              </div>
            </div>

            <div className="profile-stats-new">
              <div className="profile-stat">
                <span className="stat-label-new">Total XP</span>
                <span className="stat-value-new">{userProfile.currentXP}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label-new">Course Progress</span>
                <div className="progress-bar-new">
                  <div className="progress-fill-new" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="stat-value-new">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label-new">Lessons Completed</span>
                <span className="stat-value-new">{completedCount}/{lessons.length}</span>
              </div>
            </div>

            <button className="view-profile-btn-new" onClick={() => navigate("/profile")}>
              View Profile
            </button>
          </div>
        </aside>
      </div>

      {/* Spam Warning Modal */}
      {showSpamWarning && (
        <div className="spam-warning-overlay">
          <div className="spam-warning-modal">
            <div className="warning-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h2>Warning</h2>
            </div>
            <p className="warning-message">{spamWarningMessage}</p>
            <button 
              className="warning-btn-close"
              onClick={() => setShowSpamWarning(false)}
            >
              I understand!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
