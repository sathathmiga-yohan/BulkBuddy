import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { logoutUser } from "../../services/authservice";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isLoggedIn =
    Boolean(token && user);

  const handleLogout = () => {
    logoutUser();

    navigate("/login");

    // Navbar state refresh
    window.location.reload();
  };

  return (
    <nav className="bulk-navbar">

      <div className="container navbar-container">

        {/* LOGO */}
        <Link
          to="/"
          className="navbar-brand"
        >
          <span className="brand-icon">
            🛍️
          </span>

          <span className="brand-name">
            <span className="brand-bulk">
              Bulk
            </span>

            <span className="brand-buddy">
              Buddy
            </span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <div className="navbar-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "nav-link active-link"
                : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) =>
              isActive
                ? "nav-link active-link"
                : "nav-link"
            }
          >
            Deals
          </NavLink>

          {/* CUSTOMER */}
          {isLoggedIn &&
            user.role === "CUSTOMER" && (

              <NavLink
                to="/my-deals"
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active-link"
                    : "nav-link"
                }
              >
                My Deals
              </NavLink>
            )}

          {/* SELLER */}
          {isLoggedIn &&
            user.role === "SELLER" && (
              <>
                <NavLink
                  to="/seller/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link"
                      : "nav-link"
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/seller/deals"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link"
                      : "nav-link"
                  }
                >
                  My Deals
                </NavLink>

                <NavLink
                  to="/seller/reports"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link"
                      : "nav-link"
                  }
                >
                  Reports
                </NavLink>
              </>
            )}

        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-actions">

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="login-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-button"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <span className="navbar-user">
                {user.name}
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;