import { useState, useEffect, useContext, createContext } from "react";
import { authService } from "../services/supabaseClient";
import { userService } from "../services/apiClient";

// Tạo Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Kiểm tra session khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role từ API
          try {
            const userData = await userService.getUserProfile(session.user.id);
            setUserRole(userData?.data?.role || 'user');
          } catch (err) {
            console.warn("Could not fetch user role:", err);
            setUserRole('user');
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Lắng nghe thay đổi trạng thái xác thực
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch role khi auth state thay đổi
        userService.getUserProfile(session.user.id)
          .then(userData => setUserRole(userData?.data?.role || 'user'))
          .catch(err => {
            console.warn("Could not fetch user role:", err);
            setUserRole('user');
          });
      } else {
        setUser(null);
        setUserRole(null);
      }
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    userRole,
    isAdmin: userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
