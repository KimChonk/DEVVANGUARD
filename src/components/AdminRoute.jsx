import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * AdminRoute Component
 * Chỉ cho phép access nếu user có role = 'admin'
 * Nếu không thì redirect về /main-menu
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#e8e8e8',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>🔐 Kiểm tra quyền...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa login hoặc không phải admin thì redirect về main-menu
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/main-menu" replace />;
  }

  return children;
}
