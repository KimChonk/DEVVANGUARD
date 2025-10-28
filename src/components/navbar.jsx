// src/components/Navbar.jsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/CSS/mainmenu.css"; 


export default function navbar() {
  const navigate = useNavigate();
  
  const [user] = useState({
    avatar: "/images/default-avatar.jpg",
  });

  const [courses] = useState([
    { id: 1, title: "Python Mastery" },
    { id: 2, title: "HTML & CSS Foundations" },
    { id: 3, title: "JavaScript Adventures" },
    { id: 4, title: "React Kingdom" },
    { id: 5, title: "Database Dungeons" },
    { id: 6, title: "Algorithm Arena" },
  ]);

  const [isLearnMenuOpen, setLearnMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("main");

  const [isAvatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null); // Ref để phát hiện click bên ngoài
  
  const handleMenuEnter = useCallback(() => setLearnMenuOpen(true), []);
  const handleMenuLeave = useCallback(() => setLearnMenuOpen(false), []);
  const showQuestsView = useCallback(() => setMobileMenuView("quests"), []);
  const showMainView = useCallback(() => setMobileMenuView("main"), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((p) => !p), []);

  const handleCourseClick = useCallback(
    (courseId) => {
      navigate(`/course/${courseId}`);
      setMobileMenuOpen(false);
    },
    [navigate]
  );

  const toggleAvatarMenu = useCallback(() => {
      setAvatarMenuOpen(prev => !prev);
  }, []);

  // const handleAvatarClick = useCallback(() => navigate("/profile"), [navigate]);
  const handleAvatarClick = toggleAvatarMenu;
  const handleLogout = useCallback(() => navigate("/login"), [navigate]);

  const handleMobileNav = useCallback(
    (path) => {
      navigate(path);
      setMobileMenuOpen(false);
    },
    [navigate]
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        // Kiểm tra xem có click vào nút avatar không (để tránh đóng/mở ngay lập tức)
        if (!event.target.closest('.avatar-btn')) {
             setAvatarMenuOpen(false);
        }
      }
    }
    // Lắng nghe click trên toàn bộ document
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Dọn dẹp listener khi component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [avatarMenuRef]);

  const handleAvatarNav = (path) => {
      navigate(path);
      setAvatarMenuOpen(false); // Đóng menu sau khi click
  }

  return (
    <nav className="main-navbar">
      <div className="main-nav-container">
        
        <div className="main-nav-left">
          <div
            className="logo-link"
            onClick={() => navigate("/main-menu")}
            role="button"
            tabIndex="0"
          >
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
          </div>

          <div className="desktop-menu">
            <ul className="main-nav-links">
              <li
                className="nav-item-dropdown"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <button className="nav-link-button">
                  
                  <a>Available Quests</a>
                  <i
                    className={`fas fa-chevron-down ${
                      isLearnMenuOpen ? "arrow-up" : ""
                    }`}
                  ></i>
                </button>
                {isLearnMenuOpen && (
                  <div className="dropdown-menu">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        className="dropdown-item"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        {course.title}
                      </button>
                    ))}
                  </div>
                )}
              </li>
              <li><button onClick={() => handleMobileNav("/practice")} className="nav-button">Practice</button></li>
              <li><button onClick={() => handleMobileNav("/build")} className="nav-button">Build</button></li>
              <li><button onClick={() => handleMobileNav("/leaderboards")} className="nav-button">Leaderboards</button></li>
            </ul>
          </div>
        </div>

        
        <div className="main-nav-right">
          <div className="avatar-menu-container" ref={avatarMenuRef}> {/* Thêm thẻ div và ref */}
            <button className="avatar-btn" onClick={handleAvatarClick}> {/* onClick đã được sửa */}
              <img
                src={user.avatar}
                alt="User Avatar"
                className="user-avatar"
              />
            </button>

            {/* === THÊM MỚI: Avatar Dropdown Menu === */}
            {isAvatarMenuOpen && (
              <div className="avatar-dropdown-menu">
                <button className="avatar-dropdown-item" onClick={() => handleAvatarNav('/profile')}>
                  <i className="fas fa-user-circle icon-padding"></i> Profile
                </button>
                <button className="avatar-dropdown-item" onClick={() => handleAvatarNav('/profile/edit')}>
                   <i className="fas fa-cog icon-padding"></i> Account {/* Hoặc dùng icon khác */}
                </button>
                 {/* Bạn có thể thêm nút Logout vào đây nếu muốn */}
                 {/* <hr className="dropdown-divider" />
                 <button className="avatar-dropdown-item logout" onClick={handleLogout}>
                   <i className="fas fa-sign-out-alt icon-padding"></i> Logout
                 </button> */}
              </div>
            )}
            {/* ================================== */}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
          
          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            <i
              className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
            ></i>
          </button>
        </div>
      </div>

      
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        {mobileMenuView === "main" && (
          <ul className="mobile-nav-links">
            <li>
              <button onClick={showQuestsView} className="menu-section-link">
                <i className="fas fa-scroll icon-padding"></i> Available Quests <i className="fas fa-chevron-right arrow-right"></i>
              </button>
            </li>
            <hr className="mobile-divider" />
            <li><button onClick={() => handleMobileNav("/practice")}><i className="fas fa-dumbbell icon-padding"></i> Practice<i></i></button></li>
            <li><button onClick={() => handleMobileNav("/build")}><i className="fas fa-hammer icon-padding"></i> Build<i></i></button></li>
            <li><button onClick={() => handleMobileNav("/leaderboards")}><i className="fas fa-trophy icon-padding"></i> Leaderboards<i></i></button></li>
            <li><button onClick={handleLogout}><i className="fas fa-sign-out-alt icon-padding"></i> Logout<i></i></button></li>
          </ul>
        )}

        {mobileMenuView === "quests" && (
          <div className="mobile-submenu">
            <div className="submenu-header">
              <button onClick={showMainView} className="back-to-menu-btn">
                <i className="fas fa-chevron-left"></i> Back to menu
              </button>
              <h2>Available Quests</h2>
            </div>
            <ul className="mobile-nav-links submenu-list">
              {courses.map((course) => (
                <li key={course.id}>
                  <button onClick={() => handleCourseClick(course.id)}>
                    {course.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}