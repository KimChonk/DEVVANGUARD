import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, courseService, lessonService } from "../../services/apiClient";
import { authService } from "../../services/supabaseClient";
import "../../assets/CSS/admindashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Admin info
  const [admin] = useState({
    name: "Admin Knight",
    avatar: "/icons/knight_icon.png",
    role: "System Administrator"
  });

  // Real data states
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: "",
    language: "",
    description: ""
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    lessonTitle: "",
    lessonOrder: "",
    problemDescription: "",
    solutionTemplate: "",
    testCases: ""
  });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto hide message after 2 seconds with animation
  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => {
          setMessage("");
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResult = await courseService.getAllCourses();
      if (coursesResult.success && Array.isArray(coursesResult.data)) {
        setCourses(coursesResult.data);
        setTotalCourses(coursesResult.data.length);
      }

      // Fetch users
      const usersResult = await userService.getAllUsers();
      if (usersResult.success && Array.isArray(usersResult.data)) {
        const regularUsers = usersResult.data.filter(u => u.role === 'user' || (u.role && u.role !== 'admin'));
        setUsers(usersResult.data);
        setTotalUsers(regularUsers.length);
      }

      // Fetch lessons
      const lessonsResult = await lessonService.getAllLessons();
      if (lessonsResult.success && Array.isArray(lessonsResult.data)) {
        setLessons(lessonsResult.data);
        setTotalLessons(lessonsResult.data.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.language) {
      setMessage("Please fill in all required fields");
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
        fetchAllData();
      } else {
        setMessage("Error: " + (result.message || "Unable to create course"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle lesson creation
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.courseId || !lessonForm.lessonTitle) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const result = await lessonService.createLesson(
        lessonForm.courseId,
        lessonForm.lessonTitle,
        parseInt(lessonForm.lessonOrder) || 1,
        lessonForm.problemDescription || null,
        lessonForm.solutionTemplate || null,
        lessonForm.testCases || null
      );

      if (result.success) {
        setMessage(" Lesson created successfully!");
        setLessonForm({ courseId: "", lessonTitle: "", lessonOrder: "", problemDescription: "", solutionTemplate: "", testCases: "" });
        setShowLessonForm(false);
        fetchAllData();
      } else {
        setMessage("Error: " + (result.message || "Unable to create lesson"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setLoading(true);
        const result = await courseService.deleteCourse(courseId);

        if (result.success) {
          setMessage("Course deleted successfully!");
          fetchAllData();
        } else {
          setMessage("Error: " + (result.message || "Unable to delete course"));
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle lesson deletion
  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        setLoading(true);
        const result = await lessonService.deleteLesson(lessonId);

        if (result.success) {
          setMessage("Lesson deleted successfully!");
          fetchAllData();
        } else {
          setMessage("Error: " + (result.message || "Unable to delete lesson"));
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        navigate("/");
      } else {
        setMessage("Error logging out: " + result.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setMessage("Error logging out: " + err.message);
    }
  };

  // Weekly statistics
  const [weeklyStats] = useState({
    totalLessons: 156,
    completedLessons: 1234,
    activeStudents: 89,
    newStudents: 23,
    totalStudents: 456,
    averageCompletion: 78.5,
    totalHours: 2340
  });

  // Course statistics
  const [courseStats] = useState([
    {
      id: 1,
      name: "Python Mastery",
      totalLessons: 24,
      studentsEnrolled: 125,
      completionRate: 85.2,
      averageTime: 45,
      status: "active"
    },
    {
      id: 2,
      name: "HTML & CSS Foundations",
      totalLessons: 18,
      studentsEnrolled: 98,
      completionRate: 92.1,
      averageTime: 32,
      status: "active"
    },
    {
      id: 3,
      name: "JavaScript Adventures",
      totalLessons: 32,
      studentsEnrolled: 76,
      completionRate: 67.8,
      averageTime: 58,
      status: "active"
    },
    {
      id: 4,
      name: "React Kingdom",
      totalLessons: 28,
      studentsEnrolled: 54,
      completionRate: 71.3,
      averageTime: 65,
      status: "active"
    },
    {
      id: 5,
      name: "Database Dungeons",
      totalLessons: 20,
      studentsEnrolled: 43,
      completionRate: 79.4,
      averageTime: 42,
      status: "active"
    },
    {
      id: 6,
      name: "Algorithm Arena",
      totalLessons: 25,
      studentsEnrolled: 37,
      completionRate: 64.1,
      averageTime: 72,
      status: "active"
    }
  ]);

  // Weekly activity data
  const [weeklyActivity] = useState([
    { day: "Mon", students: 67, lessons: 145, hours: 298 },
    { day: "Tue", students: 73, lessons: 162, hours: 334 },
    { day: "Wed", students: 81, lessons: 189, hours: 387 },
    { day: "Thu", students: 69, lessons: 156, hours: 312 },
    { day: "Fri", students: 89, lessons: 203, hours: 425 },
    { day: "Sat", students: 45, lessons: 98, hours: 189 },
    { day: "Sun", students: 52, lessons: 112, hours: 234 }
  ]);

  // Recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: "user_registration",
      message: "New user registered: CodeKnight92",
      timestamp: "5 minutes ago",
      status: "info"
    },
    {
      id: 2,
      type: "lesson_completion",
      message: "High completion rate detected in Python Mastery",
      timestamp: "12 minutes ago",
      status: "success"
    },
    {
      id: 3,
      type: "system_alert",
      message: "Server response time increased by 15%",
      timestamp: "25 minutes ago",
      status: "warning"
    },
    {
      id: 4,
      type: "course_update",
      message: "JavaScript Adventures course updated with 3 new lessons",
      timestamp: "1 hour ago",
      status: "info"
    },
    {
      id: 5,
      type: "achievement",
      message: "Platform reached 500+ registered users milestone",
      timestamp: "2 hours ago",
      status: "success"
    }
  ]);

  // System metrics
  const [systemMetrics] = useState({
    serverUptime: "99.8%",
    responseTime: "145ms",
    activeConnections: 234,
    dataUsage: "2.3GB",
    errorRate: "0.2%"
  });

  // Quick stats for dashboard cards
  const quickStats = useMemo(() => [
    {
      title: "KHÓA HỌC",
      value: totalCourses,
      change: "+1 this month",
      icon: "fas fa-book",
      color: "blue",
      trend: "up"
    },
    {
      title: "BÀI HỌC",
      value: totalLessons,
      change: "+3 this week",
      icon: "fas fa-graduation-cap",
      color: "green",
      trend: "up"
    },
    {
      title: "NGƯỜI DÙNG",
      value: totalUsers,
      change: `+${Math.max(0, totalUsers - 1)} active`,
      icon: "fas fa-users",
      color: "purple",
      trend: "up"
    },
    {
      title: "TỈ LỆ HOÀN THÀNH",
      value: `${weeklyStats.averageCompletion}%`,
      change: "+5.2% from last week",
      icon: "fas fa-trophy",
      color: "gold",
      trend: "up"
    }
  ], [totalCourses, totalLessons, totalUsers, weeklyStats]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_registration":
        return "fas fa-user-plus";
      case "lesson_completion":
        return "fas fa-graduation-cap";
      case "system_alert":
        return "fas fa-exclamation-triangle";
      case "course_update":
        return "fas fa-edit";
      case "achievement":
        return "fas fa-medal";
      default:
        return "fas fa-info-circle";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "#10b981";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#3b82f6";
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-background"></div>

      {/* Admin Navigation */}
      <nav className="admin-navbar">
        <div className="admin-nav-container">
          <div className="admin-nav-left">
            <div className="admin-logo">
              <img
                src="/icons/knight_icon.png"
                alt="Admin Icon"
                className="admin-logo-icon"
              />
              <span className="admin-logo-text">
                Dev<span className="highlight">Vanguard</span> Admin
              </span>
            </div>
            
            <ul className="admin-nav-links">
              <li><a href="#" className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</a></li>
              <li><a href="#" className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>Khóa Học</a></li>
              <li><a href="#" className={activeTab === "lessons" ? "active" : ""} onClick={() => setActiveTab("lessons")}>Bài Học</a></li>
              <li><a href="#" className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Người Dùng</a></li>
            </ul>
          </div>
          
          <div className="admin-nav-right">
            <div className="admin-profile">
              <img 
                src={admin.avatar} 
                alt="Admin Avatar" 
                className="admin-avatar"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
              <div className="admin-info">
                <span className="admin-name">{admin.name}</span>
                <span className="admin-role">{admin.role}</span>
              </div>
            </div>
            <button 
              className="back-to-site-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard Content */}
      <div className="admin-content">
        {/* Message Display */}
        {message && (
          <div className={`admin-message ${!showMessage ? 'disappear' : ''} ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
            <button type="button" onClick={() => setMessage("")} className="close-btn">×</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Header */}
            <div className="admin-header">
              <div className="admin-welcome">
                <h1 className="admin-title">
                  <i className="fas fa-tachometer-alt"></i>
                  Admin Dashboard
                </h1>
                <p className="admin-subtitle">
                  Monitor and manage your DevVanguard learning platform
                </p>
              </div>
              
              <div className="admin-date-time">
                <div className="current-time">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="current-date">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className={`admin-stat-card ${stat.color}`}>
                  <div className="stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                    <div className={`stat-change ${stat.trend}`}>
                      <i className={`fas fa-arrow-${stat.trend === 'up' ? 'up' : 'down'}`}></i>
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="admin-grid">
              {/* Weekly Activity Chart */}
              <div className="admin-widget chart-widget">
                <div className="widget-header">
                  <h3 className="widget-title">
                    <i className="fas fa-chart-line"></i>
                    Weekly Activity Overview
                  </h3>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color students"></div>
                      <span>Students</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color lessons"></div>
                      <span>Lessons</span>
                    </div>
                  </div>
                </div>
                <div className="activity-chart">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="chart-day">
                      <div className="chart-bars">
                        <div 
                          className="bar students-bar" 
                          style={{ height: `${(day.students / 100) * 100}%` }}
                          title={`${day.students} students`}
                        ></div>
                        <div 
                          className="bar lessons-bar" 
                          style={{ height: `${(day.lessons / 250) * 100}%` }}
                          title={`${day.lessons} lessons`}
                        ></div>
                      </div>
                      <span className="day-label">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Statistics */}
          <div className="admin-widget courses-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-graduation-cap"></i>
                Course Statistics
              </h3>
            </div>
            <div className="courses-table">
              <div className="table-header">
                <div className="col-course">Course</div>
                <div className="col-lessons">Lessons</div>
                <div className="col-students">Students</div>
                <div className="col-completion">Completion</div>
              </div>
              <div className="table-body">
                {courseStats.map((course) => (
                  <div key={course.id} className="table-row">
                    <div className="col-course">
                      <div className="course-info">
                        <span className="course-name">{course.name}</span>
                        <span className={`course-status ${course.status}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <div className="col-lessons">{course.totalLessons}</div>
                    <div className="col-students">{course.studentsEnrolled}</div>
                    <div className="col-completion">
                      <div className="completion-bar">
                        <div 
                          className="completion-fill"
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="completion-text">{course.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="admin-widget activities-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-bell"></i>
                Recent Activities
              </h3>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ backgroundColor: getStatusColor(activity.status) }}
                  >
                    <i className={getActivityIcon(activity.type)}></i>
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="admin-widget metrics-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <i className="fas fa-server"></i>
                System Metrics
              </h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Server Uptime</div>
                <div className="metric-value success">{systemMetrics.serverUptime}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Response Time</div>
                <div className="metric-value good">{systemMetrics.responseTime}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Active Connections</div>
                <div className="metric-value info">{systemMetrics.activeConnections}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Data Usage</div>
                <div className="metric-value info">{systemMetrics.dataUsage}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Error Rate</div>
                <div className="metric-value success">{systemMetrics.errorRate}</div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="admin-tab-content">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-book"></i>
                Quản Lý Khóa Học
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => setShowCourseForm(!showCourseForm)}
              >
                <i className="fas fa-plus"></i>
                {showCourseForm ? "Hủy" : "Thêm Khóa Học"}
              </button>
            </div>

            {/* Course Form */}
            {showCourseForm && (
              <div className="admin-form-container">
                <form className="admin-form-grid" onSubmit={handleCreateCourse}>
                  <div className="admin-form-group">
                    <label className="admin-label">Tên Khóa Học</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="VD: Python Mastery"
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ngôn Ngữ Lập Trình</label>
                    <input
                      type="text"
                      className="admin-input"
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

                  <div className="admin-form-group">
                    <label className="admin-label">Mô Tả</label>
                    <textarea
                      className="admin-input textarea"
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
                    className="admin-submit"
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
                    <div className="course-actions">
                      <button
                        type="button"
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

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="admin-tab-content">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-chalkboard"></i>
                Quản Lý Bài Học
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => setShowLessonForm(!showLessonForm)}
              >
                <i className="fas fa-plus"></i>
                {showLessonForm ? "Hủy" : "Thêm Bài Học"}
              </button>
            </div>

            {/* Lesson Form */}
            {showLessonForm && (
              <div className="admin-form-container">
                <form className="admin-form-grid" onSubmit={handleCreateLesson}>
                  <div className="admin-form-group">
                    <label className="admin-label">Chọn Khóa Học</label>
                    <select
                      className="admin-input"
                      value={lessonForm.courseId}
                      onChange={(e) => {
                        setLessonForm({
                          ...lessonForm,
                          courseId: e.target.value,
                        });
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

                  <div className="admin-form-group">
                    <label className="admin-label">Tên Bài Học</label>
                    <input
                      type="text"
                      className="admin-input"
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

                  <div className="admin-form-group">
                    <label className="admin-label">Thứ Tự Bài Học</label>
                    <input
                      type="number"
                      className="admin-input"
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

                  <div className="admin-form-group">
                    <label className="admin-label">Mô Tả Đề Bài (HTML/Markdown)</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder="Mô tả chi tiết đề bài..."
                      value={lessonForm.problemDescription}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          problemDescription: e.target.value,
                        })
                      }
                      rows="4"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Mã Mẫu / Starter Code</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder="Nhập code mẫu cho học viên..."
                      value={lessonForm.solutionTemplate}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          solutionTemplate: e.target.value,
                        })
                      }
                      rows="4"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Test Cases (JSON)</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder='[{"input": "5", "output": "25"}]'
                      value={lessonForm.testCases}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          testCases: e.target.value,
                        })
                      }
                      rows="4"
                    />
                  </div>

                  <button
                    type="submit"
                    className="admin-submit"
                    disabled={loading}
                  >
                    {loading ? "⏳ Đang tạo..." : "✨ Tạo Bài Học"}
                  </button>
                </form>
              </div>
            )}

            {/* Lessons List */}
            <div className="lessons-list">
              {loading && lessons.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Đang tải bài học...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Chưa có bài học nào</p>
                </div>
              ) : (
                lessons.map((lesson) => (
                  <div key={lesson.lessonId} className="lesson-item-card">
                    <div className="lesson-item-header">
                      <h3 className="lesson-item-name">{lesson.lessonTitle}</h3>
                      <span className="lesson-order">Bài #{lesson.lessonOrder}</span>
                    </div>
                    <div className="lesson-item-actions">
                      <button
                        type="button"
                        className="action-btn delete"
                        disabled={loading}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteLesson(lesson.lessonId);
                        }}
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="admin-tab-content">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-users"></i>
                Quản Lý Người Dùng
              </h2>
            </div>

            {/* Users List */}
            <div className="users-list">
              {loading && users.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Đang tải danh sách người dùng...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Chưa có người dùng nào</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.userId} className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="user-details">
                        <p className="user-name">{user.fullName || "Unknown"}</p>
                        <p className="user-email">{user.email}</p>
                        <p className="user-id">ID: {user.userId}</p>
                      </div>
                    </div>
                    <div className="user-stats">
                      <div className="user-stat">
                        <div className="user-stat-value">-</div>
                        <div className="user-stat-label">Khóa Học</div>
                      </div>
                      <div className="user-stat">
                        <div className="user-stat-value">-</div>
                        <div className="user-stat-label">Bài Hoàn Thành</div>
                      </div>
                      <div className="user-stat">
                        <div className="user-stat-value">-</div>
                        <div className="user-stat-label">Tiến Độ</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}