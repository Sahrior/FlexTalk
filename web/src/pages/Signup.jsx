import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: { name, email, password, role },
      });
      saveSession(data.token, data.user);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card signup-card">

        <div className="auth-logo">
          ✋
        </div>

        <p className="auth-label">
          SIGN LANGUAGE GLOVE
        </p>

        <h1>
          Create account
        </h1>

        <p className="auth-description">
          Create your account and choose how you will use the system.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>
            Account Type
          </label>

          <div className="role-selector">

            <button
              type="button"
              className={
                role === "patient"
                  ? "role-option selected"
                  : "role-option"
              }
              onClick={() => setRole("patient")}
            >
              <span>♿</span>

              <strong>
                Patient
              </strong>

              <small>
                I use the sign language glove
              </small>
            </button>

            <button
              type="button"
              className={
                role === "guardian"
                  ? "role-option selected"
                  : "role-option"
              }
              onClick={() => setRole("guardian")}
            >
              <span>🛡</span>

              <strong>
                Guardian
              </strong>

              <small>
                I monitor a patient
              </small>
            </button>

          </div>

          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?

          <Link to="/login">
            Login
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

export default Signup;