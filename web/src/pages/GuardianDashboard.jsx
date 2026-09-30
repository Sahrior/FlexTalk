import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api, getUser } from "../api";
import { useApi, fmt } from "../hooks";

function GuardianDashboard() {
  const user = getUser();
  const patients = useApi("/guardians/my-patients", 5000);
  const requests = useApi("/guardians/requests", 5000);
  const emergencies = useApi("/messages/guardian/emergency", 3000);
  const all = useApi("/messages/guardian", 3000);

  const patientList = patients.data?.patients || [];
  const pending = (requests.data?.requests || []).filter((r) => r.status === "pending");
  const latestEmergency = emergencies.data?.messages?.[0];
  const recent = (all.data?.messages || []).slice(0, 5);
  const recentEmergency = latestEmergency && Date.now() - new Date(latestEmergency.created_at) < 10 * 60 * 1000;

  const respond = async (id, action) => {
    try {
      await api(`/guardians/requests/${id}/${action}`, { method: "PUT" });
      requests.reload(); patients.reload();
    } catch (e) { alert(e.message); }
  };

  return (
    <Layout role="guardian" active="home">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">GUARDIAN DASHBOARD</p>
          <h1>Welcome, {user?.name || "Guardian"}</h1>
          <p>Monitor messages from connected patients.</p>
        </div>
        <div className="online-status"><span></span>Monitoring</div>
      </header>

      {pending.length > 0 && (
        <section className="quick-section">
          <h2>Pending requests</h2>
          <div className="item-list">
            {pending.map((r) => (
              <div className="list-item request" key={r.request_id}>
                <div><strong>{r.patient_name}</strong><span>{r.patient_email}</span></div>
                <div className="item-actions">
                  <button className="primary-dashboard-button" onClick={() => respond(r.request_id, "accept")}>Accept</button>
                  <button className="secondary-dashboard-button" onClick={() => respond(r.request_id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="guardian-patient-card">
        <div className="patient-avatar">{patientList[0]?.name?.charAt(0)?.toUpperCase() || "P"}</div>
        <div className="patient-info">
          <p>CONNECTED PATIENT{patientList.length > 1 ? "S" : ""}</p>
          <h2>{patientList.length ? patientList.map((p) => p.name).join(", ") : "No patient connected"}</h2>
          <span>{patientList.length ? patientList.map((p) => p.email).join(", ") : "Once you accept a patient's request, their status will appear here."}</span>
        </div>
        <div className="patient-status">{patientList.length ? "Connected" : "Waiting"}</div>
      </section>

      <section className="emergency-monitor" style={recentEmergency ? { borderColor: "#ff5d5d" } : undefined}>
        <div className="monitor-icon">!</div>
        <div>
          <p>EMERGENCY MONITORING</p>
          <h2>{recentEmergency ? `${latestEmergency.patient_name}: ${latestEmergency.message_text}` : "No active emergency"}</h2>
          <span>{recentEmergency ? fmt(latestEmergency.created_at) : "Emergency gestures from connected patients will appear here."}</span>
        </div>
      </section>

      <section className="quick-section">
        <h2>Recent activity</h2>
        {recent.length === 0 ? (
          <div className="empty-activity">
            <div>♢</div><h3>No messages yet</h3>
            <p>Messages from your connected patient will appear here.</p>
            <Link to="/guardian/messages">View messages</Link>
          </div>
        ) : (
          <div className="item-list">
            {recent.map((m) => (
              <div key={m.message_id} className={m.message_type === "emergency" ? "list-item emergency" : "list-item"}>
                <strong>{m.message_text}</strong>
                <span>{m.patient_name} · {fmt(m.created_at)}</span>
              </div>
            ))}
            <Link to="/guardian/messages" className="secondary-dashboard-button">View all messages</Link>
          </div>
        )}
      </section>
    </Layout>
  );
}

export default GuardianDashboard;
