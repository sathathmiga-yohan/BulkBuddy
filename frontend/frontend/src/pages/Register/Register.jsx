
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShoppingBag,
  Store,
  UserRound,
  Users,
  Sparkles
} from "lucide-react";

import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "customer",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      general: ""
    }));

    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Please enter a password.";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!form.acceptTerms) {
      newErrors.acceptTerms =
        "Please accept the terms to continue.";
    }

    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSuccess(false);
      return;
    }

    // FRONTEND DEMO:
    // Save only non-sensitive profile information.
    // Real registration will use the FastAPI backend.
    const demoUser = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role
    };

    try {
      sessionStorage.setItem(
        "bulkbuddy_demo_user",
        JSON.stringify(demoUser)
      );

      setSuccess(true);

      // Navigate according to the selected account type.
      if (form.role === "seller") {
        navigate("/seller/dashboard", {
          replace: true
        });
      } else {
        navigate("/customer/dashboard", {
          replace: true
        });
      }
    } catch (error) {
      console.error(
        "Demo registration failed:",
        error
      );

      setSuccess(false);

      setErrors({
        general:
          "Unable to continue. Please try again."
      });
    }
  };

  return (
    <main className="register-page">
      <div className="register-layout">

        {/* LEFT: REGISTRATION FORM */}

        <section className="register-form-side">
          <div className="register-form-container">

            <Link
              to="/"
              className="register-back-home"
            >
              ← Back to Home
            </Link>

            <div className="register-heading">
              <span className="register-eyebrow">
                JOIN THE BULKBUDDY COMMUNITY
              </span>

              <h1>
                Create Your <span>Account</span>
              </h1>

              <p>
                Join BulkBuddy and discover the power
                of shopping together.
              </p>
            </div>

            {success && (
              <div
                className="register-success"
                role="status"
              >
                <CheckCircle2 size={21} />

                <div>
                  <strong>
                    Demo registration successful!
                  </strong>

                  <p>
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {errors.general && (
              <div
                className="register-error"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit}
              noValidate
            >

              {/* ACCOUNT TYPE */}

              <div className="register-field">
                <label>
                  I want to join as
                </label>

                <div className="register-role-grid">

                  <button
                    type="button"
                    className={`register-role-card ${
                      form.role === "customer"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      updateField("role", "customer")
                    }
                    aria-pressed={
                      form.role === "customer"
                    }
                  >
                    <span className="register-role-icon">
                      <Users size={22} />
                    </span>

                    <strong>Customer</strong>

                    <small>
                      Explore and join group deals
                    </small>
                  </button>

                  <button
                    type="button"
                    className={`register-role-card ${
                      form.role === "seller"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      updateField("role", "seller")
                    }
                    aria-pressed={
                      form.role === "seller"
                    }
                  >
                    <span className="register-role-icon">
                      <Store size={22} />
                    </span>

                    <strong>Seller</strong>

                    <small>
                      Create and manage deals
                    </small>
                  </button>

                </div>
              </div>

              {/* FULL NAME */}

              <div className="register-field">
                <label htmlFor="register-name">
                  Full Name
                </label>

                <div
                  className={`register-input-wrap ${
                    errors.fullName ? "invalid" : ""
                  }`}
                >
                  <UserRound size={18} />

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target.value
                      )
                    }
                    autoComplete="name"
                  />
                </div>

                {errors.fullName && (
                  <span className="register-error">
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* EMAIL */}

              <div className="register-field">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <div
                  className={`register-input-wrap ${
                    errors.email ? "invalid" : ""
                  }`}
                >
                  <Mail size={18} />

                  <input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <span className="register-error">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* PASSWORD */}

              <div className="register-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div
                  className={`register-input-wrap ${
                    errors.password ? "invalid" : ""
                  }`}
                >
                  <LockKeyhole size={18} />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="register-eye-button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password ? (
                  <span className="register-error">
                    {errors.password}
                  </span>
                ) : (
                  <span className="register-hint">
                    Use at least 8 characters.
                  </span>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="register-field">
                <label htmlFor="register-confirm">
                  Confirm Password
                </label>

                <div
                  className={`register-input-wrap ${
                    errors.confirmPassword
                      ? "invalid"
                      : ""
                  }`}
                >
                  <LockKeyhole size={18} />

                  <input
                    id="register-confirm"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="register-eye-button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <span className="register-error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* TERMS AND CONDITIONS */}

              <div className="register-terms">
                <label>
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(event) =>
                      updateField(
                        "acceptTerms",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    I agree to the Terms &amp; Conditions
                    and Privacy Policy.
                  </span>
                </label>

                {errors.acceptTerms && (
                  <span className="register-error">
                    {errors.acceptTerms}
                  </span>
                )}
              </div>

              {/* CREATE ACCOUNT BUTTON */}

              <button
                type="submit"
                className="register-submit-button"
              >
                Create Account
                <ArrowRight size={18} />
              </button>

            </form>

            <p className="register-login-text">
              Already have an account?{" "}

              <Link to="/login">
                Login
              </Link>
            </p>

          </div>
        </section>

        {/* RIGHT: SHOPPING IMAGE */}

        <aside className="register-visual-side">

          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=90"
            alt="Shopping fashion collection"
            className="register-visual-image"
          />

          <div className="register-visual-overlay" />

          <div className="register-visual-content">

            <div className="register-visual-brand">
              <ShoppingBag size={25} />

              <strong>
                Bulk<span>Buddy</span>
              </strong>
            </div>

            <div className="register-visual-bottom">

              <span className="register-visual-pill">
                <Sparkles size={16} />
                SHOP SMARTER TOGETHER
              </span>

              <h2>
                Buy Together.
                <br />
                <span>Save More.</span>
              </h2>

              <p>
                Become part of the BulkBuddy
                community. Discover amazing group
                deals or grow your business
                as a trusted seller.
              </p>

              <div className="register-visual-benefits">

                <span>
                  <CheckCircle2 size={17} />
                  Exclusive Group Discounts
                </span>

                <span>
                  <CheckCircle2 size={17} />
                  Trusted Marketplace
                </span>

                <span>
                  <CheckCircle2 size={17} />
                  Better Shopping Together
                </span>

              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
