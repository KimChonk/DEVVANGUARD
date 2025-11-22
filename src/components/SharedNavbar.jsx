import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import "../assets/CSS/mainmenu.css";

const courseImageMap = {
  python: "python_background.gif",
  java: "Java_background.gif",
  "c++": "Cpp_background.gif",
  c: "C_background.gif",
};

const getCourseImage = (courseName) => {
  const name = courseName?.toLowerCase() || "";
  for (const [key, image] of Object.entries(courseImageMap)) {
    if (name.includes(key)) {
      return `/images/${image}`;
    }
  }
  return `/images/python_course.jpg`;
};

export default function SharedNavbar() {
  const navigate = useNavigate();
  const { courses } = useCourses();

  const [showLearnDropdown, setShowLearnDropdown] = useState(false);

  const handleMenuEnter = useCallback(() => setShowLearnDropdown(true), []);
  const handleMenuLeave = useCallback(() => setShowLearnDropdown(false), []);

  const handleCourseClick = useCallback(
    (courseId) => {
      navigate(`/course/${courseId}`);
      setShowLearnDropdown(false);
    },
    [navigate]
  );

  const handlePvPClick = useCallback(() => {
    navigate("/pvp/lobby");
  }, [navigate]);

  return (
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
            <li
              className="nav-dropdown"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <a className="dropdown-toggle">
                Learn <i className="fas fa-chevron-down"></i>
              </a>
              {showLearnDropdown && (
                <div
                  className="dropdown-menu learn-dropdown"
                  onMouseLeave={handleMenuLeave}
                >
                  <div className="dropdown-content">
                    <div className="dropdown-left">
                      <h4 className="dropdown-title">Recommended</h4>
                      <div className="recommended-courses">
                        {courses && courses.length > 0 &&
                          courses.slice(0, 2).map((course) => (
                            <div
                              key={course.courseId}
                              className="recommended-item"
                              onClick={() => handleCourseClick(course.courseId)}
                            >
                              <img
                                src={`/images/${getCourseImage(course.name).split("/").pop()}`}
                                alt={course.name}
                                className="recommended-thumb"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                              <div className="recommended-info">
                                <span className="recommended-name">
                                  {course.name}
                                </span>
                                <span className="recommended-lang">
                                  {course.language}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="dropdown-right">
                      <h4 className="dropdown-title">All Courses</h4>
                      <div className="courses-list">
                        {courses &&
                          courses.length > 0 &&
                          courses.map((course) => (
                            <a
                              key={course.courseId}
                              className="course-list-item"
                              onClick={() => handleCourseClick(course.courseId)}
                            >
                              <span className="course-list-name">
                                {course.name}
                              </span>
                              <span className="course-list-lang">
                                {course.language}
                              </span>
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li>
              <a onClick={() => navigate("/leaderboards")}>Leaderboards</a>
            </li>
            <li>
              <a onClick={() => navigate("/practice")}>Practice</a>
            </li>
            <li>
              <a onClick={handlePvPClick}>Battle PvP</a>
            </li>
          </ul>
        </div>

        <div className="main-nav-right">
        </div>
      </div>
    </nav>
  );
}
