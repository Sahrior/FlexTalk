import Layout from "../components/Layout";
import { getUser } from "../api";

function Profile({ role }) {
  const user = getUser();
  return (
    <Layout role={role} active="profile">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">ACCOUNT</p>
          <h1>My Profile</h1>
        </div>
      </header>
      <section className="profile-card">
        <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div className="profile-details">
          <p>FULL NAME</p><h2>{user?.name || "User"}</h2>
          <p>EMAIL</p><h3>{user?.email || "No email"}</h3>
          <p>ACCOUNT TYPE</p><span className="role-badge">{role}</span>
        </div>
      </section>
    </Layout>
  );
}

export default Profile;
