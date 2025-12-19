import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";
import LoginSignup from "./pages/LoginSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContextX";
import CookieBanner from "./components/CookieBanner";
import { hasAnalyticsConsent } from "./utils/cookieConsent";
import { loadGoogleAnalytics, trackPageView } from "./utils/analytics";

// Component to handle Google Analytics page tracking
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track if consent is given
    if (hasAnalyticsConsent()) {
      // Load GA if not already loaded (measurement ID from env or use a placeholder)
      const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      if (measurementId) {
        loadGoogleAnalytics(measurementId);
        trackPageView(location.pathname + location.search);
      }
    }
  }, [location]);

  return null;
}

function App() {
  // Load Google Analytics on mount if consent is given
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      if (measurementId) {
        loadGoogleAnalytics(measurementId);
      }
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AnalyticsTracker />
        <NeonBlobsBackground />
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginSignup initialMode="login" />} />
          <Route
            path="/signup"
            element={<LoginSignup initialMode="signup" />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/home" replace />} />

          {/* Protected pages */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
        </Routes>
        <CookieBanner />
      </AuthProvider>
    </Router>
  );
}

export default App;
