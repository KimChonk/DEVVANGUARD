import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/apiClient";
import { lessonService } from "../../services/apiClient";
import "../../assets/CSS/adminscreen.css";

export default function AdminScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: "",
    language: "",
    description: ""
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    lessonTitle: "",
    lessonOrder: ""
  });

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const result = await courseService.getAllCourses();
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : []);
      } else {
        setMessage("Không thể tải khóa học");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setMessage("❌ Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lessons
  const fetchLessonsByCourse = async (courseId) => {
    try {
      setLoading(true);
      const result = await lessonService.getLessonsByCourseId(courseId);
      if (result.success && result.data) {
        setLessons(Array.isArray(result.data) ? result.data : []);
      } else {
        setMessage("Không thể tải bài học");
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setMessage("❌ Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.language) {
      setMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const result = await courseService.createCourse(
        courseForm.name,
        courseForm.language,
        courseForm.description
      );

      if (result.success) {
        setMessage("✅ Tạo khóa học thành công!");
        setCourseForm({ name: "", language: "", description: "" });
        setShowCourseForm(false);
        fetchCourses();
      } else {
        setMessage("❌ Lỗi: " + (result.message || "Không thể tạo khóa học"));
      }
    } catch (err) {
      setMessage("❌ Lỗi: " + err.message);
      console.error("Error creating course:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle lesson creation
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.courseId || !lessonForm.lessonTitle) {
      setMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const result = await lessonService.createLesson(
        parseInt(lessonForm.courseId),
        lessonForm.lessonTitle,
        parseInt(lessonForm.lessonOrder) || 1
      );

      if (result.success) {
        setMessage("✅ Tạo bài học thành công!");
        setLessonForm({ courseId: "", lessonTitle: "", lessonOrder: "" });
        setShowLessonForm(false);
        fetchLessonsByCourse(lessonForm.courseId);
      } else {
        setMessage("❌ Lỗi: " + (result.message || "Không thể tạo bài học"));
      }
    } catch (err) {
      setMessage("❌ Lỗi: " + err.message);
      console.error("Error creating lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Bạn có chắc muốn xóa khóa học này?")) {
      try {
        setLoading(true);
        const result = await courseService.deleteCourse(courseId);

        if (result.success) {
          setMessage("✅ Xóa khóa học thành công!");
          fetchCourses();
        } else {
          setMessage("❌ Lỗi: " + (result.message || "Không thể xóa khóa học"));
        }
      } catch (err) {
        setMessage("❌ Lỗi: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài học này?")) {
      try {
        setLoading(true);
        const result = await lessonService.deleteLesson(lessonId);

        if (result.success) {
          setMessage("✅ Xóa bài học thành công!");
          if (selectedCourse) {
            fetchLessonsByCourse(selectedCourse.id);
          }
        } else {
          setMessage("❌ Lỗi: " + (result.message || "Không thể xóa bài học"));
        }
      } catch (err) {
        setMessage("❌ Lỗi: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-screen">
      <div className="admin-bg"></div>

      {/* Admin Navbar */}
      <nav className="admin-nav">
        <div className="admin-nav-container">
          <div className="admin-nav-logo">
            <img src="/icons/knight_icon.png" alt="Admin" className="admin-logo-icon" />
            <span className="admin-logo-text">
              Dev<span className="admin-highlight">Vanguard</span> Admin
            </span>
          </div>

          <ul className="admin-nav-tabs">
            <li>
              <button
                className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fas fa-chart-line"></i>
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-tab ${activeTab === "courses" ? "active" : ""}`}
                onClick={() => setActiveTab("courses")}
              >
                <i className="fas fa-book"></i>
                Khóa Học
              </button>
            </li>
            <li>
              <button
                className={`nav-tab ${activeTab === "lessons" ? "active" : ""}`}
                onClick={() => setActiveTab("lessons")}
              >
                <i className="fas fa-chalkboard"></i>
                Bài Học
              </button>
            </li>
          </ul>

          <div className="admin-nav-right">
            <button
              className="logout-btn"
              onClick={() => navigate("/login")}
            >
              <i className="fas fa-sign-out-alt"></i>
              Đăng Xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="admin-main">
        {/* Message Alert */}
        {message && (
          <div className={`admin-message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
            <button onClick={() => setMessage("")} className="close-message">
              ×
            </button>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="admin-dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                <i className="fas fa-tachometer-alt"></i>
                Admin Dashboard
              </h1>
              <p className="dashboard-subtitle">Quản lý nền tảng học lập trình</p>
            </div>

            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <div className="stat-icon courses-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{courses.length}</h3>
                  <p className="stat-label">Khóa Học</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon lessons-icon">
                  <i className="fas fa-chalkboard"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{lessons.length}</h3>
                  <p className="stat-label">Bài Học</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">456</h3>
                  <p className="stat-label">Người Dùng</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon analytics-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">78.5%</h3>
                  <p className="stat-label">Tỉ Lệ Hoàn Thành</p>
                </div>
              </div>
            </div>

            <div className="quick-actions-grid">
              <button
                className="quick-action-btn add-course"
                onClick={() => {
                  setActiveTab("courses");
                  setShowCourseForm(true);
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Thêm Khóa Học</span>
              </button>

              <button
                className="quick-action-btn add-lesson"
                onClick={() => {
                  setActiveTab("lessons");
                  setShowLessonForm(true);
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Thêm Bài Học</span>
              </button>

              <button
                className="quick-action-btn view-dashboard"
                onClick={() => navigate("/admin/dashboard")}
              >
                <i className="fas fa-eye"></i>
                <span>Chi Tiết Dashboard</span>
              </button>

              <button
                className="quick-action-btn view-users"
                onClick={() => setMessage("Tính năng quản lý user sẽ sớm được thêm vào")}
              >
                <i className="fas fa-user-friends"></i>
                <span>Quản Lý User</span>
              </button>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <div className="admin-courses">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-book"></i>
                Quản Lý Khóa Học
              </h2>
              <button
                className="add-btn"
                onClick={() => setShowCourseForm(!showCourseForm)}
              >
                <i className="fas fa-plus"></i>
                {showCourseForm ? "Hủy" : "Thêm Khóa Học"}
              </button>
            </div>

            {/* Course Form */}
            {showCourseForm && (
              <div className="form-container">
                <form className="admin-form" onSubmit={handleCreateCourse}>
                  <div className="form-group">
                    <label className="form-label">Tên Khóa Học</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Python Mastery"
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngôn Ngữ Lập Trình</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Python"
                      value={courseForm.language}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          language: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mô Tả</label>
                    <textarea
                      className="form-input textarea"
                      placeholder="Mô tả chi tiết về khóa học"
                      value={courseForm.description}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="form-submit"
                    disabled={loading}
                  >
                    {loading ? "⏳ Đang tạo..." : "✨ Tạo Khóa Học"}
                  </button>
                </form>
              </div>
            )}

            {/* Courses List */}
            <div className="courses-list">
              {loading && courses.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Đang tải khóa học...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Chưa có khóa học nào</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-header">
                      <h3 className="course-name">{course.name}</h3>
                      <span className="course-language">{course.language}</span>
                    </div>
                    <p className="course-description">
                      {course.description || "Không có mô tả"}
                    </p>
                    <div className="course-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab("lessons");
                          fetchLessonsByCourse(course.id);
                        }}
                      >
                        <i className="fas fa-eye"></i>
                        Xem Bài Học
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <i className="fas fa-trash"></i>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LESSONS TAB */}
        {activeTab === "lessons" && (
          <div className="admin-lessons">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-chalkboard"></i>
                Quản Lý Bài Học
              </h2>
              <button
                className="add-btn"
                onClick={() => setShowLessonForm(!showLessonForm)}
              >
                <i className="fas fa-plus"></i>
                {showLessonForm ? "Hủy" : "Thêm Bài Học"}
              </button>
            </div>

            {/* Lesson Form */}
            {showLessonForm && (
              <div className="form-container">
                <form className="admin-form" onSubmit={handleCreateLesson}>
                  <div className="form-group">
                    <label className="form-label">Chọn Khóa Học</label>
                    <select
                      className="form-input"
                      value={lessonForm.courseId}
                      onChange={(e) => {
                        setLessonForm({
                          ...lessonForm,
                          courseId: e.target.value,
                        });
                        if (e.target.value) {
                          setSelectedCourse(
                            courses.find((c) => c.id == e.target.value)
                          );
                          fetchLessonsByCourse(e.target.value);
                        }
                      }}
                      required
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên Bài Học</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Variables and Data Types"
                      value={lessonForm.lessonTitle}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          lessonTitle: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thứ Tự Bài Học</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="VD: 1"
                      value={lessonForm.lessonOrder}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          lessonOrder: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-submit"
                    disabled={loading}
                  >
                    {loading ? "⏳ Đang tạo..." : "✨ Tạo Bài Học"}
                  </button>
                </form>
              </div>
            )}

            {/* Lessons List */}
            {selectedCourse || lessons.length > 0 ? (
              <div className="lessons-container">
                {selectedCourse && (
                  <div className="selected-course-info">
                    <h3>
                      Khóa học: <span>{selectedCourse.name}</span>
                    </h3>
                  </div>
                )}

                <div className="lessons-list">
                  {loading && lessons.length === 0 ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Đang tải bài học...</p>
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <p>Khóa học này chưa có bài học nào</p>
                    </div>
                  ) : (
                    lessons.map((lesson) => (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-card-header">
                          <span className="lesson-order">
                            Bài {lesson.lessonOrder || "?"}
                          </span>
                          <h3 className="lesson-name">{lesson.lessonTitle}</h3>
                        </div>
                        <div className="lesson-actions">
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                            Chỉnh Sửa
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <i className="fas fa-trash"></i>
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Vui lòng chọn một khóa học để xem bài học</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
