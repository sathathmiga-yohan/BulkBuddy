import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">

        <div className="footer-brand-section">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">🛍️</span>

            <span className="footer-logo-text">
              <span className="footer-bulk">Bulk</span>
              <span className="footer-buddy">Buddy</span>
            </span>
          </Link>

          <p className="footer-description">
            Buy together, save more. Join group deals and enjoy better
            prices with BulkBuddy.
          </p>
        </div>

        <div className="footer-links-section">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/deals">Deals</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <div className="footer-info-section">
          <h3>BulkBuddy</h3>

          <p>Simple group buying.</p>
          <p>Better deals.</p>
          <p>More savings.</p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © {currentYear} BulkBuddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;