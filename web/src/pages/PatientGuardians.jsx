import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";
import { useApi } from "../hooks";

function PatientGuardians() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ ok: true, text: "" });
  const { data, reload } = useApi("/guardians/my-guardians", 5000);
  const guardians = data?.guardians || [];

  const sendRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/guardians/request", { method: "POST", body: { guardianEmail: email } });
      setMsg({ ok: true, text: res.message || "Guardian request sent successfully." });
      setEmail("");
      reload();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  return (
    <Layout role="patient" active="guardians">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">GUARDIAN MANAGEMENT</p>
          <h1>My Guardians</h1>
          <p>Connect trusted people who should receive your messages.</p>
        </div>
      </header>

      <section className="guardian-management-grid">
        <div className="dashboard-card">
          <div className="card-icon">+</div>
          <h2>Add a Guardian</h2>
          <p>Enter the email of a registered guardian account. They must accept your request.</p>
          <form onSubmit={sendRequest} className="guardian-form">
            <input type="email" placeholder="guardian@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="primary-dashboard-button">Send Request</button>
          </form>
          {msg.text && <div className={msg.ok ? "success-message" : "error-message"}>{msg.text}</div>}
        </div>

        <div className="dashboard-card">
          <div className="card-icon">♧</div>
          <h2>Connected Guardians</h2>
          {guardians.length === 0 ? (
            <div className="empty-list">
              <strong>No guardians yet</strong>
              <span>Your connected guardians will appear here.</span>
            </div>
          ) : (
            <div className="item-list">
              {guardians.map((g) => (
                <div className="list-item" key={g.user_id}>
                  <strong>{g.name}</strong><span>{g.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default PatientGuardians;
