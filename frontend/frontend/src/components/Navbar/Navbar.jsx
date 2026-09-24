import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="bulk-navbar">
      <div className="container navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛍️</span>

          <span className="brand-name">
            <span className="brand-bulk">Bulk</span>
            <span className="brand-buddy">Buddy</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active-link" : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) =>
              isActive ? "nav-link active-link" : "nav-link"
            }
          >
            Deals
          </NavLink>
        </div>

        {/* Login / Register */}
        <div className="navbar-actions">
          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/register" className="register-button">
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;