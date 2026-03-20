import { useState } from "react";
import InputBox from "./components/InputBox";
import ActionCards from "./components/ActionCards";
import MapView from "./components/MapView";
import TaskList from "./components/TaskList";
import HistoryPanel from "./components/HistoryPanel";
import { extractIntent } from "./services/groqService";
import { addHistory } from "./services/localStore";
import "./index.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState(null);
  const [mobileTab, setMobileTab] = useState("analyze");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async (message) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setMapLocation(null);
    try {
      const data = await extractIntent(message);
      setResult(data);
      const firstLocation = data.intents?.find((i) => i.entities?.location)?.entities?.location;
      if (firstLocation) setMapLocation(firstLocation);
      addHistory({ message, intentCount: data.intents?.length || 0 });
      setRefreshTrigger((n) => n + 1);
      setMobileTab("results");
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
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "16px", right: "16px", zIndex: 100,
          background: "var(--card)", border: "1px solid var(--accent)",
          color: "var(--text-primary)", padding: "10px 16px",
          borderRadius: "10px", fontSize: "13px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 16px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Live</span>
        </div>
      </nav>

      {/* Mobile bottom tabs */}
      <div className="mobile-tabs" style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--surface)", borderTop: "1px solid var(--border)",
        zIndex: 50, padding: "8px 0",
      }}>
        {[
          { key: "analyze", icon: "⚡", label: "Analyze" },
          { key: "results", icon: "🧠", label: "Results" },
          { key: "map", icon: "🗺️", label: "Map" },
          { key: "tasks", icon: "✅", label: "Tasks" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            style={{
              flex: 1, background: "none", border: "none",
              color: mobileTab === tab.key ? "var(--accent)" : "var(--text-muted)",
              fontSize: "10px", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "2px", padding: "4px",
            }}
          >
            <span style={{ fontSize: "18px" }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Page title — hidden on mobile */}
        <div className="desktop-only" style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.5px"
          }}>
            What do you need to do?
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Paste any message — chat, email, or note. AI extracts intent and creates actions automatically.
          </p>
        </div>

        {/* Desktop layout */}
        <div className="desktop-layout">
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

          {/* Loading */}
          {loading && (
            <div style={{ marginBottom: "24px" }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: "160px", borderRadius: "16px", marginBottom: "12px",
                  background: "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite"
                }} />
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
            <div>
              {result && !loading && (
                <ActionCards result={result} onExecuted={handleExecuted} onMapRequest={setMapLocation} />
              )}
              {!result && !loading && (
                <div style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "48px 24px", textAlign: "center"
                }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧠</div>
                  <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "6px" }}>No analysis yet</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Paste a message above and click Analyze Intent</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <MapView location={mapLocation} />
              <TaskList refreshTrigger={refreshTrigger} />
              <HistoryPanel refreshTrigger={refreshTrigger} onReplay={handleAnalyze} />
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="mobile-layout">
          {mobileTab === "analyze" && (
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "'Syne'" }}>
                What do you need to do?
              </p>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
                <InputBox onAnalyze={handleAnalyze} loading={loading} />
              </div>
              {error && (
                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "var(--red)" }}>
                  ⚠️ {error}
                </div>
              )}
              {loading && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontSize: "14px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🧠</div>
                  Analyzing your message...
                </div>
              )}
            </div>
          )}

          {mobileTab === "results" && (
            <div>
              {result && !loading ? (
                <ActionCards result={result} onExecuted={handleExecuted} onMapRequest={(loc) => { setMapLocation(loc); setMobileTab("map"); }} />
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧠</div>
                  <p style={{ color: "var(--text-secondary)" }}>No results yet — go to Analyze tab first</p>
                </div>
              )}
            </div>
          )}

          {mobileTab === "map" && (
            <MapView location={mapLocation} />
          )}

          {mobileTab === "tasks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <TaskList refreshTrigger={refreshTrigger} />
              <HistoryPanel refreshTrigger={refreshTrigger} onReplay={(msg) => { handleAnalyze(msg); setMobileTab("analyze"); }} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .desktop-layout { display: block; }
        .mobile-layout { display: none; }
        .desktop-only { display: block; }
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: block !important; }
          .desktop-only { display: none !important; }
          .mobile-tabs { display: flex !important; }
        }
      `}</style>
    </div>
  );
}