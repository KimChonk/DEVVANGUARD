import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import { lessonService } from "../../services/apiClient";
import "../../assets/CSS/coursescreen.css";

export default function CourseScreen() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { course, loading: courseLoading } = useCourse(courseId);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    const fetchLessons = async () => {
      try {
        const result = await lessonService.getLessonsByCourseId(courseId);
        if (result.success) {
          const lessonList = Array.isArray(result.data) ? result.data : [];
          setLessons(lessonList);
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
        <div className="navbar-right">
          <span className="course-meta">{lessons.length} bài học</span>
        </div>
      </nav>
      
      <div className="course-main">
        {/* LEFT PANEL - Lessons List */}
        <section className="lessons-panel">
          <div className="lessons-header">
            <h2>📚 Bài Học</h2>
            <span className="lessons-count">{lessons.length} bài</span>
          </div>
          
          <div className="lessons-list-container">
            {lessonsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải bài học...</p>
              </div>
            ) : lessons.length > 0 ? (
              <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.lessonId}
                    className={`lesson-list-item ${selectedLesson?.lessonId === lesson.lessonId ? 'active' : ''}`}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="lesson-index">{index + 1}</div>
                    <div className="lesson-info">
                      <h4>{lesson.lessonTitle}</h4>
                      <p className="lesson-order">Bài #{lesson.lessonOrder}</p>
                    </div>
                    <div className="lesson-action">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                ))}
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
                <h2>🎯 {selectedLesson.lessonTitle}</h2>
                <button
                  className="start-lesson-btn"
                  onClick={() => navigate(`/lesson/${selectedLesson.lessonId}`)}
                >
                  <i className="fas fa-play"></i> Bắt Đầu
                </button>
              </div>

              <div className="preview-content">
                {selectedLesson.problemDescription ? (
                  <div className="description-section">
                    <h3>📋 Mô Tả Đề Bài</h3>
                    <div className="description-text">
                      {selectedLesson.problemDescription}
                    </div>
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
    </div>
  );
}
