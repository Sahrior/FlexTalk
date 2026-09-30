import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      saveSession(data.token, data.user);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          ✋
        </div>

        <p className="auth-label">
          SIGN LANGUAGE GLOVE
        </p>

        <h1>
          Welcome back
        </h1>

        <p className="auth-description">
          Sign in to continue to your communication dashboard.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="auth-button"
          >
            Login
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?

          <Link to="/signup">
            Create account
          </Link>
        </p>

        <Link
          to="/"
          className="back-home"
        >
          ← Back to home
        </Link>

      </div>

    </div>
  );
}

export default Login;