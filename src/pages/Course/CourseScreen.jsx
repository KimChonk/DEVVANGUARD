import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import { lessonService, userProgressService } from "../../services/apiClient";
import LoadingScreen from "../../components/LoadingScreen";
import ProblemDescription from "../../components/ProblemDescription";
import "../../assets/CSS/coursescreen.css";

export default function CourseScreen() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { course, loading: courseLoading } = useCourse(courseId);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");
  
  // Trạng thái hoàn thành bài học
  const [completedLessons, setCompletedLessons] = useState({});
  
  // Cảnh báo spam
  const [showSpamWarning, setShowSpamWarning] = useState(false);
  const [spamWarningMessage, setSpamWarningMessage] = useState("");

  // Kiểm tra spam: nếu người dùng submit >5 lần trong 1 phút cho cùng bài
  const checkSpamSubmission = (lessonId) => {
    const submissionKey = `lesson_${lessonId}_submissions`;
    const now = Date.now();
    const submissions = JSON.parse(localStorage.getItem(submissionKey) || '[]');
    
    // Lọc những submission trong 1 phút gần nhất
    const recentSubmissions = submissions.filter(time => now - time < 60000);
    
    if (recentSubmissions.length >= 5) {
      setSpamWarningMessage(`⚠️ Phát hiện hành vi spam! Bạn đã submit ${recentSubmissions.length} lần trong 1 phút. Hãy cố gắng hoàn thành bài học hợp lý, không nên spam để lấy kinh nghiệm!`);
      setShowSpamWarning(true);
      return true;
    }
    
    // Thêm submission mới
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
              console.log(`Không thể lấy trạng thái bài ${lesson.lessonId}`);
            }
          }
          setCompletedLessons(completed);
          
          // Auto-select first lesson
          if (lessonList.length > 0) {
            setSelectedLesson(lessonList[0]);
          }
        }
      } finally {
        setLessonsLoading(false);
      }
    };
    fetchLessons();
  }, [courseId]);

  if (courseLoading || !course) return <div>Loading...</div>;

  return (
    <div className="course-screen-container">
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
      <div className="course-background"></div>
      <nav className="course-navbar">
        <div className="navbar-left">
          <button className="back-btn" onClick={() => navigate("/main-menu")}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="navbar-center">
          <h1 className="course-title">{course.name}</h1>
        </div>
      </nav>
      
      <div className="course-main">
        {/* LEFT PANEL - Lessons List */}
        <section className="lessons-panel">
          <div className="lessons-header">
            <h2>📚 Bài Học</h2>
          </div>
          
          <div className="lessons-list-container">
            {lessonsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải bài học...</p>
              </div>
            ) : lessons.length > 0 ? (
              <div className="lessons-list">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons[lesson.lessonId];
                  return (
                    <div
                      key={lesson.lessonId}
                      className={`lesson-list-item ${selectedLesson?.lessonId === lesson.lessonId ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className={`lesson-index ${isCompleted ? 'completed-badge' : ''}`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="lesson-info">
                        <h4>{lesson.lessonTitle}</h4>
                        <p className="lesson-order">{isCompleted ? '✅ Đã hoàn thành' : 'Chưa hoàn thành'}</p>
                      </div>
                      <div className="lesson-action">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Chưa có bài học</p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL - Lesson Preview/Info */}
        <section className="preview-panel">
          {selectedLesson ? (
            <div className="lesson-preview">
              <div className="preview-header">
                <div className="preview-title-status">
                  <h2>🎯 {selectedLesson.lessonTitle}</h2>
                  {completedLessons[selectedLesson.lessonId] && (
                    <span className="completed-badge">✅ Đã hoàn thành</span>
                  )}
                </div>
                <button
                  className="start-lesson-btn"
                  onClick={() => {
                    if (checkSpamSubmission(selectedLesson.lessonId)) {
                      return;
                    }
                    setIsLoading(true);
                    setLoadingMessage("Đang tải bài học...");
                    setTimeout(() => {
                      navigate(`/lesson/${selectedLesson.lessonId}`);
                      setIsLoading(false);
                    }, 1000);
                  }}
                >
                  <i className={`fas fa-${completedLessons[selectedLesson.lessonId] ? 'check' : 'play'}`}></i> 
                  {completedLessons[selectedLesson.lessonId] ? 'Đã hoàn thành' : 'Bắt Đầu'}
                </button>
              </div>

              <div className="preview-content">
                {selectedLesson.problemDescription ? (
                  <div className="description-section">
                    <h3>📋 Mô Tả Đề Bài</h3>
                    <ProblemDescription description={selectedLesson.problemDescription} />
                  </div>
                ) : (
                  <p style={{ color: 'rgba(232, 232, 232, 0.6)' }}>Không có mô tả</p>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <i className="fas fa-hand-point-left"></i>
              <p>Chọn một bài học để xem chi tiết</p>
            </div>
          )}
        </section>
      </div>

      {/* Spam Warning Modal */}
      {showSpamWarning && (
        <div className="spam-warning-overlay">
          <div className="spam-warning-modal">
            <div className="warning-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h2>⚠️ Cảnh báo</h2>
            </div>
            <p className="warning-message">{spamWarningMessage}</p>
            <button 
              className="warning-btn-close"
              onClick={() => setShowSpamWarning(false)}
            >
              Tôi hiểu rồi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
