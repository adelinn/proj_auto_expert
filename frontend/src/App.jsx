import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";
import LoginSignup from "./pages/LoginSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Questions from "./pages/Questions";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAllowedDomains from "./pages/AdminAllowedDomains";
import RequireAdmin from "./components/RequireAdmin";

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  return (
    <Router>
      <NeonBlobsBackground />
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginSignup initialMode="login" />} />
        <Route path="/signup" element={<LoginSignup initialMode="signup" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/questions" element={<Questions />} />

        {/* Protected pages */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/admin/allowed-domains" element={
          <ProtectedRoute>
            <RequireAdmin user={getUser()}>
              <AdminAllowedDomains token={getUser()?.token} />
            </RequireAdmin>
          </ProtectedRoute>
        } />
      </Routes>


    </Router>
  );
}

export default App;
