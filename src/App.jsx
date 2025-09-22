import { BrowserRouter, Routes, Route } from "react-router-dom";
import Intro from "./pages/intro";
import Login from "./pages/Account/Login";
import Register from "./pages/Account/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
