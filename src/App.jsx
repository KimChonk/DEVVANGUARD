import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Intro from "./pages/intro";
import Login from "./pages/Account/Login";
import Register from "./pages/Account/Register";
import ForgotPassword from "./pages/Account/ForgotPassword";
import MainMenu from "./pages/Menu/MainMenu";
import CourseScreen from "./pages/Course/CourseScreen";
import LessonScreen from "./pages/Lesson/LessonScreen";
import ProfileScreen from "./pages/Profile/ProfileScreen";
import LeaderboardScreen from "./pages/Leaderboard/LeaderboardScreen";
import DashboardScreen from "./pages/Dashboard/DashboardScreen";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PvPLobby from "./pages/PvP/PvPLobby";
import PvPBattle from "./pages/PvP/PvPBattle";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          
          {/* Protected Routes - User */}
          <Route 
            path="/main-menu" 
            element={
              <ProtectedRoute>
                <MainMenu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId" 
            element={
              <ProtectedRoute>
                <CourseScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lesson/:lessonId" 
            element={
              <ProtectedRoute>
                <LessonScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboards" 
            element={
              <ProtectedRoute>
                <LeaderboardScreen />
              </ProtectedRoute>
            } 
          />

          {/* PvP Routes */}
          <Route 
            path="/pvp/lobby" 
            element={
              <ProtectedRoute>
                <PvPLobby />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pvp/battle/:matchId" 
            element={
              <ProtectedRoute>
                <PvPBattle />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
