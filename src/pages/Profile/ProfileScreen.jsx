// src/pages/Profile/ProfileScreen.jsx

// ▼▼▼ BẮT ĐẦU PHẦN SỬA LỖI IMPORT ▼▼▼
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ▲▲▲ KẾT THÚC PHẦN SỬA LỖI IMPORT ▲▲▲

import "../../assets/CSS/mainmenu.css";
import "../../assets/CSS/profilescreen.css";


export default function ProfileScreen() {
  // Bây giờ useNavigate đã được import và có thể sử dụng
  const navigate = useNavigate();

  // ----- BẮT ĐẦU LOGIC CỦA NAVBAR -----
  const [isLearnMenuOpen, setLearnMenuOpen] = useState(false);
  
  const [courses] = useState([
    { id: 1, title: "Python Mastery" },
    { id: 2, title: "HTML & CSS Foundations" },
    { id: 3, title: "JavaScript Adventures" },
    { id: 4, title: "React Kingdom" },
    { id: 5, title: "Database Dungeons" },
    { id: 6, title: "Algorithm Arena" },
  ]);

  const toggleLearnMenu = () => {
    setLearnMenuOpen((prevState) => !prevState);
  };

  const handleCourseClick = useCallback((courseId) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const handleAvatarClick = () => {
    window.location.reload();
  };

  const handleLogout = useCallback(() => {
    navigate("/login");
  }, [navigate]);
  // ----- KẾT THÚC LOGIC CỦA NAVBAR -----


  // ----- LOGIC CỦA PROFILE SCREEN -----
  const [user] = useState({
    name: "Knight Coder",
    username: "knightcoder99",
    level: "Lv1",
    joinedDate: "Oct 16, 2025",
    avatar: "/images/default-avatar.jpg"
  });

  return (
    <>
      {/* ==================================================== */}
      {/* ========= BẮT ĐẦU PHẦN CODE NAVBAR ĐÃ GỘP ========= */}
      {/* ==================================================== */}
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
              <li className="nav-item-dropdown">
                <button className="nav-link-button" onClick={toggleLearnMenu}>
                  <span>Available Quests</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                {isLearnMenuOpen && (
                  <div className="dropdown-menu">
                    {courses.map((course) => (
                      <a
                        key={course.id}
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCourseClick(course.id);
                        }}
                      >
                        {course.title}
                      </a>
                    ))}
                  </div>
                )}
              </li>
              <li><a href="/practice">Practice <i className="fas fa-chevron-down"></i></a></li>
              <li><a href="/build">Build</a></li>
              <li><a href="/leaderboards">Leaderboards</a></li>
            </ul>
          </div>
          <div className="main-nav-right">
            <button className="avatar-btn" onClick={handleAvatarClick}>
              <img
                src={user.avatar}
                alt="User Avatar"
                className="user-avatar"
              />
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ==================================================== */}
      {/* =========== BẮT ĐẦU PHẦN PROFILE CONTENT =========== */}
      {/* ==================================================== */}
      <div className="profile-background"></div>
      <div className="profile-container">
        <div className="profile-header">
          <img src="/images/default-avatar.jpg" alt="Profile Avatar" className="profile-avatar-large" />
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>@{user.username}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="bio-card">
              <h2>Bio</h2>
              <p className="level-badge">{user.level}</p>
              <p>You don't have anything in your bio. Go to account and edit profile to add something cool about yourself!</p>
              <p>Joined {user.joinedDate}</p>
            </div>
            <div className="skills-card">
              <h2>Skills</h2>
              <p>Add skills from account settings.</p>
            </div>
          </div>

          <div className="profile-main">
            <div className="pinned-card">
              <h2>Pinned</h2>
              <div className="empty-state">Pin a project.</div>
            </div>

            <div className="stats-card"> {/* 1. Dùng một thẻ card chung */}
                <h2>Stats</h2> {/* 2. Đặt H2 ở đây */}
                
                {/* 3. Div này BÂY GIỜ chỉ chứa các mục stat */}
                <div className="stats-grid"> 
                <div className="stat-item"><h3>0</h3><p>Exercises</p></div>
                <div className="stat-item"><h3>0</h3><p>Total XP</p></div>
                <div className="stat-item"><h3>0</h3><p>Course Badges</p></div>
                <div className="stat-item"><h3>1</h3><p>Daily Streak</p></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}