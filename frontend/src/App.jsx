import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";
import LoginSignup from "./pages/LoginSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Questions from "./pages/Questions";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <NeonBlobsBackground />
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginSignup initialMode="login" />} />
        <Route path="/signup" element={<LoginSignup initialMode="signup" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="*" element={<Navigate to="/home" replace />} />

        {/* Protected pages */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      </Routes>


    </Router>
  );
}

export default App;
