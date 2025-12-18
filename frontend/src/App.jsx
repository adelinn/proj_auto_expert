import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";
import LoginSignup from "./pages/LoginSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Questions from "./pages/Questions";

function App() {
  return (
    <Router>
      <NeonBlobsBackground />
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginSignup initialMode="login" />} />
        <Route path="/signup" element={<LoginSignup initialMode="signup" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/questions" element={<Questions />} />
        {/* <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} /> */}
      </Routes>


    </Router>
  );
}

export default App;
