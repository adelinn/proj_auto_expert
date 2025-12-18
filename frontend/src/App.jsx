import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import "./App.css";
import NeonBlobsBackground from "./components/NeonBlobsBackground";

function App() {
  return (
    <Router>
      <NeonBlobsBackground />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
