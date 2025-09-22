import React, { useEffect } from "react";
import "../assets/CSS/intro.css"; // Import CSS

export default function Intro() {
  useEffect(() => {
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

    return () => {
      links.forEach(anchor => {
        anchor.removeEventListener("click", () => {});
      });
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="overlay"></div>
        <nav className="navbar">
          <div className="navbar-container">
            <a href="#" className="logo">
              <img src="/icons/knight_icon.png" alt="DevVanguard Knight" className="logo-icon" />
              Dev<span>Vanguard</span>
            </a>
            <div className="nav-links">
              <a href="#courses">Courses</a>
              <a href="#features">Features</a>
              <a href="#developers">Our Wizards</a>
              <a href="#stats">Kingdom Stats</a>
            </div>
          </div>
        </nav>

        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title" style={{ textAlign: "center" }}>
              BE THE MIGHTY CODEKNIGHT LEADING THE FUTURE OF CODE
            </h1>
            <h2 className="hero-subtitle" style={{ textAlign: "center" }}>
              Commence a grand odyssey through the timeless realms of programming
            </h2>
            <p className="hero-description" style={{ textAlign: "center" }}>
              Welcome to Dev Vanguard, where learning to code becomes an adventure! Navigate through challenging terrains of algorithms,
              conquer the mountains of data structures, and discover the hidden treasures of programming languages.
              Your quest to become a coding master starts here ~
            </p>
            <div style={{ textAlign: "center" }}>
              <a href="/login" className="btn">Start Your Adventure</a>
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
            <button className="filter-btn active">Popular</button>
            <button className="filter-btn">Web Development</button>
            <button className="filter-btn">Data Science</button>
            <button className="filter-btn">Tools</button>
          </div>

          <div className="courses-grid">
            <div className="course-card">
              <div className="course-image" style={{ backgroundImage: "url('/images/python_course.jpg')" }}></div>
              <div className="course-content">
                <span className="course-label">COURSE</span>
                <h3 className="course-title">Python</h3>
                <p className="course-description">
                  Learn programming fundamentals such as variables, control flow, and loops with the powerful Python language.
                </p>
                <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
              </div>
            </div>

            <div className="course-card">
              <div className="course-image" style={{ backgroundImage: "url('/images/html_course.jpg')" }}></div>
              <div className="course-content">
                <span className="course-label">COURSE</span>
                <h3 className="course-title">HTML</h3>
                <p className="course-description">
                  Create your first website with HTML, the building blocks of the web and dive into the world of markup.
                </p>
                <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
              </div>
            </div>

            <div className="course-card">
              <div className="course-image" style={{ backgroundImage: "url('/images/css_course.jpg')" }}></div>
              <div className="course-content">
                <span className="course-label">COURSE</span>
                <h3 className="course-title">CSS</h3>
                <p className="course-description">
                  Learn to use CSS selectors and properties to stylize your HTML pages with colors, fonts, and layouts.
                </p>
                <span className="course-level"><i className="fas fa-star"></i> BEGINNER</span>
              </div>
            </div>
          </div>

          <a href="#" className="btn btn-secondary">
            Explore All Courses <i className="fas fa-arrow-right"></i>
          </a>
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
            <p>&copy; 2024 DevVanguard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
