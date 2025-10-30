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

  useEffect(() => {
    if (!courseId) return;
    const fetchLessons = async () => {
      try {
        const result = await lessonService.getLessonsByCourseId(courseId);
        if (result.success) {
          setLessons(Array.isArray(result.data) ? result.data : []);
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
        <button className="back-btn" onClick={() => navigate("/main-menu")}>Back</button>
        <h1>{course.name}</h1>
      </nav>
      <div className="course-content">
        <h1>{course.name}</h1>
        <div className="lessons-grid">
          {lessonsLoading ? <p>Loading lessons...</p> : lessons.length > 0 ? lessons.map((l, i) => (
            <div key={l.lessonId} className="lesson-card" onClick={() => navigate(`/lesson/${l.lessonId}`)}>
              <h3>{i + 1}. {l.lessonTitle}</h3>
            </div>
          )) : <p>No lessons</p>}
        </div>
      </div>
    </div>
  );
}
