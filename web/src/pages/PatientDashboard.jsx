import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useGlove } from "../context/GloveContext";
import { getUser } from "../api";
import { useApi } from "../hooks";

function PatientDashboard() {
  const user = getUser();
  const glove = useGlove();
  const { data } = useApi("/guardians/my-guardians", 5000);
  const count = data?.guardians?.length ?? 0;
  const isEmergency = ["I NEED HELP", "CALL DOCTOR"].includes(glove.current);

  return (
    <Layout role="patient" active="home">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">PATIENT DASHBOARD</p>
          <h1>Hello, {user?.name || "Patient"}</h1>
          <p>{glove.connected ? "Your glove is connected and sending messages." : "Connect your glove to start."}</p>
        </div>
        <div className="online-status">
          <span></span>
          {glove.connected ? "Glove Connected" : "System Ready"}
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-card arduino-card">
          <div className="card-top">
            <div className="card-icon">⚡</div>
            <span className="status-pill">{glove.connected ? "Connected" : "Ready"}</span>
          </div>
          <h2>Sign Language Glove</h2>
          <p>Plug in your Arduino Nano via USB, then connect (Chrome or Edge required).</p>
          {glove.connected ? (
            <button className="primary-dashboard-button" onClick={glove.disconnect}>Disconnect Arduino</button>
          ) : (
            <button className="primary-dashboard-button" onClick={glove.connect}>Connect Arduino</button>
          )}
          {!glove.supported && <div className="error-message">Web Serial isn't available in this browser. Use Chrome or Edge.</div>}
          {glove.error && <div className="error-message">{glove.error}</div>}
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-icon">♧</div>
            <span className="status-pill">{count} Connected</span>
          </div>
          <h2>My Guardians</h2>
          <p>Add trusted guardians who can receive your messages.</p>
          <Link to="/patient/guardians" className="secondary-dashboard-button">Manage Guardians</Link>
        </div>
      </section>

      <section className="current-message-card">
        <div className="message-card-header">
          <div>
            <p>CURRENT MESSAGE</p>
            <h2 style={isEmergency ? { color: "#ff5d5d" } : undefined}>{glove.current}</h2>
          </div>
          <div className="message-status">{glove.connected ? "Live" : "Waiting"}</div>
        </div>
        <div className="message-placeholder">
          {glove.lastSent
            ? `Last sent to guardians: ${glove.lastSent.text} (${glove.lastSent.at.toLocaleTimeString()})`
            : "Your detected sign will appear here."}
        </div>
      </section>

      <section className="quick-section">
        <h2>Quick access</h2>
        <div className="quick-grid">
          <Link to="/patient/guardians"><strong>Add Guardian</strong><span>Connect someone you trust</span></Link>
          <Link to="/patient/messages"><strong>Message History</strong><span>View your previous messages</span></Link>
          <Link to="/patient/profile"><strong>My Profile</strong><span>Manage your account</span></Link>
        </div>
      </section>
    </Layout>
  );
}

export default PatientDashboard;
