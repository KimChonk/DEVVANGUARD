import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/supabaseClient";
import { userService } from "../../services/apiClient";
import LoadingNotification from "../../components/LoadingNotification";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [showLoadingNotification, setShowLoadingNotification] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("connecting");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

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
          setShowLoadingNotification(false);
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setShowLoadingNotification(false);
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)"
    }}>
      <LoadingNotification
        isVisible={showLoadingNotification}
        status={loadingStatus}
        onClose={() => setShowLoadingNotification(false)}
      />
    </div>
  );
}
