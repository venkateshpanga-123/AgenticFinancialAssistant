import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(
        `${API}/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      setSuccess(
        "Registration successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

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
            Intelligent financial operations
            powered by specialized AI agents.
          </p>

          <div className="login-features">

            <div>
              🤖
              <span>
                AI Decision Engine
              </span>
            </div>

            <div>
              🔐
              <span>
                Secure Authentication
              </span>
            </div>

            <div>
              📋
              <span>
                Complete Audit Trail
              </span>
            </div>

          </div>

        </div>

        <div className="login-card">

          <div className="login-header">

            <h2>
              Create Account
            </h2>

            <p>
              Register for the financial assistant
            </p>

          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="login-success">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleRegister}>

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>

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
                placeholder="Create a password"
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
                ? "Creating account..."
                : "Create Account"}

            </button>

          </form>

          <div className="login-footer">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign In
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;