
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../../services/authservice";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShoppingBag,
  Sparkles,
  Users
} from "lucide-react";

import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: ""
  });

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [resetEmail, setResetEmail] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setMessage({
      type: "",
      text: ""
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setMessage({
        type: "error",
        text: "Please enter your email and password."
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Send credentials to FastAPI
      const tokenData = await loginUser(
        form.email.trim(),
        form.password
      );

      // 2. Store JWT token
      localStorage.setItem("token", tokenData.access_token);

      // 3. Fetch logged-in user details
      const user = await getCurrentUser();

      if (user.role === "SELLER") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }

    } catch (error) {
      localStorage.removeItem("token");

      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      });
    } finally {
      setLoading(false);
    }
  };



  const handleForgotPassword = (event) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address."
      });

      return;
    }

    setShowForgotPassword(false);

    setMessage({
      type: "success",
      text:
        "Demo only: password reset email was not sent. This feature will be connected to the backend later."
    });
  };

  return (
    <main className="login-page">
      <div className="login-layout">

        {/* LEFT SIDE: LOGIN FORM */}

        <section className="login-form-side">
          <div className="login-form-container">

            <Link to="/" className="login-back-home">
              ← Back to Home
            </Link>

            <div className="login-mobile-brand">
              <ShoppingBag size={22} />
              <strong>BulkBuddy</strong>
            </div>

            <div className="login-heading">
              <span className="login-eyebrow">
                WELCOME TO BULKBUDDY
              </span>

              <h1>
                Welcome <span>Back!</span>
              </h1>

              <p>
                Log in to discover amazing group deals
                and continue saving together.
              </p>
            </div>

            {message.text && (
              <div
                className={`login-message ${message.type}`}
                role="status"
              >
                {message.text}
              </div>
            )}

            {!showForgotPassword ? (
              <>
                <form
                  className="login-form"
                  onSubmit={handleLogin}
                >

                  {/* EMAIL */}

                  <div className="login-field">
                    <label htmlFor="login-email">
                      Email Address
                    </label>

                    <div className="login-input-wrap">
                      <Mail size={19} />

                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}

                  <div className="login-field">
                    <label htmlFor="login-password">
                      Password
                    </label>

                    <div className="login-input-wrap">
                      <LockKeyhole size={19} />

                      <input
                        id="login-password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        className="login-eye-button"
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
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REMEMBER + FORGOT */}

                  <div className="login-form-options">
                    <label className="login-remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(
                            event.target.checked
                          )
                        }
                      />

                      Remember me
                    </label>

                    <button
                      type="button"
                      className="login-forgot-link"
                      onClick={() => {
                        setResetEmail(form.email);
                        setMessage({
                          type: "",
                          text: ""
                        });
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    className="login-submit-button"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                    <ArrowRight size={18} />
                  </button>

                </form>

                {/* GOOGLE LOGIN */}

                <div className="login-divider">
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  className="login-google-button"
                  onClick={() =>
                    setMessage({
                      type: "info",
                      text:
                        "Google Login will be available after authentication integration."
                    })
                  }
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.87 46.98 24.55z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.87 23.87 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.92-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>

                  Continue with Google
                </button>

                <p className="login-signup-text">
                  Don't have an account?{" "}
                  <Link to="/register">
                    Sign Up
                  </Link>
                </p>
              </>
            ) : (
              /* FORGOT PASSWORD MOCK FORM */

              <form
                className="login-form"
                onSubmit={handleForgotPassword}
              >
                <div className="login-reset-heading">
                  <h2>Reset Your Password</h2>

                  <p>
                    Enter your email address to
                    request a password reset.
                  </p>
                </div>

                <div className="login-field">
                  <label htmlFor="reset-email">
                    Email Address
                  </label>

                  <div className="login-input-wrap">
                    <Mail size={19} />

                    <input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(event) =>
                        setResetEmail(
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-button"
                >
                  Request Reset
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="login-back-button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setMessage({
                      type: "",
                      text: ""
                    });
                  }}
                >
                  Back to Login
                </button>
              </form>
            )}

          </div>
        </section>

        {/* RIGHT SIDE: SHOPPING VISUAL */}

        <aside className="login-visual-side">
          <div className="login-visual-overlay" />

          <img
            className="login-visual-image"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=90"
            alt="Shopping fashion collection"
          />

          <div className="login-visual-content">
            <div className="login-visual-brand">
              <ShoppingBag size={25} />
              <strong>
                Bulk<span>Buddy</span>
              </strong>
            </div>

            <div className="login-visual-bottom">
              <div className="login-visual-pill">
                <Sparkles size={16} />
                BUY TOGETHER • SAVE MORE
              </div>

              <h2>
                Better Deals.
                <br />
                <span>Better Together.</span>
              </h2>

              <p>
                Join our community and unlock
                exclusive group buying offers
                on your favourite products.
              </p>

              <div className="login-visual-community">
                <Users size={18} />
                Shop smarter with BulkBuddy
              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
