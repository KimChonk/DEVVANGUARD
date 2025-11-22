import { useEffect, useState } from "react";
import { lessonService } from "../services/apiClient";

export const useLessonById = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await lessonService.getLessonById(lessonId);

        if (result.success) {
          setLesson(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
};

export const useLessonsByCourse = (courseId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await lessonService.getLessonsByCourseId(courseId);

        if (result.success) {
          setLessons(Array.isArray(result.data) ? result.data : []);
        } else {
          setError(result.message);
          setLessons([]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch lessons");
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  return { lessons, loading, error };
};
