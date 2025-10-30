import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Intro from "./pages/intro";
import Login from "./pages/Account/Login";
import Register from "./pages/Account/Register";
import ForgotPassword from "./pages/Account/ForgotPassword";
import MainMenu from "./pages/Menu/MainMenu";
import CourseScreen from "./pages/Course/CourseScreen";
import LessonScreen from "./pages/Lesson/LessonScreen";
import ProfileScreen from "./pages/Profile/ProfileScreen";
import LeaderboardScreen from "./pages/Leaderboard/LeaderboardScreen";
import EditProfile from "./pages/Profile/EditProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route 
            path="/main-menu" 
            element={
              <ProtectedRoute>
                <MainMenu />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
