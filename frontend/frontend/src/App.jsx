import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;