import { useState, useEffect } from "react";
import InputBox from "./components/InputBox";
import ActionCards from "./components/ActionCards";
import MapView from "./components/MapView";
import TaskList from "./components/TaskList";
import ApiKeyModal from "./components/ApiKeyModal";
import HistoryPanel from "./components/HistoryPanel";
import { extractIntent } from "./services/groqService";
import { loadApiKey, addHistory } from "./services/localStore";
import "./index.css";

export default function App() {
  const [apiKey, setApiKey] = useState(() => loadApiKey());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async (message) => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setMapLocation(null);
    try {
      const data = await extractIntent(message, apiKey);
      setResult(data);
      const firstLocation = data.intents?.find((i) => i.entities?.location)?.entities?.location;
      if (firstLocation) setMapLocation(firstLocation);
      addHistory({ message, intentCount: data.intents?.length || 0 });
      setRefreshTrigger((n) => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuted = (type, title) => {
    setRefreshTrigger((n) => n + 1);
    showToast(type === "event" ? `📅 Event saved: ${title}` : `✅ Task saved: ${title}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {!apiKey && <ApiKeyModal onSaved={setApiKey} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "16px", right: "16px", zIndex: 100,
          background: "var(--card)", border: "1px solid var(--accent)",
          color: "var(--text-primary)", padding: "10px 16px",
          borderRadius: "10px", fontSize: "13px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "slideDown 0.3s ease"
        }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "var(--accent-dim)", border: "1px solid rgba(124,111,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px"
          }}>⚡</div>
          <span style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: "17px", color: "var(--text-primary)" }}>
            Intent Engine
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Live</span>
          </div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            padding: "4px 10px", borderRadius: "6px",
            background: "var(--card)", border: "1px solid var(--border)",
            fontFamily: "'JetBrains Mono'"
          }}>
            Llama 3.3 70B
          </div>
          <button
            onClick={() => { if (confirm("Change API key?")) { localStorage.removeItem("intent_engine_groq_key"); setApiKey(""); } }}
            style={{
              background: "none", border: "1px solid var(--border)",
              color: "var(--text-muted)", borderRadius: "6px",
              padding: "4px 10px", cursor: "pointer", fontSize: "12px"
            }}
          >
            🔑 Key
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.5px"
          }}>
            What do you need to do?
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Paste any message — chat, email, or note. The AI extracts intent and creates actions automatically.
          </p>
        </div>

        {/* Input */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "20px", marginBottom: "24px"
        }}>
          <InputBox onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "13px", color: "var(--red)"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ marginBottom: "24px" }}>
            {[1,2].map(i => (
              <div key={i} style={{
                height: "160px", borderRadius: "16px", marginBottom: "12px",
                background: "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite"
              }} />
            ))}
          </div>
        )}

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>

          {/* Left — results */}
          <div>
            {result && !loading && (
              <ActionCards
                result={result}
                onExecuted={handleExecuted}
                onMapRequest={setMapLocation}
              />
            )}
            {!result && !loading && (
              <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "48px 24px", textAlign: "center"
              }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧠</div>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  No analysis yet
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Paste a message above and click Analyze Intent
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <MapView location={mapLocation} />
            <TaskList refreshTrigger={refreshTrigger} />
            <HistoryPanel refreshTrigger={refreshTrigger} onReplay={handleAnalyze} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}