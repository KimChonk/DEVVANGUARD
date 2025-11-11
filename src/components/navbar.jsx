// src/components/Navbar.jsx

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/CSS/mainmenu.css"; 


export default function navbar() {
  const navigate = useNavigate();
  
  const [user] = useState({
    avatar: "/images/default-avatar.jpg",
  });

  // detect mobile breakpoint to change avatar behavior
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1064 : false);
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 1064); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
  const showAccountView = useCallback(() => setMobileMenuView("account"), []);
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

  // Search state
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const searchPanelRef = useRef(null);

  const toggleSearch = useCallback(() => {
    setSearchOpen(s => {
      const next = !s;
      if (!next) setSearchQuery("");
      return next;
    });
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.trim().toLowerCase();
    return courses.filter(c => c.title.toLowerCase().includes(q));
  }, [searchQuery, courses]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 80);
    }
  }, [isSearchOpen]);

  const handleSelectCourseFromSearch = useCallback((id) => {
    navigate(`/course/${id}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [navigate]);

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

  useEffect(() => {
    function handleClickOutsideSearch(e) {
      if (isSearchOpen && searchPanelRef.current && !searchPanelRef.current.contains(e.target) && !e.target.closest('.nav-search-btn')) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [isSearchOpen]);

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
              <li><button onClick={() => handleMobileNav("/pvp/lobby")} className="nav-button">Battle PvP</button></li>
              <li><button onClick={() => handleMobileNav("/practice")} className="nav-button">Practice</button></li>
              <li><button onClick={() => handleMobileNav("/build")} className="nav-button">Build</button></li>
              <li><button onClick={() => handleMobileNav("/leaderboards")} className="nav-button">Leaderboards</button></li>
            </ul>
          </div>
        </div>

        
        <div className="main-nav-right">
          {/* Search button */} 
          <button className="nav-search-btn" onClick={toggleSearch} aria-label="Search courses" >
            <i className="fas fa-search"></i>
          </button>
           
          <div className="avatar-menu-container" ref={avatarMenuRef}> {/* Thêm thẻ div và ref */}
            {/* Avatar only on desktop; on mobile we open the hamburger menu via .mobile-hamburger */}
            {!isMobile && (
              <button
                className="avatar-btn"
                onClick={handleAvatarClick}
              >
                <img src={user.avatar} alt="User Avatar" className="user-avatar" />
              </button>
            )}
 
             {/* Desktop avatar dropdown only */}
             {isAvatarMenuOpen && !isMobile && (
               <div className="avatar-dropdown-menu">
                 <button className="avatar-dropdown-item" onClick={() => handleAvatarNav('/profile')}>
                   <i className="fas fa-user-circle icon-padding"></i> Profile
                 </button>
                 <button className="avatar-dropdown-item" onClick={() => handleAvatarNav('/profile/edit')}>
                    <i className="fas fa-cog icon-padding"></i> Settings
                 </button>
               </div>
             )}
              {/* ================================== */}
           </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
          
          {/* Mobile hamburger: chỉ render trên mobile */}
          {isMobile && (
            <button className="mobile-hamburger" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
            </button>
          )}
        </div>
      </div>

      {/* Search overlay/panel - desktop */}
      {!isMobile && (
        <div className={`courses-search-overlay ${isSearchOpen ? "open" : ""}`} aria-hidden={!isSearchOpen}>
          <div className="search-panel" ref={searchPanelRef}>
            <div className="search-header">
              <div className="search-input-wrap">
                <input
                  ref={searchInputRef}
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, e.g. Python, React..."
                  aria-label="Search courses"
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button className="search-close" onClick={toggleSearch} aria-label="Close search">
                <i className="fas fa-times-circle"></i>
              </button>
            </div>

            <div className="search-body">
              <h4 className="search-section-title">Courses</h4>
              <ul className="search-results">
                {filteredCourses.length === 0 ? (
                  <li className="search-empty">No courses found</li>
                ) : (
                  filteredCourses.slice(0, 3).map(c => (
                    <li key={c.id} className="search-item" onClick={() => handleSelectCourseFromSearch(c.id)}>
                      <div className="search-item-title">{c.title}</div>
                      <i className="fas fa-chevron-right"></i>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: full-screen search modal with input at top and results immediately under it */}
      {isMobile && isSearchOpen && (
        <div
          className="mobile-search-modal open"
          onClick={(e) => { if (e.target.classList.contains('mobile-search-modal')) setSearchOpen(false); }}
        >
          <div className="mobile-search-panel" ref={searchPanelRef}>
            <div className="mobile-search-header">
              <div className="search-input-wrap">
                <input
                  ref={searchInputRef}
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, e.g. Python, React..."
                  aria-label="Search courses"
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button className="search-close" onClick={toggleSearch} aria-label="Close search">
                <i className="fas fa-times-circle"></i>
              </button>
            </div>

            <div className="mobile-search-results">
              {filteredCourses.length === 0 ? (
                <div className="search-empty">No courses found</div>
              ) : (
                filteredCourses.slice(0, 3).map(c => (
                  <div key={c.id} className="mobile-search-item" onClick={() => handleSelectCourseFromSearch(c.id)}>
                    <div className="mobile-search-title">{c.title}</div>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                ))
              )}
            
            </div>
          </div>
        </div>
      )}
      
      
      {/* Mobile overlay menu (behaviour like LessonScreen) */}
      <div className={`lesson-mobile-side-menu mobile-only ${isMobileMenuOpen ? "open" : ""}`}>
        {mobileMenuView === "main" && (
          <>
            <div className="mobile-menu-header">
              <button className="mobile-menu-close" onClick={toggleMobileMenu} aria-label="Close menu">
                <i className="fas fa-times"></i>
              </button>
              <span>Menu</span>
            </div>

            <ul className="mobile-menu-list">
              <li>
                <a onClick={showQuestsView} className="menu-section-link">
                  <span><i className="fas fa-scroll icon-padding"></i> Available Quests</span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </a>
              </li>
              
              <li><a onClick={() => handleMobileNav('/pvp/lobby')}><i className="fas fa-gamepad icon-padding"></i> Battle PvP</a></li>
              <li><a onClick={() => handleMobileNav('/practice')}><i className="fas fa-dumbbell icon-padding"></i> Practice</a></li>
              <li><a onClick={() => handleMobileNav('/build')}><i className="fas fa-hammer icon-padding"></i> Build</a></li>
              <li><a onClick={() => handleMobileNav('/leaderboards')}><i className="fas fa-trophy icon-padding"></i> Leaderboards</a></li>
              <li>
                <button className="menu-section-link account-row" onClick={showAccountView} aria-label="Account">
                  <span className="account-row-left">
                    <img src={user.avatar} alt="avatar" className="menu-account-avatar" />
                    <span className="account-row-label">Account</span>
                  </span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </button>
              </li>
            </ul>
          </>
        )}

        {/* Account detail view: avatar lớn + action list (Profile / Settings / Sign out) */}
        {mobileMenuView === "account" && (
          <div className="mobile-account-view">
            <div className="submenu-header">
              <button onClick={showMainView} className="back-to-menu-btn">
                <i className="fas fa-chevron-left"></i> Back to menu
              </button>
              <h2>Account</h2>
            </div>

            {/* <div className="account-card">
              <div className="account-avatar-wrap">
                <div className="account-avatar-border">
                  <img src={user.avatar} alt="avatar" className="account-avatar-large" />
                </div>
              </div>
              <div className="account-meta">
                <div className="account-name">Knight Coder</div>
              </div>
            </div> */}

            <ul className="account-action-list">
              <li className="account-action-item" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <i className="fas fa-user-circle icon-padding"></i> Profile
              </li>
              <li className="account-action-item" onClick={() => { navigate('/profile/edit'); setMobileMenuOpen(false); }}>
                <i className="fas fa-cog icon-padding"></i> Settings
              </li>
              <li className="account-action-item" onClick={() => { handleLogout(); }}>
                <i className="fas fa-sign-out-alt icon-padding"></i> Sign out
              </li>
            </ul>
          </div>
        )}
        {mobileMenuView === "quests" && (
          <div className="mobile-submenu">
            <div className="submenu-header">
              <button onClick={showMainView} className="back-to-menu-btn">
                <i className="fas fa-chevron-left"></i> Back to menu
              </button>
              <h2>Available Quests</h2>
            </div>
            <ul className="mobile-menu-list submenu-list">
              {courses.map((course) => (
                <li key={course.id}><a onClick={() => handleCourseClick(course.id)}>{course.title}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}