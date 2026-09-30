import Layout from "../components/Layout";
import { useApi, fmt } from "../hooks";

function Messages({ role }) {
  const isPatient = role === "patient";
  const { data, error } = useApi(isPatient ? "/messages/patient" : "/messages/guardian", 3000);
  const messages = data?.messages || [];

  return (
    <Layout role={role} active="messages">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">COMMUNICATION</p>
          <h1>Message History</h1>
          <p>{isPatient ? "Messages sent through your sign language glove." : "Messages received from connected patients."}</p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-activity">
            <div>♢</div>
            <h3>No messages yet</h3>
            <p>{isPatient ? "Your detected sign language messages will appear here." : "Messages from connected patients will appear here."}</p>
          </div>
        ) : (
          <div className="item-list">
            {messages.map((m) => (
              <div key={m.message_id} className={m.message_type === "emergency" ? "list-item emergency" : "list-item"}>
                <strong>{m.message_text}</strong>
                <span>
                  {!isPatient && `${m.patient_name} · `}{fmt(m.created_at)}
                  {m.message_type === "emergency" && " · EMERGENCY"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Messages;
