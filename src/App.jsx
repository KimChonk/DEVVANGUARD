import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import BackToTop from "./components/BackToTop";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/course/:courseId" element={<CourseScreen />} />
        <Route path="/lesson/:lessonId" element={<LessonScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/leaderboards" element={<LeaderboardScreen />} />
      </Routes>
      <BackToTop />
    </BrowserRouter>
  );
}

export default App;
