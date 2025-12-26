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
import { loadFirebaseAnalytics, trackPageView } from "./utils/analytics";

// Component to handle Firebase Analytics page tracking
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track if consent is given
    if (hasAnalyticsConsent()) {
      // Load Firebase Analytics if not already loaded, then track page view
      loadFirebaseAnalytics().then((loaded) => {
        if (loaded) {
          // Small delay to ensure analytics is ready
          setTimeout(() => {
            trackPageView(location.pathname + location.search);
          }, 100);
        }
      });
    }
  }, [location]);

  return null;
}

function App() {
  // Load Firebase Analytics on mount if consent is given
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      loadFirebaseAnalytics();
    }
  }, []);

  // Global keyboard handler for Enter key on interactive elements
  useEffect(() => {
    function handleKeyDown(event) {
      // Only handle Enter key
      if (event.key !== 'Enter') return;

      // Get the currently focused element
      const activeElement = document.activeElement;

      // Skip if focused element is an input, textarea, or contenteditable
      if (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      ) {
        return;
      }

      // Check if element has role="button" or is a button/link
      const isInteractive =
        activeElement.getAttribute('role') === 'button' ||
        activeElement.tagName === 'BUTTON' ||
        activeElement.tagName === 'A' ||
        activeElement.onclick !== null;

      // Check if element is not disabled
      const isDisabled =
        activeElement.hasAttribute('disabled') ||
        activeElement.getAttribute('aria-disabled') === 'true';

      if (isInteractive && !isDisabled) {
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();

        // Trigger click event
        activeElement.click();
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
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
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        </Routes>
        <CookieBanner />
      </AuthProvider>
    </Router>
  );
}

export default App;
