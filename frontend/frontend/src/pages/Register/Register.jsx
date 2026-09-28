import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authservice";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    try {
      setLoading(true);
      setError("");

      await registerUser(registerData);

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">
        <div className="register-card">

          <div className="register-heading">
            <div className="register-icon">🛍️</div>

            <h1>Create Your Account</h1>

            <p>
              Join BulkBuddy and start saving together with
              group deals.
            </p>
          </div>

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >
            <div className="register-form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="role">
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="CUSTOMER">
                  Customer
                </option>

                <option value="SELLER">
                  Seller
                </option>
              </select>
            </div>

            <div className="register-form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="register-password-wrapper">
                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="register-password-wrapper">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Register;