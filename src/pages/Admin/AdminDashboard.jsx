import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/apiClient";
import { courseService } from "../../services/apiClient";
import { lessonService } from "../../services/apiClient";
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

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResult = await courseService.getAllCourses();
        console.log('📊 Courses Result:', coursesResult);
        if (coursesResult.success && Array.isArray(coursesResult.data)) {
          setTotalCourses(coursesResult.data.length);
          console.log('✅ Total Courses:', coursesResult.data.length);
        }

        // Fetch all users and filter (exclude admins) - more robust filter
        const usersResult = await userService.getAllUsers();
        console.log('👥 Users Result:', usersResult);
        if (usersResult.success && Array.isArray(usersResult.data)) {
          console.log('All users:', usersResult.data);
          // Filter: only 'user' role OR where role is not 'admin'
          const regularUsers = usersResult.data.filter(u => u.role === 'user' || (u.role && u.role !== 'admin'));
          console.log('Regular users (non-admin):', regularUsers);
          setTotalUsers(regularUsers.length);
          console.log('✅ Total Users:', regularUsers.length);
        }

        // Fetch all lessons directly (no loop!)
        const lessonsResult = await lessonService.getAllLessons();
        console.log('📚 All Lessons Result:', lessonsResult);
        if (lessonsResult.success && Array.isArray(lessonsResult.data)) {
          setTotalLessons(lessonsResult.data.length);
          console.log('✅ Total Lessons:', lessonsResult.data.length);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

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
              <li><a href="#" className="active">Dashboard</a></li>
              <li><a href="#">Users</a></li>
              <li><a href="#">Courses</a></li>
              <li><a href="#">Analytics</a></li>
              <li><a href="#">Settings</a></li>
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
              onClick={() => navigate("/main-menu")}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Site
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard Content */}
      <div className="admin-content">
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
      </div>
    </div>
  );
}