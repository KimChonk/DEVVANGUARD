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
import EditProfile from "./pages/Profile/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/course/:courseId" element={<CourseScreen />} />
        <Route path="/lesson/:lessonId" element={<LessonScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/leaderboards" element={<LeaderboardScreen />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
