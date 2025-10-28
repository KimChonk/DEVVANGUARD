import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/supabaseClient";
import "../../assets/CSS/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState("request"); // "request" or "reset"
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Kiểm tra nếu người dùng quay lại từ email reset link
  const resetToken = searchParams.get("type") === "recovery";

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        setSuccessMessage(result.message);
        setEmail("");
        // Có thể chuyển sang step "reset" nếu cần
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Reset password request error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không trùng khớp");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.success) {
        setSuccessMessage(result.message);
        setNewPassword("");
        setConfirmPassword("");
        // Đợi 2 giây rồi điều hướng về login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
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
            <h1 className="auth-title">
              {resetToken || step === "reset" ? "Tạo Mật Khẩu Mới" : "Quên Mật Khẩu?"}
            </h1>
            <p className="auth-subtitle">
              {resetToken || step === "reset" 
                ? "Nhập mật khẩu mới cho tài khoản của bạn" 
                : "Chúng tôi sẽ giúp bạn khôi phục quyền truy cập"}
            </p>
          </div>

          {/* Bước 1: Yêu cầu khôi phục */}
          {(step === "request" && !resetToken) && (
            <form className="auth-form" onSubmit={handleResetRequest}>
              {error && <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: "rgba(255, 107, 107, 0.1)" }}>{error}</div>}
              {successMessage && <div className="success-message" style={{ color: "#51cf66", marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: "rgba(81, 207, 102, 0.1)" }}>{successMessage}</div>}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="form-input" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={loading}
                />
                <div className="input-glow"></div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                <span>{loading ? "Đang gửi..." : "Send Recovery Scroll"}</span>
                <div className="btn-glow"></div>
              </button>
            </form>
          )}

          {/* Bước 2: Đặt lại mật khẩu */}
          {(resetToken || step === "reset") && (
            <form className="auth-form" onSubmit={handlePasswordReset}>
              {error && <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: "rgba(255, 107, 107, 0.1)" }}>{error}</div>}
              {successMessage && <div className="success-message" style={{ color: "#51cf66", marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: "rgba(81, 207, 102, 0.1)" }}>{successMessage}</div>}

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">Mật Khẩu Mới</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  className="form-input" 
                  placeholder="Nhập mật khẩu mới" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
                <div className="input-glow"></div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Xác Nhận Mật Khẩu</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="form-input" 
                  placeholder="Xác nhận mật khẩu mới" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
                <div className="input-glow"></div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                <span>{loading ? "Đang cập nhật..." : "Update Password"}</span>
                <div className="btn-glow"></div>
              </button>
            </form>
          )}

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