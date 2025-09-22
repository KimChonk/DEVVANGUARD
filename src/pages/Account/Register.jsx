import { useEffect } from "react";
import "../../assets/CSS/auth.css";

export default function Register() {
  useEffect(() => {
    const authCard = document.querySelector(".auth-card");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    if (!authCard) return;

    // ✨ Sparkle effect
    const handleMouseMove = (e) => {
      const rect = authCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = x + "px";
      sparkle.style.top = y + "px";
      authCard.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1000);
    };

    authCard.addEventListener("mousemove", handleMouseMove);

    // 🔒 Password confirmation validation
    const validatePassword = () => {
      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords don't match");
      } else if (confirmPassword) {
        confirmPassword.setCustomValidity("");
      }
    };

    password?.addEventListener("change", validatePassword);
    confirmPassword?.addEventListener("keyup", validatePassword);

    return () => {
      authCard.removeEventListener("mousemove", handleMouseMove);
      password?.removeEventListener("change", validatePassword);
      confirmPassword?.removeEventListener("keyup", validatePassword);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-background"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/icons/knight_icon.png" alt="Knight Icon" className="logo-icon" />
            <span className="logo-text">
              Dev <span className="highlight">Vanguard</span>
            </span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/login" className="nav-link">Login</a>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="auth-content">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-icon">
              <img src="/icons/knight_icon.png" alt="Knight Icon" />
            </div>
            <h1 className="auth-title">Join the Vanguard!</h1>
            <p className="auth-subtitle">Begin your epic coding journey</p>
          </div>

          <form className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input type="text" id="firstName" name="firstName" className="form-input" placeholder="Your first name" required />
                <div className="input-glow"></div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input type="text" id="lastName" name="lastName" className="form-input" placeholder="Your last name" required />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input type="email" id="email" name="email" className="form-input" placeholder="Enter your email" required />
              <div className="input-glow"></div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">Knight Name (Username)</label>
              <input type="text" id="username" name="username" className="form-input" placeholder="Choose your knight name" required />
              <div className="input-glow"></div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" id="password" name="password" className="form-input" placeholder="Create password" required />
                <div className="input-glow"></div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-input" placeholder="Confirm password" required />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="experience" className="form-label">Coding Experience Level</label>
              <select id="experience" name="experience" className="form-select" required>
                <option value="">Choose your level</option>
                <option value="beginner">Novice Apprentice</option>
                <option value="intermediate">Skilled Warrior</option>
                <option value="advanced">Master Knight</option>
                <option value="expert">Legendary Champion</option>
              </select>
              <div className="input-glow"></div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" name="terms" required />
                <span className="checkmark"></span>
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
              <label className="checkbox-container">
                <input type="checkbox" name="newsletter" />
                <span className="checkmark"></span>
                Send me updates about new quests and features
              </label>
            </div>

            <button type="submit" className="auth-btn">
              <span>Begin Your Adventure</span>
              <div className="btn-glow"></div>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button className="social-btn google-btn">
              {/* Google SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
            <button className="social-btn github-btn">
              {/* GitHub SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign up with GitHub
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <a href="/login" className="auth-link">Enter the Realm</a>
            </p>
          </div>
        </div>
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
