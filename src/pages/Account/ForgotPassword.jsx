import { useEffect } from "react";
import "../../assets/CSS/auth.css";

export default function ForgotPassword() {
  useEffect(() => {
    // Magical sparkle effect
    const authCard = document.querySelector(".auth-card");
    if (!authCard) return;

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

    return () => {
      authCard.removeEventListener("mousemove", handleMouseMove);
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
            <a href="/register" className="nav-link">Register</a>
          </div>
        </div>
      </nav>

      {/* Forgot Password Form */}
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <img src="/icons/knight_icon.png" alt="Knight Icon" />
            </div>
            <h1 className="auth-title">Forgotten the Way?</h1>
            <p className="auth-subtitle">Let us guide you back to your adventure</p>
          </div>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-input" 
                placeholder="Enter your email address" 
                required 
              />
              <div className="input-glow"></div>
            </div>

            <button type="submit" className="auth-btn">
              <span>Send Recovery Scroll</span>
              <div className="btn-glow"></div>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-footer">
            <p>
              Remember your password?{" "}
              <a href="/login" className="auth-link">Return to Login</a>
            </p>
            <p style={{ marginTop: "10px" }}>
              Don't have an account?{" "}
              <a href="/register" className="auth-link">Join the Adventure</a>
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