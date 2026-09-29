
import { useState } from "react";
import {
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Menu,
  X,
  ArrowRight
} from "lucide-react";

import "./Navbar.css";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Deals", path: "/deals" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "About", path: "/about" }
];

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    navigate(
      query
        ? `/deals?search=${encodeURIComponent(query)}`
        : "/deals"
    );

    closeMenu();
  };

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* BULKBUDDY LOGO */}

        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          <div className="navbar-logo">
            <ShoppingBag
              size={25}
              strokeWidth={2.3}
            />
          </div>

          <div className="navbar-brand-text">
            <span className="navbar-brand-name">
              Bulk<span>Buddy</span>
            </span>

            <small>
              Buy Together • Save More
            </small>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}

        <nav
          className="navbar-links"
          aria-label="Main navigation"
        >
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* SEARCH BAR */}

        <form
          className="navbar-search"
          onSubmit={handleSearch}
          role="search"
        >
          <Search size={17} />

          <input
            type="search"
            placeholder="Search deals, products..."
            aria-label="Search deals"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <button
            type="submit"
            aria-label="Submit search"
          >
            <ArrowRight size={16} />
          </button>
        </form>

        {/* RIGHT ACTIONS */}

        <div className="navbar-actions">

          <Link
            to="/login"
            className="navbar-cart"
            aria-label="Login to access your account"
            title="Login to access your account"
          >
            <ShoppingCart size={20} />
          </Link>

          <Link
            to="/login"
            className="navbar-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="navbar-signup"
          >
            Sign Up
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="navbar-menu-button"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label={
            menuOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>

      {/* MOBILE NAVIGATION */}

      {menuOpen && (
        <nav
          className="navbar-mobile"
          aria-label="Mobile navigation"
        >

          <form
            className="navbar-mobile-search"
            onSubmit={handleSearch}
            role="search"
          >
            <Search size={18} />

            <input
              type="search"
              placeholder="Search deals..."
              aria-label="Search deals"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <button type="submit">
              Search
            </button>
          </form>

          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navbar-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="navbar-mobile-actions">

            <Link
              to="/login"
              onClick={closeMenu}
              className="navbar-mobile-login"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className="navbar-mobile-signup"
            >
              Sign Up
            </Link>

          </div>

        </nav>
      )}

    </header>
  );
}

export default Navbar;
