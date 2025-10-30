import { useState, useEffect, useContext, createContext } from "react";
import { authService } from "../services/supabaseClient";

// Tạo Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra session khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        setUser(session?.user || null);
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
      setUser(session?.user || null);
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
