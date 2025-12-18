import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>

      <footer style={{position:'fixed', left:12, bottom:12, zIndex:60}}>
        <a href="/privacy" style={{color:'rgba(255,255,255,0.75)', fontSize:13}}>Politica de confidențialitate</a>
      </footer>
    </Router>
  );
}

export default App;
