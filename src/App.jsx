import { BrowserRouter, Routes, Route } from "react-router-dom";
import Intro from "./pages/intro";
import Login from "./pages/Account/Login";
import Register from "./pages/Account/Register";
import ForgotPassword from "./pages/Account/ForgotPassword";
import MainMenu from "./pages/Menu/MainMenu";
import CourseScreen from "./pages/Course/CourseScreen";
import LessonScreen from "./pages/Lesson/LessonScreen";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
