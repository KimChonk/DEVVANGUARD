import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/supabaseClient";
import LoadingNotification from "../../components/LoadingNotification";
import "../../assets/CSS/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingNotification, setShowLoadingNotification] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("connecting");

  useEffect(() => {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const validatePassword = () => {
      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match");
      } else if (confirmPassword) {
        confirmPassword.setCustomValidity("");
      }
    };

    password?.addEventListener("change", validatePassword);
    confirmPassword?.addEventListener("keyup", validatePassword);

    return () => {
      password?.removeEventListener("change", validatePassword);
      confirmPassword?.removeEventListener("keyup", validatePassword);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setShowLoadingNotification(true);
    setLoadingStatus("connecting");

    if (!formData.email.trim()) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Please enter your email");
      return;
    }

    if (formData.password.length < 6) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Passwords do not match");
      return;
    }

    if (!formData.terms) {
      setIsSubmitting(false);
      setShowLoadingNotification(false);
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setTimeout(async () => {
      try {
        const result = await authService.signUp(formData.email, formData.password);

        if (result.success) {
          setLoadingStatus("completed");
          
          setTimeout(() => {
            setShowLoadingNotification(false);
            setIsSubmitting(false);
            setError("");
            setFormData({ email: "", password: "", confirmPassword: "" });
            alert("Registration successful! Please check your email to verify your account before logging in.");
            navigate("/login");
          }, 1500);
        } else {
          setLoadingStatus("connecting");
          setShowLoadingNotification(false);
          setIsSubmitting(false);
          setError(result.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        setShowLoadingNotification(false);
        setIsSubmitting(false);
        setError("An error occurred during registration. Please try again.");
        console.error("Register error:", err);
      }
    }, 2000);
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
                value={formData.email}
                onChange={handleInputChange}
                required 
                disabled={isSubmitting}
              />
              <div className="input-glow"></div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="form-input" 
                  placeholder="Create password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting}
                />
                <div className="input-glow"></div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="form-input" 
                  placeholder="Confirm password" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting}
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="terms" 
                  checked={formData.terms}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting}
                />
                <span className="checkmark"></span>
                I agree to the <a href="/terms-of-service" className="terms-link" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy-policy" className="terms-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? "Registering..." : "Begin Your Adventure"}</span>
              <div className="btn-glow"></div>
            </button>
          </form>

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

      {/* Loading Notification */}
      <LoadingNotification 
        isVisible={showLoadingNotification}
        status={loadingStatus}
        onClose={() => setShowLoadingNotification(false)}
      />
    </div>
  );
}
