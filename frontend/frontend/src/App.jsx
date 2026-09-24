import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Deals from "./pages/Deals/Deals";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;