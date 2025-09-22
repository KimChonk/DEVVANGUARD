import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/CSS/coursescreen.css";

export default function CourseScreen() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/images/default-avatar.jpg"
  });

  // Sample course data based on courseId
  const [course] = useState({
    1: {
      id: 1,
      title: "Python Mastery",
      description: "Master the ancient art of Python programming and unlock the secrets of data manipulation. This comprehensive quest will guide you through the fundamental concepts and advanced techniques of Python development.",
      icon: "/icons/python-icon.png",
      level: "Beginner",
      totalLessons: 24,
      completedLessons: 8,
      estimatedTime: "6-8 weeks",
      progress: 35
    },
    2: {
      id: 2,
      title: "HTML & CSS Foundations",
      description: "Build the foundation of web development with HTML structure and CSS styling magic. Learn to create beautiful and responsive web pages from scratch.",
      icon: "/icons/html-icon.png",
      level: "Beginner",
      totalLessons: 18,
      completedLessons: 18,
      estimatedTime: "4-5 weeks",
      progress: 100
    },
    3: {
      id: 3,
      title: "JavaScript Adventures",
      description: "Embark on dynamic adventures with JavaScript and bring your web pages to life. Master the language that powers the modern web.",
      icon: "/icons/js-icon.png",
      level: "Intermediate",
      totalLessons: 32,
      completedLessons: 0,
      estimatedTime: "8-10 weeks",
      progress: 0
    },
    4: {
      id: 4,
      title: "React Kingdom",
      description: "Rule the React kingdom and build powerful, interactive user interfaces. Learn the most popular frontend framework in the industry.",
      icon: "/icons/react-icon.png",
      level: "Advanced",
      totalLessons: 28,
      completedLessons: 0,
      estimatedTime: "10-12 weeks",
      progress: 0
    },
    5: {
      id: 5,
      title: "Database Dungeons",
      description: "Navigate through database dungeons and master the art of data storage and retrieval. Learn SQL and database design principles.",
      icon: "/icons/database-icon.png",
      level: "Intermediate",
      totalLessons: 20,
      completedLessons: 12,
      estimatedTime: "6-7 weeks",
      progress: 60
    },
    6: {
      id: 6,
      title: "Algorithm Arena",
      description: "Battle in the algorithm arena and sharpen your problem-solving skills. Master data structures and algorithms for technical interviews.",
      icon: "/icons/algorithm-icon.png",
      level: "Advanced",
      totalLessons: 25,
      completedLessons: 0,
      estimatedTime: "8-10 weeks",
      progress: 0
    }
  }[courseId] || {
    id: 1,
    title: "Course Not Found",
    description: "The requested course could not be found.",
    icon: "/icons/knight_icon.png",
    level: "Beginner",
    totalLessons: 0,
    completedLessons: 0,
    estimatedTime: "N/A",
    progress: 0
  });

  // Sample lessons data
  const [lessons] = useState([
    {
      id: 1,
      title: "Introduction to Python",
      description: "Learn the basics of Python programming language and set up your development environment.",
      duration: "15 min",
      difficulty: 1,
      status: "completed"
    },
    {
      id: 2,
      title: "Variables and Data Types",
      description: "Understand different data types in Python and how to work with variables.",
      duration: "20 min",
      difficulty: 1,
      status: "completed"
    },
    {
      id: 3,
      title: "Control Flow and Loops",
      description: "Master if statements, loops, and control the flow of your Python programs.",
      duration: "25 min",
      difficulty: 2,
      status: "completed"
    },
    {
      id: 4,
      title: "Functions and Modules",
      description: "Create reusable code with functions and organize your code with modules.",
      duration: "30 min",
      difficulty: 2,
      status: "available"
    },
    {
      id: 5,
      title: "Object-Oriented Programming",
      description: "Learn classes, objects, and the principles of object-oriented programming.",
      duration: "40 min",
      difficulty: 3,
      status: "locked"
    },
    {
      id: 6,
      title: "Error Handling",
      description: "Handle errors gracefully and write robust Python applications.",
      duration: "25 min",
      difficulty: 2,
      status: "locked"
    },
    {
      id: 7,
      title: "File Operations",
      description: "Read from and write to files, work with different file formats.",
      duration: "30 min",
      difficulty: 2,
      status: "locked"
    },
    {
      id: 8,
      title: "Libraries and Packages",
      description: "Explore the Python ecosystem and use external libraries in your projects.",
      duration: "35 min",
      difficulty: 3,
      status: "locked"
    }
  ]);

  // Disabled sparkle effect for performance
  // useEffect(() => {
  //   // Sparkle effect on lesson cards
  //   const lessonCards = document.querySelectorAll(".lesson-card");
    
  //   const handleMouseMove = (e, card) => {
  //     if (card.classList.contains('locked')) return;
      
  //     const rect = card.getBoundingClientRect();
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;

  //     const sparkle = document.createElement("div");
  //     sparkle.className = "sparkle";
  //     sparkle.style.position = "absolute";
  //     sparkle.style.left = x + "px";
  //     sparkle.style.top = y + "px";
  //     sparkle.style.width = "3px";
  //     sparkle.style.height = "3px";
  //     sparkle.style.background = "var(--primary-gold)";
  //     sparkle.style.borderRadius = "50%";
  //     sparkle.style.pointerEvents = "none";
  //     sparkle.style.animation = "sparkleAnimation 1s ease-out forwards";
  //     sparkle.style.zIndex = "10";
  //     card.appendChild(sparkle);

  //     setTimeout(() => sparkle.remove(), 1000);
  //   };

  //   lessonCards.forEach(card => {
  //     const boundHandleMouseMove = (e) => handleMouseMove(e, card);
  //     card.addEventListener("mousemove", boundHandleMouseMove);
      
  //     card._cleanup = () => {
  //       card.removeEventListener("mousemove", boundHandleMouseMove);
  //     };
  //   });

  //   return () => {
  //     lessonCards.forEach(card => {
  //       if (card._cleanup) {
  //         card._cleanup();
  //       }
  //     });
  //   };
  // }, []);

  const handleBackToMenu = () => {
    navigate("/main-menu");
  };

  const handleLessonClick = (lesson) => {
    if (lesson.status === "locked") return;
    
    // Here you would navigate to the lesson content
    console.log(`Starting lesson: ${lesson.title}`);
    // navigate(`/lesson/${lesson.id}`);
  };

  const getDifficultyStars = (difficulty) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`fas fa-star ${i <= difficulty ? '' : 'empty'}`}
        ></i>
      );
    }
    return stars;
  };

  const getLessonIcon = (status) => {
    switch (status) {
      case "completed":
        return <i className="fas fa-check"></i>;
      case "locked":
        return <i className="fas fa-lock"></i>;
      default:
        return lessons.findIndex(l => l.id === lessons.find(l => l.status === "available")?.id) + 1;
    }
  };

  return (
    <div className="course-screen-container">
      <div className="course-background"></div>

      {/* Navigation */}
      <nav className="course-navbar">
        <div className="course-nav-container">
          <button className="back-btn" onClick={handleBackToMenu}>
            <i className="fas fa-arrow-left"></i> Back to Academy
          </button>
          <h1 className="course-nav-title">{course.title}</h1>
          <div className="course-nav-right">
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              className="user-avatar"
              onError={(e) => {
                e.target.src = "/icons/knight_icon.png";
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="course-content">
        {/* Course Header */}
        <section className="course-header">
          <img 
            src={course.icon} 
            alt={`${course.title} Icon`} 
            className="course-icon-large"
            onError={(e) => {
              e.target.src = "/icons/knight_icon.png";
            }}
          />
          <h1 className="course-main-title">{course.title}</h1>
          <p className="course-main-description">{course.description}</p>
          
          <div className="course-stats">
            <div className="stat-item">
              <div className="stat-number">{course.totalLessons}</div>
              <div className="stat-label">Total Lessons</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{course.completedLessons}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{course.estimatedTime}</div>
              <div className="stat-label">Duration</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{course.level}</div>
              <div className="stat-label">Difficulty</div>
            </div>
          </div>

          <div className="overall-progress">
            <div className="progress-header">
              <h3 className="progress-title">Quest Progress</h3>
              <span className="progress-percentage">{course.progress}%</span>
            </div>
            <div className="progress-bar-large">
              <div 
                className="progress-fill-large" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Lessons Section */}
        <section className="lessons-section">
          <div className="lessons-header">
            <h2 className="lessons-title">Quest Chapters</h2>
            <p className="lessons-description">
              Complete each chapter in order to master the skills and unlock the next adventure.
            </p>
          </div>

          <div className="lessons-grid">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className={`lesson-card ${lesson.status}`}
                onClick={() => handleLessonClick(lesson)}
              >
                <div className="lesson-number">
                  {getLessonIcon(lesson.status)}
                </div>
                
                <div className="lesson-info">
                  <h3 className="lesson-title">{lesson.title}</h3>
                  <p className="lesson-description">{lesson.description}</p>
                  
                  <div className="lesson-meta">
                    <div className="lesson-duration">
                      <i className="fas fa-clock"></i>
                      <span>{lesson.duration}</span>
                    </div>
                    
                    <div className="lesson-difficulty">
                      <i className="fas fa-star"></i>
                      <div className="difficulty-stars">
                        {getDifficultyStars(lesson.difficulty)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`lesson-status ${lesson.status}`}>
                  {lesson.status === "completed" && (
                    <><i className="fas fa-check"></i> Completed</>
                  )}
                  {lesson.status === "available" && (
                    <><i className="fas fa-play"></i> Start</>
                  )}
                  {lesson.status === "locked" && (
                    <><i className="fas fa-lock"></i> Locked</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-sword"></div>
        <div className="floating-shield"></div>
        <div className="floating-gem"></div>
        <div className="floating-scroll"></div>
      </div>
    </div>
  );
}