import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearSession, getToken, getUser } from "../api";

export default function Layout({ role, active, children }) {
  const navigate = useNavigate();
  const user = getUser();

  if (!getToken() || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;

  const base = `/${role}`;
  const logout = () => { clearSession(); navigate("/login"); };
  const item = (key, to, icon, label) => (
    <Link to={to} className={active === key ? "nav-item active" : "nav-item"}>
      <span>{icon}</span>{label}
    </Link>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">✋<span>SignGlove</span></div>
        <p className="sidebar-label">{role.toUpperCase()}</p>
        <nav>
          {item("home", base, "⌂", "Dashboard")}
          {role === "patient" && item("guardians", "/patient/guardians", "♧", "My Guardians")}
          {item("messages", `${base}/messages`, "♢", "Messages")}
          {item("profile", `${base}/profile`, "○", "Profile")}
        </nav>
        <button className="logout-button" onClick={logout}>Logout</button>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
