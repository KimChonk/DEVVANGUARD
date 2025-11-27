import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, courseService, lessonService, userProgressService, lessonHintService, pvpProblemService, badgeService  } from "../../services/apiClient";
import { authService } from "../../services/supabaseClient";
import LoadingScreen from "../../components/LoadingScreen";
import TestCaseBuilder from "../../components/TestCaseBuilder";
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
  const [hints, setHints] = useState([]);
  const [users, setUsers] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [pvpProblems, setPvpProblems] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showHintForm, setShowHintForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showPvpProblemForm, setShowPvpProblemForm] = useState(false);

  //Badges
  const [badges, setBadges] = useState([]);
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState(null);

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
    testCases: "",
    xpReward: ""
  });

  const [hintForm, setHintForm] = useState({
    lessonId: "",
    hintTitle: "",
    hintContent: ""
  });

  const [pvpProblemForm, setPvpProblemForm] = useState({
    title: "",
    problemDescription: "",
    solutionTemplate: "",
    testCases: "",
    xpReward: "",
  });

  const [badgeForm, setBadgeForm] = useState({
    name: "",
    description: "",
    xpReward: "",       
    conditionType: "XP_LEVEL",
    conditionValue: "" 
  });

  const [editingHintId, setEditingHintId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingPvpProblemId, setEditingPvpProblemId] = useState(null);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

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

        // Fetch progress for each user
        const progressMap = {};
        for (const user of usersResult.data) {
          const progressResult = await userProgressService.getUserProgressByUserId(user.userId);
          if (progressResult.success && Array.isArray(progressResult.data)) {
            progressMap[user.userId] = progressResult.data;
          } else {
            progressMap[user.userId] = [];
          }
        }
        setUserProgress(progressMap);
      }

      // Fetch lessons
      const lessonsResult = await lessonService.getAllLessons();
      if (lessonsResult.success && Array.isArray(lessonsResult.data)) {
        setLessons(lessonsResult.data);
        setTotalLessons(lessonsResult.data.length);
      }

      // Fetch hints
      const hintsResult = await lessonHintService.getAllHints();
      if (hintsResult.success && Array.isArray(hintsResult.data)) {
        setHints(hintsResult.data);
      }

      // Fetch PvP Problems
      const problemsResult = await pvpProblemService.getAllProblems();
      if (problemsResult.success && Array.isArray(problemsResult.data)) {
        setPvpProblems(problemsResult.data);
      }

      // Fetch Badges 
      if (badgeService) { 
          const badgesResult = await badgeService.getAllBadges();
          if (badgesResult.success && Array.isArray(badgesResult.data)) {
            setBadges(badgesResult.data);
          }
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
      let result;

      if (editingCourseId) {
        result = await courseService.updateCourse(
          editingCourseId,
          courseForm.name,
          courseForm.language,
          courseForm.description
        );
      } else {
        result = await courseService.createCourse(
          courseForm.name,
          courseForm.language,
          courseForm.description
        );
      }

      if (result.success) {
        setMessage(editingCourseId ? "✅ Course updated successfully!" : "✅ Course created successfully!");
        setCourseForm({ name: "", language: "", description: "" });
        setEditingCourseId(null);
        setShowCourseForm(false);
        fetchAllData();
      } else {
        setMessage("Error: " + (result.message || "Unable to save course"));
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
      let result;

      if (editingLessonId) {
        result = await lessonService.updateLesson(
          editingLessonId,
          lessonForm.lessonTitle,
          parseInt(lessonForm.lessonOrder) || 1,
          lessonForm.problemDescription || null,
          lessonForm.solutionTemplate || null,
          lessonForm.testCases || null,
          parseInt(lessonForm.xpReward) || 0
        );
      } else {
        result = await lessonService.createLesson(
          lessonForm.courseId,
          lessonForm.lessonTitle,
          parseInt(lessonForm.lessonOrder) || 1,
          lessonForm.problemDescription || null,
          lessonForm.solutionTemplate || null,
          lessonForm.testCases || null,
          parseInt(lessonForm.xpReward) || 0
        );
      }

      if (result.success) {
        setMessage(editingLessonId ? "✅ Lesson updated successfully!" : "✅ Lesson created successfully!");
        setLessonForm({ courseId: "", lessonTitle: "", lessonOrder: "", problemDescription: "", solutionTemplate: "", testCases: "", xpReward: "" });
        setEditingLessonId(null);
        setShowLessonForm(false);
        fetchAllData();
      } else {
        setMessage("Error: " + (result.message || "Unable to save lesson"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePvpProblem = async (e) => {
    e.preventDefault();
    if (
      !pvpProblemForm.title ||
      !pvpProblemForm.problemDescription ||
      !pvpProblemForm.xpReward
    ) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      let result;
      const problemData = {
        title: pvpProblemForm.title,
        problemDescription: pvpProblemForm.problemDescription,
        solutionTemplate: pvpProblemForm.solutionTemplate || null,
        testCases: pvpProblemForm.testCases || null,
        xpReward: parseInt(pvpProblemForm.xpReward) || 20,
      };

      if (editingPvpProblemId) {
        result = await pvpProblemService.updateProblem(
          editingPvpProblemId,
          problemData.title,
          problemData.problemDescription,
          problemData.solutionTemplate,
          problemData.testCases,
          problemData.xpReward
        );
      } else {
        result = await pvpProblemService.createProblem(
          problemData.title,
          problemData.problemDescription,
          problemData.solutionTemplate,
          problemData.testCases,
          problemData.xpReward
        );
      }

      if (result.success) {
        setMessage(
          editingPvpProblemId
            ? "✅ PvP Problem updated successfully!"
            : "✅ PvP Problem created successfully!"
        );
        setPvpProblemForm({
          title: "",
          problemDescription: "",
          solutionTemplate: "",
          testCases: "",
          xpReward: "",
        });
        setEditingPvpProblemId(null);
        setShowPvpProblemForm(false);
        fetchAllData();
      } else {
        setMessage(
          "Error: " + (result.message || "Unable to save PvP problem")
        );
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

  // Handle course edit
  const handleEditCourse = (course) => {
    setEditingCourseId(course.id || course.courseId);
    setCourseForm({
      name: course.name,
      language: course.language,
      description: course.description || ""
    });
    setShowCourseForm(true);
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

  const handleDeletePvpProblem = async (problemId) => {
    if (window.confirm("Are you sure you want to delete this PvP problem?")) {
      try {
        setLoading(true);
        const result = await pvpProblemService.deleteProblem(problemId);

        if (result.success) {
          setMessage("✅ PvP Problem deleted successfully!");
          fetchAllData();
        } else {
          setMessage(
            "Error: " + (result.message || "Unable to delete PvP problem")
          );
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleEditPvpProblem = (problem) => {
    setEditingPvpProblemId(problem.problemId);
    setPvpProblemForm({
      title: problem.title,
      problemDescription: problem.problemDescription || "",
      solutionTemplate: problem.solutionTemplate || "",
      testCases: problem.testCases || "",
      xpReward: problem.xpReward || "20",
    });
    setShowPvpProblemForm(true);
  };

  // Handle lesson edit
  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.lessonId);
    setLessonForm({
      courseId: lesson.courseId,
      lessonTitle: lesson.lessonTitle,
      lessonOrder: lesson.lessonOrder || "1",
      problemDescription: lesson.problemDescription || "",
      solutionTemplate: lesson.solutionTemplate || "",
      testCases: lesson.testCases || "",
      xpReward: lesson.xpReward || ""
    });
    setShowLessonForm(true);
  };

  // Handle hint creation
  const handleCreateHint = async (e) => {
    e.preventDefault();
    if (!hintForm.lessonId || !hintForm.hintTitle) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (editingHintId) {
        result = await lessonHintService.updateHint(
          editingHintId,
          hintForm.hintTitle,
          hintForm.hintContent || null
        );
      } else {
        result = await lessonHintService.createHint(
          hintForm.lessonId,
          hintForm.hintTitle,
          hintForm.hintContent || null
        );
      }

      if (result.success) {
        setMessage(editingHintId ? "✅ Hint updated successfully!" : "✅ Hint created successfully!");
        setHintForm({ lessonId: "", hintTitle: "", hintContent: "" });
        setEditingHintId(null);
        setShowHintForm(false);
        fetchAllData();
      } else {
        setMessage("Error: " + (result.message || "Unable to save hint"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle hint deletion
  const handleDeleteHint = async (hintId) => {
    if (window.confirm("Are you sure you want to delete this hint?")) {
      try {
        setLoading(true);
        const result = await lessonHintService.deleteHint(hintId);

        if (result.success) {
          setMessage("✅ Hint deleted successfully!");
          fetchAllData();
        } else {
          setMessage("Error: " + (result.message || "Unable to delete hint"));
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle hint edit
  const handleEditHint = (hint) => {
    setEditingHintId(hint.hintId);
    setHintForm({
      lessonId: hint.lessonId,
      hintTitle: hint.title,
      hintContent: hint.content || ""
    });
    setShowHintForm(true);
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!badgeForm.name || !badgeForm.description || !badgeForm.xpReward || !badgeForm.conditionValue) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      let result;
      const finalConditionType = badgeForm.conditionType || "XP_LEVEL";
      const badgeData = {
        badgeName: badgeForm.name,           
        badgeImg: "default-badge.png", 
        description: badgeForm.description,
        xpReward: parseInt(badgeForm.xpReward), 
        conditionType: finalConditionType,
        conditionValue: parseInt(badgeForm.conditionValue)
      };
      
      if (editingBadgeId) {
        result = await badgeService.updateBadge(editingBadgeId, badgeData);
      } else {
        result = await badgeService.createBadge(badgeData);
      }

      if (result.success) {
        setMessage(editingBadgeId ? "✅ Badge updated successfully!" : "✅ Badge created successfully!");
        // Reset form về mặc định
        setBadgeForm({ 
          name: "", 
          description: "", 
          xpReward: "", 
          conditionType: "XP_LEVEL", 
          conditionValue: "" 
        });
        setEditingBadgeId(null);
        setShowBadgeForm(false);
        fetchAllData(); 
      } else {
        setMessage("Error: " + (result.message || "Unable to save badge"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Badge Edit
  const handleEditBadge = (badge) => {
    setEditingBadgeId(badge.id || badge.badgeId); 
    setBadgeForm({
      name: badge.badgeName || badge.name, 
      description: badge.description,
      xpReward: badge.xpReward || 0,
      conditionType: badge.conditionType || "XP_LEVEL",
      conditionValue: badge.conditionValue || 0
    });
    setShowBadgeForm(true);
  };

  // Handle Badge Delete
  const handleDeleteBadge = async (badgeId) => {
    if (window.confirm("Are you sure you want to delete this badge?")) {
      try {
        setLoading(true);
        const result = await badgeService.deleteBadge(badgeId);

        if (result.success) {
          setMessage("✅ Badge deleted successfully!");
          fetchAllData();
        } else {
          setMessage("Error: " + (result.message || "Unable to delete badge"));
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingHintId(null);
    setEditingLessonId(null);
    setEditingCourseId(null);
    setEditingPvpProblemId(null);
    setEditingBadgeId(null);
    setHintForm({ lessonId: "", hintTitle: "", hintContent: "" });
    setCourseForm({ name: "", language: "", description: "" });
    setLessonForm({ courseId: "", lessonTitle: "", lessonOrder: "", problemDescription: "", solutionTemplate: "", testCases: "" });
    setPvpProblemForm({
      title: "",
      problemDescription: "",
      solutionTemplate: "",
      testCases: "",
      xpReward: "",
    });
    setBadgeForm({ name: "", description: "", iconUrl: "" });
    setShowHintForm(false);
    setShowCourseForm(false);
    setShowLessonForm(false);
    setShowPvpProblemForm(false);
    setShowBadgeForm(false);
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
      title: "COURSES",
      value: totalCourses,
      change: "+1 this month",
      icon: "fas fa-book",
      color: "blue",
      trend: "up"
    },
    {
      title: "LESSONS",
      value: totalLessons,
      change: "+3 this week",
      icon: "fas fa-graduation-cap",
      color: "green",
      trend: "up"
    },
    {
      title: "USERS",
      value: totalUsers,
      change: `+${Math.max(0, totalUsers - 1)} active`,
      icon: "fas fa-users",
      color: "purple",
      trend: "up"
    }
  ], [totalCourses, totalLessons, totalUsers]);

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
      <LoadingScreen isVisible={loading} message="Loading admin dashboard..." />
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
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <div className="sidebar-menu">
            <div 
              className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              <i className="fas fa-book"></i>
              <span>Courses</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === "lessons" ? "active" : ""}`}
              onClick={() => setActiveTab("lessons")}
            >
              <i className="fas fa-chalkboard"></i>
              <span>Lessons</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === "hints" ? "active" : ""}`}
              onClick={() => setActiveTab("hints")}
            >
              <i className="fas fa-lightbulb"></i>
              <span>Hints</span>
            </div>
            <div
              className={`sidebar-item ${activeTab === "pvpProblems" ? "active" : ""}`}
              onClick={() => setActiveTab("pvpProblems")}
            >
              <i className="fas fa-th"></i>
              <span>PvP Problems</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === "badges" ? "active" : ""}`}
              onClick={() => setActiveTab("badges")}
            >
              <i className="fas fa-certificate"></i>
              <span>Badges</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <i className="fas fa-users"></i>
              <span>Users</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="admin-main-content">
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
              {/* Course Statistics */}
              <div className="admin-widget courses-widget full-width">
                <div className="widget-header">
                  <h3 className="widget-title">
                    <i className="fas fa-graduation-cap"></i>
                    Course Statistics
                  </h3>
                </div>
                <div className="courses-table">
                  <div className="table-header">
                    <div className="col-course">Course</div>
                    <div className="col-lessons">Total Lessons</div>
                    <div className="col-students">Students Completed</div>
                    <div className="col-completion">Completion Rate</div>
                  </div>
                  <div className="table-body">
                    {courses.length === 0 ? (
                      <div className="empty-table">
                        <p>No courses available</p>
                      </div>
                    ) : (
                      courses.map((course) => {
                        // Count lessons for this course
                        const courseLessons = lessons.filter(l => l.courseId === course.id);
                        const totalLessonsInCourse = courseLessons.length;
                        
                        // Count students who completed AT LEAST ONE lesson in this course
                        let studentsCompleted = 0;
                        
                        if (totalLessonsInCourse > 0) {
                          // For each user, check if they completed at least ONE lesson in this course
                          users.forEach(user => {
                            const userProgressArray = userProgress[user.userId] || [];
                            
                            // Check if user has ANY completed lesson in this course
                            const hasCompletedAnyLesson = userProgressArray.some(p => {
                              const lesson = courseLessons.find(l => l.lessonId === p.lessonId);
                              return lesson && p.status === 'completed';
                            });
                            
                            if (hasCompletedAnyLesson) {
                              studentsCompleted++;
                            }
                          });
                        }
                        
                        const completionRate = totalUsers > 0 
                          ? Math.round((studentsCompleted / totalUsers) * 100) 
                          : 0;
                        
                        return (
                          <div key={course.id} className="table-row">
                            <div className="col-course">
                              <div className="course-info">
                                <span className="course-name">{course.name}</span>
                              </div>
                            </div>
                            <div className="col-lessons">{totalLessonsInCourse}</div>
                            <div className="col-students">{studentsCompleted}</div>
                            <div className="col-completion">
                              <div className="completion-bar">
                                <div 
                                  className="completion-fill"
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                              <span className="completion-text">{completionRate}%</span>
                            </div>
                          </div>
                        );
                      })
                    )}
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
                Manage Courses
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  setEditingCourseId(null);
                  setCourseForm({ name: "", language: "", description: "" });
                  setShowCourseForm(!showCourseForm);
                }}
              >
                <i className="fas fa-plus"></i>
                {showCourseForm ? "Cancel" : "Add Course"}
              </button>
            </div>

            {/* Course Form */}
            {showCourseForm && (
              <div className="admin-form-container">
                <form className="admin-form-grid" onSubmit={handleCreateCourse}>
                  <div className="admin-form-group">
                    <label className="admin-label">Course Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="E.g.: Python Mastery"
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Programming Language</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="E.g.: Python"
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
                    <label className="admin-label">Description</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder="Enter detailed course description"
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
                    {loading ? (editingCourseId ? "Updating..." : "Creating...") : (editingCourseId ? "Update Course" : "Create Course")}
                  </button>
                </form>
              </div>
            )}

            {/* Courses List */}
            <div className="courses-list">
              {loading && courses.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No courses available</p>
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
                        className="action-btn edit"
                        onClick={() => handleEditCourse(course)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleDeleteCourse(course.id || course.courseId)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
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
                Manage Lessons
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  setEditingLessonId(null);
                  setLessonForm({ courseId: "", lessonTitle: "", lessonOrder: "", problemDescription: "", solutionTemplate: "", testCases: "" });
                  setShowLessonForm(!showLessonForm);
                }}
              >
                <i className="fas fa-plus"></i>
                {showLessonForm ? "Cancel" : "Add Lesson"}
              </button>
            </div>

            {/* Lesson Form */}
            {showLessonForm && (
              <div className="admin-form-container">
                <form className="lesson-form" onSubmit={handleCreateLesson}>
                  {/* Top Row: Course, Lesson Name */}
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label className="admin-label">Select Course *</label>
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
                        <option value="">-- Select course --</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Lesson Name *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="E.g.: Variables and Data Types"
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
                  </div>

                  {/* Row: Lesson Order, XP Reward */}
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label className="admin-label">Lesson Order *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="E.g.: 1"
                        value={lessonForm.lessonOrder}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            lessonOrder: e.target.value,
                          })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">XP Reward *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="E.g.: 100"
                        value={lessonForm.xpReward}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            xpReward: e.target.value,
                          })
                        }
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Row: Problem Description, Starter Code (2 col) */}
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label className="admin-label">Problem Description *</label>
                      <textarea
                        className="admin-input textarea"
                        placeholder="Enter detailed problem description..."
                        value={lessonForm.problemDescription}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            problemDescription: e.target.value,
                          })
                        }
                        rows="5"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Starter Code Template *</label>
                      <textarea
                        className="admin-input textarea"
                        placeholder="Enter starter code for students..."
                        value={lessonForm.solutionTemplate}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            solutionTemplate: e.target.value,
                          })
                        }
                        rows="5"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Width: Test Cases */}
                  <div className="admin-form-group form-full-width">
                    <TestCaseBuilder
                      value={lessonForm.testCases}
                      onChange={(jsonString) =>
                        setLessonForm({
                          ...lessonForm,
                          testCases: jsonString,
                        })
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="admin-submit"
                      disabled={loading}
                    >
                      {loading ? (editingLessonId ? "Updating..." : "Creating...") : (editingLessonId ? "Update Lesson" : "Create Lesson")}
                    </button>
                    <button
                      type="button"
                      className="admin-submit-cancel"
                      onClick={() => setShowLessonForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lessons List */}
            <div className="lessons-list">
              {loading && lessons.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading lessons...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No lessons available</p>
                </div>
              ) : (
                lessons.map((lesson) => (
                  <div key={lesson.lessonId} className="lesson-item-card">
                    <div className="lesson-item-header">
                      <h3 className="lesson-item-name">{lesson.lessonTitle}</h3>
                      <span className="lesson-order">Lesson #{lesson.lessonOrder}</span>
                    </div>
                    <div className="lesson-item-actions">
                      <button
                        type="button"
                        className="action-btn edit"
                        disabled={loading}
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        disabled={loading}
                        onClick={() => handleDeleteLesson(lesson.lessonId)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Hints Tab */}
        {activeTab === "hints" && (
          <div className="admin-tab-content">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-lightbulb"> </i>
                Manage Hints
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  setEditingHintId(null);
                  setHintForm({ lessonId: "", hintTitle: "", hintContent: "" });
                  setShowHintForm(!showHintForm);
                }}
              >
                <i className="fas fa-plus"></i>
                {showHintForm ? "Cancel" : "Add Hint"}
              </button>
            </div>

            {/* Hint Form */}
            {showHintForm && (
              <div className="admin-form-container">
                <form className="admin-form-grid" onSubmit={handleCreateHint}>
                  <div className="admin-form-group">
                    <label className="admin-label">Select Lesson</label>
                    <select
                      className="admin-input"
                      value={hintForm.lessonId}
                      onChange={(e) => {
                        setHintForm({
                          ...hintForm,
                          lessonId: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value="">-- Select lesson --</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.lessonId} value={lesson.lessonId}>
                          {lesson.lessonTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Hint Title</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="E.g.: Look at the pattern"
                      value={hintForm.hintTitle}
                      onChange={(e) =>
                        setHintForm({
                          ...hintForm,
                          hintTitle: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Hint Content</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder="Enter hint content..."
                      value={hintForm.hintContent}
                      onChange={(e) =>
                        setHintForm({
                          ...hintForm,
                          hintContent: e.target.value,
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
                    {loading ? (editingHintId ? "Updating..." : "Creating...") : (editingHintId ? "Update Hint" : "Create Hint")}
                  </button>
                </form>
              </div>
            )}

            {/* Hints List */}
            <div className="hints-list">
              {loading && hints.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading hints...</p>
                </div>
              ) : hints.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No hints available</p>
                </div>
              ) : (
                hints.map((hint) => {
                  const lesson = lessons.find(l => l.lessonId === hint.lessonId);
                  return (
                    <div key={hint.hintId} className="hint-item-card">
                      <div className="hint-item-header">
                        <h3 className="hint-item-title">{hint.title}</h3>
                        <span className="hint-lesson">{lesson?.lessonTitle || "Unknown Lesson"}</span>
                      </div>
                      <p className="hint-item-content">{hint.content}</p>
                      <div className="hint-item-actions">
                        <button
                          type="button"
                          className="action-btn edit"
                          disabled={loading}
                          onClick={() => handleEditHint(hint)}
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          disabled={loading}
                          onClick={() => handleDeleteHint(hint.hintId)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "pvpProblems" && (
            <div className="admin-tab-content">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-swords"></i>
                  Manage PvP Problems
                </h2>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => {
                    setEditingPvpProblemId(null);
                    setPvpProblemForm({
                      title: "",
                      problemDescription: "",
                      solutionTemplate: "",
                      testCases: "",
                      xpReward: "20",
                    });
                    setShowPvpProblemForm(!showPvpProblemForm);
                  }}
                >
                  <i className="fas fa-plus"></i>
                  {showPvpProblemForm ? "Cancel" : "Add Problem"}
                </button>
              </div>

              {/* PvP Problem Form */}
              {showPvpProblemForm && (
                <div className="admin-form-container">
                  <form
                    className="lesson-form"
                    onSubmit={handleCreatePvpProblem}
                  >
                    {/* Top Row: Title, XP Reward */}
                    <div className="form-row-2col">
                      <div className="admin-form-group">
                        <label className="admin-label">Problem Title *</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="E.g.: Two Sum Challenge"
                          value={pvpProblemForm.title}
                          onChange={(e) =>
                            setPvpProblemForm({
                              ...pvpProblemForm,
                              title: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">XP Reward *</label>
                        <input
                          type="number"
                          className="admin-input"
                          placeholder="E.g.: 20"
                          value={pvpProblemForm.xpReward}
                          onChange={(e) =>
                            setPvpProblemForm({
                              ...pvpProblemForm,
                              xpReward: e.target.value,
                            })
                          }
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Row: Problem Description, Starter Code (2 col) */}
                    <div className="form-row-2col">
                      <div className="admin-form-group">
                        <label className="admin-label">
                          Problem Description *
                        </label>
                        <textarea
                          className="admin-input textarea"
                          placeholder="Enter detailed problem description..."
                          value={pvpProblemForm.problemDescription}
                          onChange={(e) =>
                            setPvpProblemForm({
                              ...pvpProblemForm,
                              problemDescription: e.target.value,
                            })
                          }
                          rows="5"
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">
                          Starter Code Template
                        </label>
                        <textarea
                          className="admin-input textarea"
                          placeholder="Enter starter code for students..."
                          value={pvpProblemForm.solutionTemplate}
                          onChange={(e) =>
                            setPvpProblemForm({
                              ...pvpProblemForm,
                              solutionTemplate: e.target.value,
                            })
                          }
                          rows="5"
                        />
                      </div>
                    </div>

                    {/* Full Width: Test Cases */}
                    <div className="admin-form-group form-full-width">
                      <TestCaseBuilder
                        value={pvpProblemForm.testCases}
                        onChange={(jsonString) =>
                          setPvpProblemForm({
                            ...pvpProblemForm,
                            testCases: jsonString,
                          })
                        }
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="admin-submit"
                        disabled={loading}
                      >
                        {loading
                          ? editingPvpProblemId
                            ? "Updating..."
                            : "Creating..."
                          : editingPvpProblemId
                          ? "Update Problem"
                          : "Create Problem"}
                      </button>
                      <button
                        type="button"
                        className="admin-submit-cancel"
                        onClick={() => setShowPvpProblemForm(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PvP Problems List (sử dụng style của .lessons-list) */}
              <div className="lessons-list">
                {loading && pvpProblems.length === 0 ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading PvP problems...</p>
                  </div>
                ) : pvpProblems.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>No PvP problems available</p>
                  </div>
                ) : (
                  pvpProblems.map((problem) => (
                    <div
                      key={problem.problemId}
                      className="lesson-item-card"
                    >
                      <div className="lesson-item-header">
                        <h3 className="lesson-item-name">{problem.title}</h3>
                        <span className="lesson-order">
                          {problem.xpReward} XP
                        </span>
                      </div>
                      <div className="lesson-item-actions">
                        <button
                          type="button"
                          className="action-btn edit"
                          disabled={loading}
                          onClick={() => handleEditPvpProblem(problem)}
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          disabled={loading}
                          onClick={() =>
                            handleDeletePvpProblem(problem.problemId)
                          }
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        
        {/* Badges Tab */}
        {activeTab === "badges" && (
          <div className="admin-tab-content">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-certificate"></i>
                 Manage Badges
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  setEditingBadgeId(null);
                  setBadgeForm({ name: "", description: "", iconUrl: "" });
                  setShowBadgeForm(!showBadgeForm);
                }}
              >
                <i className="fas fa-plus"></i>
                {showBadgeForm ? "Cancel" : "Add Badge"}
              </button>
            </div>

            {/* Badge Form */}
            {showBadgeForm && (
              <div className="admin-form-container">
                <form className="admin-form-grid" onSubmit={handleCreateBadge}>
                  
                  {/* Hàng 1: Tên Badge */}
                  <div className="admin-form-group form-full-width">
                    <label className="admin-label">Badge Name *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="E.g.: Bug Hunter"
                      value={badgeForm.name}
                      onChange={(e) =>
                        setBadgeForm({ ...badgeForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Hàng 2: Mô tả */}
                  <div className="admin-form-group form-full-width">
                    <label className="admin-label">Description *</label>
                    <textarea
                      className="admin-input textarea"
                      placeholder="Describe how to earn this badge..."
                      value={badgeForm.description}
                      onChange={(e) =>
                        setBadgeForm({
                          ...badgeForm,
                          description: e.target.value,
                        })
                      }
                      rows="2"
                      required
                    ></textarea>
                  </div> 

                  {/* Hàng 3: XP Reward & Condition Type (2 cột) */}
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label className="admin-label">XP Reward *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="E.g.: 100"
                        value={badgeForm.xpReward}
                        onChange={(e) =>
                          setBadgeForm({ ...badgeForm, xpReward: e.target.value })
                        }
                        min="0"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Condition Type *</label>
                      <select
                        className="admin-input"
                        value={badgeForm.conditionType}
                        onChange={(e) =>
                          setBadgeForm({ ...badgeForm, conditionType: e.target.value })
                        }
                        required
                      >
                        <option value="XP_LEVEL">XP Milestone (Đạt mốc XP)</option>
                        <option value="LESSON_COUNT">Lesson Count (Số bài học)</option>
                        <option value="COURSE_COMPLETION">Course Completion (Hoàn thành khóa)</option>
                      </select>
                    </div>
                  </div>

                  {/* Hàng 4: Condition Value */}
                  <div className="admin-form-group form-full-width">
                    <label className="admin-label">
                      Condition Value * <span style={{fontWeight: 'normal', fontSize: '12px', color: '#888', marginLeft: '5px'}}>
                        (Amount needed to earn badge)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder={
                        badgeForm.conditionType === 'XP_LEVEL' ? "E.g.: 1000 XP" :
                        badgeForm.conditionType === 'LESSON_COUNT' ? "E.g.: 10 Lessons" : 
                        "E.g.: 1 (Course ID)"
                      }
                      value={badgeForm.conditionValue}
                      onChange={(e) =>
                        setBadgeForm({ ...badgeForm, conditionValue: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="admin-submit" disabled={loading}>
                      {loading ? (editingBadgeId ? "Updating..." : "Creating...") : (editingBadgeId ? "Update Badge" : "Create Badge")}
                    </button>
                    <button type="button" className="admin-submit-cancel" onClick={() => setShowBadgeForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Badges List */}
            {/* Badges List - ĐÃ SỬA LỖI HIỂN THỊ */}
            <div style={{ marginTop: "20px", width: "100%" }}> {/* Container bao ngoài full width */}
              {loading && badges.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading badges...</p>
                </div>
              ) : badges.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No badges available</p>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: "grid", 
                    // Ép cứng 3 cột, mỗi cột chiếm 1 phần bằng nhau
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))", 
                    gap: "24px", 
                    width: "100%" 
                  }}
                >
                  {badges.map((badge) => (
                    <div 
                      key={badge.id || badge.badgeId} 
                      style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        width: '100%',
                        minHeight: '300px', // Tăng chiều cao xíu để chứa thêm thông tin
                        background: 'var(--secondary-color, #222)',
                        border: '1px solid var(--border-color, #444)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        textAlign: 'center', 
                        padding: '20px',
                        gap: '12px'
                      }}>
                        {/* Icon */}
                        <div style={{
                          width: '70px', 
                          height: '70px', 
                          background: 'rgba(255,255,255,0.05)', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}>
                          <img 
                            src={
                              badge.badgeImg 
                                ? (badge.badgeImg.startsWith('/') || badge.badgeImg.startsWith('http') 
                                    ? badge.badgeImg 
                                    : `/Badges/${badge.badgeImg}`)
                                : "/Badges/default-badge.png"
                            } 
                            alt={badge.badgeName || badge.name} 
                            style={{width: '40px', height: '40px', objectFit: 'contain'}}
                            onError={(e) => e.target.src = "/Badges/default-badge.png"}
                          />
                        </div>
                        
                        {/* Name & Desc */}
                        <div>
                          <h3 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#fff'}}>
                            {badge.badgeName || badge.name}
                          </h3>
                          <p style={{fontSize: '13px', color: '#b0b0b0', margin: 0, lineHeight: '1.4', minHeight: '36px'}}>
                            {badge.description}
                          </p>
                        </div>

                        {/* INFO TAGS (MỚI) */}
                        <div style={{
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '8px', 
                          justifyContent: 'center', 
                          marginTop: '8px',
                          width: '100%'
                        }}>
                           {/* XP Tag */}
                           <span style={{
                             background: 'rgba(255, 193, 7, 0.15)', 
                             color: '#ffc107', 
                             padding: '4px 8px', 
                             borderRadius: '4px', 
                             fontSize: '11px', 
                             fontWeight: '600',
                             border: '1px solid rgba(255, 193, 7, 0.3)'
                           }}>
                             +{badge.xpReward || 0} XP
                           </span>
                           
                           {/* Condition Tag */}
                           <span style={{
                             background: 'rgba(64, 196, 255, 0.15)', 
                             color: '#40c4ff', 
                             padding: '4px 8px', 
                             borderRadius: '4px', 
                             fontSize: '11px', 
                             fontWeight: '600',
                             border: '1px solid rgba(64, 196, 255, 0.3)'
                           }}>
                             {badge.conditionType === 'XP_LEVEL' ? 'XP Milestone' : 
                              badge.conditionType === 'LESSON_COUNT' ? 'Lessons' : 'Course'} 
                             : {badge.conditionValue || 0}
                           </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div style={{
                        padding: '12px', 
                        display: 'flex', 
                        gap: '10px',
                        background: 'rgba(0,0,0,0.2)',
                        borderTop: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <button
                          type="button"
                          className="action-btn edit"
                          style={{flex: 1, justifyContent: 'center', height: '32px'}}
                          onClick={() => handleEditBadge(badge)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          style={{flex: 1, justifyContent: 'center', height: '32px'}}
                          onClick={() => handleDeleteBadge(badge.id || badge.badgeId)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                Manage Users
              </h2>
            </div>

            {/* Users List */}
            <div className="users-list">
              {loading && users.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No users available</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.userId} className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        <img 
                          src={user.avatarName && user.avatarName.trim() ? `/images/avatars/${user.avatarName}` : "/images/avatars/default-avatar.jpg"}
                          alt={user.fullName || "User Avatar"}
                          className="avatar-image"
                          onError={(e) => {
                            e.target.src = "/images/avatars/default-avatar.jpg";
                          }}
                        />
                      </div>
                      <div className="user-details">
                        <p className="user-name">{user.fullName || "Unknown"}</p>
                        <p className="user-email">{user.email}</p>
                        <p className="user-id">ID: {user.userId}</p>
                      </div>
                    </div>
                    <div className="user-stats">
                      <div className="user-stat">
                        <div className="user-stat-value">
                          {userProgress[user.userId] ? userProgress[user.userId].filter(p => p.status === 'completed').length : 0}
                        </div>
                        <div className="user-stat-label">Lessons Completed</div>
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
    </div>
  );
}