import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/supabaseClient";
import { userService } from "../../services/apiClient";
import LoadingNotification from "../../components/LoadingNotification";
import "../../assets/CSS/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingNotification, setShowLoadingNotification] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("connecting"); // "connecting" or "completed"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setShowLoadingNotification(true);
    setLoadingStatus("connecting");

    // Validate input data
    if (!email.trim()) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Please enter your email");
      return;
    }

    if (!password) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Please enter your password");
      return;
    }

    // Keep connecting state for 2 seconds
    setTimeout(async () => {
      try {
        const result = await authService.signIn(email, password);

        if (result.success) {
          // Show completed gif
          setLoadingStatus("completed");
          
          // Fetch user profile to check role
          try {
            const session = await authService.getSession();
            if (session?.user?.id) {
              const userData = await userService.getUserProfile(session.user.id);
              const role = userData?.data?.role || 'user';
              const redirectPath = role === 'admin' ? '/admin' : '/main-menu';
              
              // Wait for completed animation + 1.5 seconds then navigate
              setTimeout(() => {
                setShowLoadingNotification(false);
                setIsSubmitting(false);
                navigate(redirectPath);
              }, 1500);
            }
          } catch (profileErr) {
            setTimeout(() => {
              setShowLoadingNotification(false);
              setIsSubmitting(false);
              navigate("/main-menu");
            }, 1500);
          }
        } else {
          // Login failed - show error
          setLoadingStatus("connecting");
          setShowLoadingNotification(false);
          setIsSubmitting(false);
          setError(result.message);
        }
      } catch (err) {
        setShowLoadingNotification(false);
        setIsSubmitting(false);
        setError("An error occurred during login. Please try again.");
        console.error("Login error:", err);
      }
    }, 2000);
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsSubmitting(true);
      setShowLoadingNotification(true);
      setLoadingStatus("connecting");

      const result = await authService.signInWithOAuth(provider);

      if (result.success) {
        setLoadingStatus("completed");
        const session = await authService.getSession();
        
        if (session?.user?.id) {
          try {
            const userData = await userService.getUserProfile(session.user.id);
            const role = userData?.data?.role || 'user';
            const redirectPath = role === 'admin' ? '/admin' : '/main-menu';
            
            setTimeout(() => {
              setShowLoadingNotification(false);
              setIsSubmitting(false);
              navigate(redirectPath);
            }, 1500);
          } catch (err) {
            setTimeout(() => {
              setShowLoadingNotification(false);
              setIsSubmitting(false);
              navigate("/main-menu");
            }, 1500);
          }
        }
      } else {
        setShowLoadingNotification(false);
        setIsSubmitting(false);
        setError("Failed to login with " + provider);
      }
    } catch (err) {
      setShowLoadingNotification(false);
      setIsSubmitting(false);
      setError("An error occurred during login.");
    }
  };

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
            <a href="/register" className="nav-link">Register</a>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <img src="/icons/knight_icon.png" alt="Knight Icon" />
            </div>
            <h1 className="auth-title">Welcome Back, Knight!</h1>
            <p className="auth-subtitle">Continue your coding adventure</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: "rgba(255, 107, 107, 0.1)" }}>{error}</div>}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-input" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isSubmitting}
              />
              <div className="input-glow"></div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="form-input" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isSubmitting}
              />
              <div className="input-glow"></div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" name="remember" disabled={isSubmitting} />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? "Logging in..." : "Enter the Realm"}</span>
              <div className="btn-glow"></div>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn google-btn" disabled={isSubmitting} onClick={() => handleSocialLogin("google")}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" className="social-btn facebook-btn" disabled={isSubmitting} onClick={() => handleSocialLogin("facebook")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="auth-footer">
            <p>
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
      </div>

      {/* Loading Notification */}
      <LoadingNotification 
        isVisible={showLoadingNotification}
        status={loadingStatus}
        onClose={() => setShowLoadingNotification(false)}
      />
    </div>
  );
}
