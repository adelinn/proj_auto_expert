import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";
import LoginSignup from "./pages/LoginSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
      </Routes>

      <footer style={{position:'fixed', left:12, bottom:12, zIndex:60}}>
        <Link to="/privacy-policy" style={{color:'rgba(255,255,255,0.75)', fontSize:13}}>Politica de confidențialitate</Link>
      </footer>
    </Router>
  );
}

export default App;
