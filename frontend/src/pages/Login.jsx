import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      /*
       * FastAPI OAuth2PasswordRequestForm expects:
       *
       * username
       * password
       *
       * Your backend uses username as the email.
       */

      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        `${API}/auth/login`,
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      const token =
        response.data.access_token;

      localStorage.setItem(
        "access_token",
        token
      );

      localStorage.setItem(
        "token_type",
        response.data.token_type || "bearer"
      );

      localStorage.setItem(
        "user_email",
        email
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="login-brand">

          <div className="login-logo">
            AI
          </div>

          <h1>
            Agentic Financial
            <br />
            Assistant
          </h1>

          <p>
            AI-powered financial operations,
            risk analysis and fraud detection.
          </p>

          <div className="login-features">

            <div>
              🤖
              <span>
                Multi-Agent AI
              </span>
            </div>

            <div>
              🛡️
              <span>
                Risk & Fraud Detection
              </span>
            </div>

            <div>
              👤
              <span>
                Human-in-the-Loop Approval
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to your financial assistant
            </p>

          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>

          <div className="login-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create Account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;