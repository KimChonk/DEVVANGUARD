import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/supabaseClient";
import { userService } from "../../services/apiClient";
import LoadingNotification from "../../components/LoadingNotification";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLoadingNotification, setShowLoadingNotification] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("connecting");
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for OAuth error in URL parameters
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          console.error("OAuth Error:", errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setShowLoadingNotification(false);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get the current session
        const session = await authService.getSession();

        if (session?.user?.id) {
          // User is authenticated
          setLoadingStatus("completed");

          try {
            // Fetch user profile to check role
            const userData = await userService.getUserProfile(session.user.id);
            const role = userData?.data?.role || 'user';
            const redirectPath = role === 'admin' ? '/admin' : '/main-menu';

            // Wait for completed animation then navigate
            setTimeout(() => {
              setShowLoadingNotification(false);
              navigate(redirectPath);
            }, 1500);
          } catch (err) {
            console.error("Error fetching user profile:", err);
            // Navigate to main menu even if profile fetch fails
            setTimeout(() => {
              setShowLoadingNotification(false);
              navigate("/main-menu");
            }, 1500);
          }
        } else {
          // No session, redirect to login
          console.warn("No session found after OAuth callback");
          setShowLoadingNotification(false);
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication failed");
        setShowLoadingNotification(false);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)"
    }}>
      {error ? (
        <div style={{
          color: "#ff6b6b",
          fontSize: "18px",
          textAlign: "center",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          border: "1px solid #ff6b6b",
          maxWidth: "400px"
        }}>
          <p><strong>Authentication Error</strong></p>
          <p>{error}</p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>Redirecting to login...</p>
        </div>
      ) : (
        <LoadingNotification
          isVisible={showLoadingNotification}
          status={loadingStatus}
          onClose={() => setShowLoadingNotification(false)}
        />
      )}
    </div>
  );
}
