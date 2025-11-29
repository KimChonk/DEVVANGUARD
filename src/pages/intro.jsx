import React, { useEffect, useState, useRef } from "react";
import "../assets/CSS/intro.css"; // Import CSS

export default function Intro() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Popular');

  const gridContainerRef = useRef(null);
  const activeGridRef = useRef(null);

  useEffect(() => {
  if (gridContainerRef.current && activeGridRef.current) {
    const height = activeGridRef.current.offsetHeight; 

    gridContainerRef.current.style.height = `${height}px`;
  }
}, [activeFilter]);

  useEffect(() => {

    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    const handleHeroMouseMove = (e) => {
        if (!heroContent) return;

        // Lấy vị trí chuột (từ 0.0 đến 1.0)
        const xPercent = e.clientX / window.innerWidth - 0.5;
        const yPercent = e.clientY / window.innerHeight - 0.5;

        // Tính toán độ dịch chuyển (dịch chuyển tối đa 20px)
        const xMove = xPercent * -20; // Dịch chuyển ngược
        const yMove = yPercent * -20; // Dịch chuyển ngược

        // Dùng transform để di chuyển
        heroContent.style.transform = `translate(${xMove}px, ${yMove}px)`;
    };

    hero.addEventListener('mousemove', handleHeroMouseMove);

    // Scroll animation giống script trong HTML
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections and cards for scroll animations
    const elementsToAnimate = document.querySelectorAll(
      '.courses-section, .features-section, .why-choose-section, .developers-section, .stats-section, .cta-section, .footer, .why-feature-main, .why-feature-sub-item, ' +
      '.course-card, .feature-card, .developer-card, .stat-card'
    );
    
    elementsToAnimate.forEach(el => {
      el.classList.add('animate-element');
      observer.observe(el);
    });

    return () => {
      links.forEach(anchor => {
        anchor.removeEventListener("click", () => {});
      });
      observer.disconnect();
      hero.removeEventListener('mousemove', handleHeroMouseMove);
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="overlay"></div>

        <nav className="navbar">
          {/* 1. THANH NAVBAR (LOGO, LINKS DESKTOP, NÚT HAMBURGER) */}
          <div className="navbar-container">
            <a href="#" className="logo">
              <img src="/icons/knight_icon.png" alt="DevVanguard Knight" className="logo-icon" />
              Dev<span>Vanguard</span>
            </a>
            
            {/* 2. CÁC LINK CHO DESKTOP (Đây là phần bị thiếu) */}
            <div className="nav-links">
              <a href="#courses">Courses</a>
              <a href="#features">Features</a>
              <a href="#developers">Our Wizards</a>
              <a href="#stats">Kingdom Stats</a>
            </div>
            
            {/* 3. NÚT HAMBURGER (Chỉ hiện trên mobile) */}
            <button 
              className="hamburger-btn-intro" 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>

          {/* 4. MENU TRƯỢT RA CHO MOBILE (Tách riêng ra) */}
          <div className={`mobile-menu-intro ${isMobileMenuOpen ? 'open' : ''}`}>
            
            {/* Header của menu mobile */}
            <div className="mobile-menu-header-intro">
              <button className="mobile-menu-close-intro" onClick={() => setMobileMenuOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
              <span>Menu</span>
            </div>
            
            {/* Danh sách link của menu mobile */}
            <ul className="mobile-menu-list-intro">
              <li>
                <a href="#courses" onClick={() => setMobileMenuOpen(false)}>
                  <span><i className="fas fa-book-open icon-padding"></i> Courses</span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                  <span><i className="fas fa-star icon-padding"></i> Features</span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </a>
              </li>
              <li>
                <a href="#developers" onClick={() => setMobileMenuOpen(false)}>
                  <span><i className="fas fa-magic icon-padding"></i> Our Wizards</span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </a>
              </li>
              <li>
                <a href="#stats" onClick={() => setMobileMenuOpen(false)}>
                  <span><i className="fas fa-chart-bar icon-padding"></i> Kingdom Stats</span>
                  <i className="fas fa-chevron-right arrow-right"></i>
                </a>
              </li>
              <hr className="mobile-divider-intro" />
              <li>
                <a href="/login">
                  <span><i className="fas fa-sign-in-alt icon-padding"></i> Sign In</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container">
          <div className="hero-content">

            <h1 className="hero-title glow-text shine-text" style={{ textAlign: "center" }}>
              FORCE YOUR CODING LEGEND
            </h1>
            <p className="hero-description" style={{ textAlign: "center" }}>
              Welcome to Dev Vanguard, lets Conquer algorithms, scale mountains of data, and unlock the treasures of programming. Join the quest to become a coding master.
            </p>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <a href="/login" className="btn-legendary">
                <span className="btn-content">
                    <i className="fas fa-dungeon"></i> Start Your Adventure
                </span>
                <div className="btn-glow"></div>
              </a>
            </div>

            <div className="scroll-indicator">
              <p>Scroll to explore the realm</p>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <section id="courses" className="courses-section">
        <div className="section-container">
          <h2 className="section-title">Master the Ancient Arts of Coding</h2>
          <p className="section-subtitle">
            Learn to code with fun, interactive courses handcrafted by industry experts and educators.
          </p>

          <div className="filter-tabs">
            <button
              className={`filter-btn ${activeFilter === 'Popular' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Popular')}
            >
              Popular
            </button>
            <button
              className={`filter-btn ${activeFilter === 'Web Development' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Web Development')}
            >
              Web Development
            </button>
            <button
              className={`filter-btn ${activeFilter === 'Data Science' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Data Science')}
            >
              Data Science
            </button>
            <button
              className={`filter-btn ${activeFilter === 'Tools' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Tools')}
            >
              Tools
            </button>
          </div>

          <div className="courses-grid-container" ref={gridContainerRef}>
          {activeFilter === 'Popular' && (
            <div className="courses-grid">
              {/* Python */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/python_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">Python</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Learn programming fundamentals such as variables, control flow, and loops with the powerful Python language.
                  </p>
                </div>
              </div>
              {/* C# */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/csharp_course.png')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">C#</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Build powerful applications with C#, a versatile programming language for web, desktop, and mobile development.
                  </p>
                </div>
              </div>
              {/* C */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/c_course.png')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">C</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Master the fundamentals of programming with C, the foundation language that powers modern computing.
                  </p>
                </div>
              </div>
              {/* Java */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/java_course.png')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">Java</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Learn object-oriented programming with Java, one of the most popular languages for enterprise applications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- 2. Tab Web Development (NỘI DUNG MỚI) --- */}
          {activeFilter === 'Web Development' && (
            <div className="courses-grid">
              {/* HTML & CSS */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/html_css_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">HTML & CSS</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Build the foundation of all websites with HTML structure and CSS styling.
                  </p>
                </div>
              </div>
              {/* JavaScript */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/js_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">JavaScript</h3>
                  <span className="course-level"><i className="fas fa-star"></i> INTERMEDIATE</span>
                  <p className="course-description">
                    Bring your websites to life with the premier language of the web.
                  </p>
                </div>
              </div>
              {/* React */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/react_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">React</h3>
                  <span className="course-level"><i className="fas fa-star"></i> ADVANCED</span>
                  <p className="course-description">
                    Create powerful, component-based user interfaces with the React library.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- 3. Tab Data Science (NỘI DUNG MỚI) --- */}
          {activeFilter === 'Data Science' && (
            <div className="courses-grid">
              {/* SQL */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/sql_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">SQL</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Master the art of database querying, the most essential skill for data analysts.
                  </p>
                </div>
              </div>
              {/* Pandas */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/pandas_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">Pandas</h3>
                  <span className="course-level"><i className="fas fa-star"></i> INTERMEDIATE</span>
                  <p className="course-description">
                    Learn data manipulation and analysis in Python with the powerful Pandas library.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- 4. Tab Tools (NỘI DUNG MỚI) --- */}
          {activeFilter === 'Tools' && (
            <div className="courses-grid">
              {/* Git */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/git_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">Git</h3>
                  <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
                  <p className="course-description">
                    Control your project's history and collaborate with others using Git version control.
                  </p>
                </div>
              </div>
              {/* Docker */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('/images/docker_course.jpg')" }}></div>
                <div className="course-content">
                  <span className="course-label">COURSE</span>
                  <h3 className="course-title">Docker</h3>
                  <span className="course-level"><i className="fas fa-star"></i> ADVANCED</span>
                  <p className="course-description">
                    Containerize your applications for consistent environments, from development to production.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
          <div className="explore-courses-btn">
            <a href="/login" className="btn">
              Explore All Courses <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-map-marked-alt"></i></div>
              <h3 className="feature-title">Interactive Learning Path</h3>
              <p className="feature-description">
                Follow a carefully crafted path through coding concepts, with each lesson building upon the last.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-trophy"></i></div>
              <h3 className="feature-title">Achievement System</h3>
              <p className="feature-description">
                Earn badges and level up as you complete challenges and master new skills.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-users"></i></div>
              <h3 className="feature-title">Community Support</h3>
              <p className="feature-description">
                Join fellow adventurers on your coding journey and collaborate on quests together.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-laptop-code"></i></div>
              <h3 className="feature-title">Practice Your Coding Chops</h3>
              <p className="feature-description">
                Take your skills further with code challenges and project tutorials designed to help you apply what you learned.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-project-diagram"></i></div>
              <h3 className="feature-title">Build an Awesome Portfolio</h3>
              <p className="feature-description">
                Create your own interactive websites, mini-games, mobile apps, and data visualizations to showcase.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><i className="fas fa-graduation-cap"></i></div>
              <h3 className="feature-title">Level Up Your Learning</h3>
              <p className="feature-description">
                Gain XP and collect badges as you complete bite-sized lessons in Python, HTML, JavaScript, and more.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="why-choose" className="why-choose-section">
        <div className="section-container">
          {/* Tiêu đề và phụ đề */}
          <h2 className="section-title">Why Begin Your Quest?</h2>
          <p className="section-subtitle">
            Our realm is built to forge legendary developers. Here’s your arsenal.
          </p>

          <div className="why-choose-content">
            
            {/* === FEATURE ROW 1: Learning Path (Chữ trái, Hình phải) === */}
            <div className="why-feature-row">
              {/* CỘT TRÁI: TEXT */}
              <div className="why-feature-text">
                {/* Khối nội dung chính */}
                <div className="why-feature-main">
                  <div className="why-feature-title-wrapper">
                    <i className="fas fa-map-signs why-feature-icon"></i>
                    <h3 className="why-feature-title">Interactive Learning Path</h3>
                  </div>
                  <p className="why-feature-description">
                      Advance through your **Quest Log** from Newbie to Grandmaster. Each quest builds upon the last, ensuring you never feel lost.
                  </p>
                  <ul className="why-feature-checklist">
                      <li><i className="fas fa-check"></i> Guided quests and story-driven lessons (like "Magical Power"!).</li>
                      <li><i className="fas fa-check"></i> Unlock the next chapter of your adventure.</li>
                      <li><i className="fas fa-check"></i> Track all completed quests in your personal log.</li>
                  </ul>
                </div>

                {/* Khối nội dung phụ (giống "Batch Price Checking" trong Heta) */}
                <div className="why-feature-sub-items">
                  <div className="why-feature-sub-item">
                      <h4><i className="fas fa-book-reader"></i> Lore-Based Lessons</h4>
                      <p>Learn topics like "Variables" framed as "Magical Power" in engaging, story-driven quests.</p>
                  </div>
                  <div className="why-feature-sub-item">
                      <h4><i className="fas fa-magic"></i> Specialization Paths</h4>
                      <p>Focus your craft by filtering specialized paths like Python, Java, or C#.</p>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: IMAGE */}
              <div className="why-feature-image">
                <img src="/images/interactive_learning_path.jpg" alt="Interactive Learning Path" />
              </div>
            </div>

            {/* === FEATURE ROW 2: Achievements (Hình trái, Chữ phải) === */}
            {/* Thêm class "row-reverse" để đảo ngược */}
            <div className="why-feature-row row-reverse">
              {/* CỘT PHẢI: TEXT */}
              <div className="why-feature-text">
                <div className="why-feature-main">
                  <div className="why-feature-title-wrapper">
                    <i className="fas fa-trophy why-feature-icon"></i>
                    <h3 className="why-feature-title">Climb the Leaderboard</h3>
                  </div>
                  <p className="why-feature-description">
                    Stay motivated by earning XP from lessons, leveling up, and climbing the global Knight Leaderboard. Show off your rank!
                  </p>
                  <ul className="why-feature-checklist">
                    <li><i className="fas fa-check"></i> Compete for the #1 spot against other Knights.</li>
                    <li><i className="fas fa-check"></i> Gain XP for every lesson to fuel your progress.</li>
                    <li><i className="fas fa-check"></i> Advance from "Newbie" to "Apprentice" and beyond.</li>
                  </ul>
                </div>
                
                {/* Khối nội dung phụ (Đã cập nhật) */}
                <div className="why-feature-sub-items">
                  <div className="why-feature-sub-item">
                    <h4><i className="fas fa-hat-wizard"></i> Choose Your Avatar</h4>
                    <p>Select your unique avatar to represent you on the leaderboard.</p>
                  </div>
                  <div className="why-feature-sub-item">
                    <h4><i className="fas fa-users"></i> Guild System (Coming Soon)</h4>
                    <p>Join guilds to compete in group quests and leaderboards.</p>
                  </div>
                </div>
              </div>

              {/* CỘT TRÁI: IMAGE */}
              <div className="why-feature-image">
                <img src="/images/levelup-leaderboard.avif" alt="Climb the Leaderboard" />
              </div>
            </div>
            
            {/* === FEATURE ROW 3: Portfolio (Chữ trái, Hình phải) === */}
            <div className="why-feature-row">
              {/* CỘT TRÁI: TEXT */}
              <div className="why-feature-text">
                <div className="why-feature-main">
                  <div className="why-feature-title-wrapper">
                    {/* Đổi Icon sang cây búa rèn */}
                    <i className="fas fa-hammer why-feature-icon"></i>
                    <h3 className="why-feature-title">Forge & Fight: Projects & Arena</h3>
                  </div>
                  <p className="why-feature-description">
                    Apply your knowledge. Forge powerful "artifacts" (real projects) for your portfolio, then sharpen your algorithm skills in the Code Arena.
                  </p>
                  <ul className="why-feature-checklist">
                    <li><i className="fas fa-check"></i> Build guided projects to showcase your abilities.</li>
                    <li><i className="fas fa-check"></i> Practice live algorithm challenges in the Arena.</li>
                    <li><i className="fas fa-check"></i> Prove your skills through both building and problem-solving.</li>
                  </ul>
                </div>
                
                {/* Khối nội dung phụ (Đã cập nhật) */}
                <div className="why-feature-sub-items">
                  <div className="why-feature-sub-item">
                    <h4><i className="fas fa-project-diagram"></i> Project "Blueprints"</h4>
                    <p>Get starter templates for complex portfolio projects.</p>
                  </div>
                  <div className="why-feature-sub-item">
                    <h4><i className="fas fa-stopwatch"></i> Timed Challenges</h4>
                    <p>Test your speed and accuracy in timed Code Arena duels.</p>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: IMAGE */}
              <div className="why-feature-image">
                <img src="/images/coder-1vs1.jpeg" alt="Projects & Arena" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section id="developers" className="developers-section">
        <div className="section-container">
          <h2 className="section-title">The Wizards Behind the Magic</h2>
          <p className="section-subtitle">
            Meet our team of coding wizards who crafted this magical learning experience
          </p>
          <div className="developers-grid">
            <div className="developer-card">
              <div className="developer-image">
                <img src="/images/developer1.jpg" alt="Developer 1" />
              </div>
              <h3 className="developer-name">Quang Trung Nguyen</h3>
              <p className="developer-role">Archmage of Frontend</p>
              <p className="developer-quote">"The web is beautiful and full of endless possibilities."</p>
              <div className="developer-social">
                <a href="#"><i className="fab fa-github"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
              </div>
            </div>
            
            <div className="developer-card">
              <div className="developer-image">
                <img src="/images/developer2.jpg" alt="Developer 2" />
              </div>
              <h3 className="developer-name">Ja Chill</h3>
              <p className="developer-role">Backend Sorceress</p>
              <p className="developer-quote">"Every line of code is an incantation that brings digital worlds to life."</p>
              <div className="developer-social">
                <a href="#"><i className="fab fa-github"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
              </div>
            </div>
            
            <div className="developer-card">
              <div className="developer-image">
                <img src="/images/developer3.png" alt="Developer 3" />
              </div>
              <h3 className="developer-name">Trong Tran</h3>
              <p className="developer-role">Master of Data Structures</p>
              <p className="developer-quote">"The path to becoming a code wizard begins with curiosity and perseverance."</p>
              <div className="developer-social">
                <a href="https://github.com/KimChonk"><i className="fab fa-github"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
                <a href="https://www.facebook.com/TrongTranDev"><i className="fab fa-facebook"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">1,067,377</div>
              <div className="stat-label">Learners</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">192</div>
              <div className="stat-label">Countries</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">6m+</div>
              <div className="stat-label">Exercises</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">14,955</div>
              <div className="stat-label">Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2 className="cta-title">Ready to level up your coding skills?</h2>
          <a href="/login" className="btn btn-large">Start Learning for Free</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/icons/knight_icon.png" alt="DevVanguard Knight" className="logo-icon" />
              <span>Dev<span className="highlight">Vanguard</span></span>
            </div>
            <p className="footer-tagline">Embark on your coding quest today!</p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 DevVanguard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
