// src/pages/Profile/ProfileScreen.jsx

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";

import "../../assets/CSS/mainmenu.css";
import "../../assets/CSS/profilescreen.css";
import Navbar from "../../components/navbar.jsx";


export default function ProfileScreen() {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");

  const [isLearnMenuOpen, setLearnMenuOpen] = useState(false);
  
  const [courses] = useState([
    { id: 1, title: "Python Mastery" },
    { id: 2, title: "HTML & CSS Foundations" },
    { id: 3, title: "JavaScript Adventures" },
    { id: 4, title: "React Kingdom" },
    { id: 5, title: "Database Dungeons" },
    { id: 6, title: "Algorithm Arena" },
  ]);

  const handleMenuEnter = () => {
    setLearnMenuOpen(true);
  };

  const handleMenuLeave = () => {
    setLearnMenuOpen(false);
  };

  const handleCourseClick = useCallback((courseId) => {
    setIsLoading(true);
    setLoadingMessage("Đang tải khóa học...");
    setTimeout(() => {
      navigate(`/course/${courseId}`);
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const handleAvatarClick = () => {
    window.location.reload();
  };

  const handleLogout = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("main");

  // OPTIMIZATION: Wrapped in useCallback
  const showQuestsView = useCallback(() => {
    setMobileMenuView("quests");
  }, []);

  // OPTIMIZATION: Wrapped in useCallback
  const showMainView = useCallback(() => {
    setMobileMenuView("main");
  }, []);

  // OPTIMIZATION: Wrapped in useCallback
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prevState) => !prevState);
  }, []);
  
  // OPTIMIZATION: Wrapped in useCallback
  const handleMobileNav = useCallback(
    (path) => {
      navigate(path);
      setMobileMenuOpen(false); // Đóng menu mobile
    },
    [navigate]
  );

  const handleEditProfile = () => {
    setIsLoading(true);
    setLoadingMessage("Đang tải form chỉnh sửa...");
    setTimeout(() => {
      navigate('/profile/edit');
      setIsLoading(false);
    }, 1000);
  };
  
  const [user] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('devVanguardUser')) || {};
    
    const defaultSkills = {
      html: false, css: false, javascript: false, python: false,
      java: false, cpp: false, sql: false, commandline: false,
      react: false, github: false, numpy: false, typescript: false,
    };

    return {
      name: storedUser.name || 'Knight Coder',
      username: storedUser.username || 'knightcoder99',
      avatar: storedUser.avatar || '/images/default-avatar.jpg',
      level: storedUser.level || 'Lv1',
      joinedDate: storedUser.joinedDate || 'Oct 16, 2025', // Giữ lại ngày tham gia
      bio: storedUser.bio || "You don't have anything in your bio.",
      skills: { ...defaultSkills, ...storedUser.skills },
    };
  });

  return (
    <>
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
      <Navbar />

      <div className="profile-background"></div>
      <div className="profile-container">
        <div className="profile-header">
          <img src="/images/default-avatar.jpg" alt="Profile Avatar" className="profile-avatar-large" />
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>@{user.username}</p>
          </div>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <i></i> 
            <span>Edit Profile</span> {/* Bọc text trong <span> */}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="bio-card">
              <h2>Bio</h2>
              {/* <p className="level-badge">{user.level}</p> */}
              <p>{user.bio}</p>
              <p>Joined {user.joinedDate}</p>
            </div>
            <div className="skills-card">
              <h2>Skills</h2>
                <div className="skills-list">
                  {/* Lọc ra các skill mà user đã check (value = true) */}
                  {Object.keys(user.skills).filter(skill => user.skills[skill]).length > 0 ? (
                    Object.keys(user.skills)
                      .filter(skill => user.skills[skill])
                      .map(skill => (
                        <span key={skill} className="skill-tag">
                          {skill.charAt(0).toUpperCase() + skill.slice(1).replace('cpp', 'C++').replace('github', 'Git & GitHub')}
                        </span>
                      ))
                  ) : (
                    <p>Add skills from settings.</p> /* Hiển thị nếu không có skill */
                  )}
                </div>
              </div>
          </div>

          <div className="profile-main">
            {/* <div className="pinned-card">
              <h2>Pinned</h2>
              <div className="empty-state">Pin a project.</div>
            </div> */}

            <div className="stats-card"> 
                <h2>Stats</h2> 
                
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