import { useState } from "react";
import InputBox from "./components/InputBox";
import ActionCards from "./components/ActionCards";
import MapView from "./components/MapView";
import TaskList from "./components/TaskList";
import HistoryPanel from "./components/HistoryPanel";
import { extractIntent } from "./services/groqService";
import { addHistory } from "./services/localStore";
import "./index.css";

const TABS = [
  { key: "analyze", icon: "⚡", label: "Analyze" },
  { key: "results", icon: "🧠", label: "Results" },
  { key: "map", icon: "🗺️", label: "Map" },
  { key: "tasks", icon: "✅", label: "Tasks" },
  { key: "calendar", icon: "📅", label: "Calendar" },
  { key: "history", icon: "🕒", label: "History" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("analyze");
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
      setActiveTab("results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuted = (type, title) => {
    setRefreshTrigger((n) => n + 1);
    showToast(type === "event" ? `📅 Saved: ${title}` : `✅ Saved: ${title}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 200,
          background: "white", border: "1px solid #FFD4C2",
          color: "#3D1A0A", padding: "12px 18px",
          borderRadius: "12px", fontSize: "13px", fontWeight: 500,
          boxShadow: "0 8px 32px rgba(255,160,122,0.2)",
          borderLeft: "4px solid #FFA07A",
        }}>
          {toast}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "white",
        borderBottom: "1px solid #FFD4C2",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(255,160,122,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #FFA07A, #FF6B35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "0 2px 8px rgba(255,107,53,0.3)",
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: "16px", color: "#3D1A0A", lineHeight: 1 }}>
              Intent Engine
            </div>
            <div style={{ fontSize: "10px", color: "#C4826A", fontFamily: "'JetBrains Mono'" }}>
              AI Action Layer
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "20px",
            background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669" }} />
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>Live</span>
          </div>
          <div style={{
            padding: "6px 12px", borderRadius: "20px",
            background: "#FFF0EB", border: "1px solid #FFD4C2",
            fontSize: "11px", color: "#FF6B35",
            fontFamily: "'JetBrains Mono'", fontWeight: 500,
          }}>
            Llama 3.3 70B
          </div>
        </div>
      </nav>

      {/* ── TAB NAVIGATION ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #FFD4C2",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "16px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? "#FFA07A" : "#C4826A",
              borderBottom: activeTab === tab.key ? "2px solid #FFA07A" : "2px solid transparent",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'Plus Jakarta Sans'",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = "#FFA07A";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = "#C4826A";
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.key === "results" && result && (
              <span style={{
                background: "#FFA07A", color: "white",
                fontSize: "10px", fontWeight: 700,
                padding: "2px 7px", borderRadius: "10px",
              }}>
                {result.intents?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── ANALYZE TAB ── */}
        {activeTab === "analyze" && (
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, #FFA07A, #FF6B35)",
              borderRadius: "24px", padding: "40px 32px",
              marginBottom: "32px", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "-40px", right: "-40px",
                width: "160px", height: "160px", borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }} />
              <div style={{
                position: "absolute", bottom: "-30px", left: "-30px",
                width: "120px", height: "120px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "20px",
                  background: "rgba(255,255,255,0.2)",
                  fontSize: "12px", color: "white", fontWeight: 500,
                  marginBottom: "16px",
                }}>
                  ✨ Powered by Llama 3.3 70B — Zero cost
                </div>
                <h1 style={{
                  fontFamily: "'Syne'",
                  fontSize: "clamp(22px, 4vw, 32px)",
                  fontWeight: 800, color: "white",
                  marginBottom: "10px", lineHeight: 1.2,
                }}>
                  What do you need to do?
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                  Paste any message — WhatsApp, email, or note.<br />
                  AI extracts intent and creates actions automatically.
                </p>
              </div>
            </div>

            {/* Input card */}
            <div style={{
              background: "white", borderRadius: "20px",
              padding: "24px", marginBottom: "24px",
              border: "1px solid #FFD4C2",
              boxShadow: "0 4px 24px rgba(255,160,122,0.12)",
            }}>
              <InputBox onAnalyze={handleAnalyze} loading={loading} />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "12px", padding: "14px 18px",
                fontSize: "13px", color: "#ef4444",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* How it works */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px", marginTop: "32px",
            }}>
              {[
                { icon: "📝", title: "Paste message", desc: "Any WhatsApp, email or note" },
                { icon: "🧠", title: "AI analyzes", desc: "Extracts intent and entities" },
                { icon: "⚡", title: "Auto actions", desc: "Creates tasks, reminders, maps" },
              ].map((step, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: "16px",
                  padding: "20px", textAlign: "center",
                  border: "1px solid #FFD4C2",
                  boxShadow: "0 2px 8px rgba(255,160,122,0.08)",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{step.icon}</div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#3D1A0A", marginBottom: "4px" }}>{step.title}</p>
                  <p style={{ fontSize: "12px", color: "#C4826A" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS TAB ── */}
        {activeTab === "results" && (
          <div>
            {loading && (
              <div style={{
                textAlign: "center", padding: "80px 20px",
                background: "white", borderRadius: "20px",
                border: "1px solid #FFD4C2",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  border: "3px solid #FFD4C2", borderTopColor: "#FFA07A",
                  animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
                }} />
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#3D1A0A", marginBottom: "4px" }}>
                  Analyzing your message...
                </p>
                <p style={{ fontSize: "13px", color: "#C4826A" }}>Llama 3.3 70B is extracting intents</p>
              </div>
            )}
            {result && !loading && (
              <ActionCards result={result} onExecuted={handleExecuted} onMapRequest={(loc) => { setMapLocation(loc); setActiveTab("map"); }} />
            )}
            {!result && !loading && (
              <div style={{
                textAlign: "center", padding: "80px 20px",
                background: "white", borderRadius: "20px",
                border: "1px solid #FFD4C2",
              }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "20px",
                  background: "#FFF0EB", margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px",
                }}>🧠</div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#3D1A0A", marginBottom: "8px" }}>
                  No results yet
                </p>
                <p style={{ fontSize: "13px", color: "#C4826A", marginBottom: "20px" }}>
                  Go to the Analyze tab and paste a message first
                </p>
                <button
                  onClick={() => setActiveTab("analyze")}
                  style={{
                    padding: "10px 24px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #FFA07A, #FF6B35)",
                    color: "white", border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 700, fontFamily: "'Syne'",
                  }}
                >
                  ⚡ Go to Analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MAP TAB ── */}
        {activeTab === "map" && (
          <div>
            <h2 style={{ fontFamily: "'Syne'", fontSize: "20px", fontWeight: 800, color: "#3D1A0A", marginBottom: "20px" }}>
              🗺️ Map View
            </h2>
            <MapView location={mapLocation} />
            {!mapLocation && (
              <div style={{
                textAlign: "center", padding: "40px",
                background: "white", borderRadius: "20px",
                border: "1px solid #FFD4C2", marginTop: "16px",
              }}>
                <p style={{ fontSize: "14px", color: "#C4826A" }}>
                  No location detected yet — analyze a message with a location first
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontFamily: "'Syne'", fontSize: "20px", fontWeight: 800, color: "#3D1A0A", marginBottom: "20px" }}>
              ✅ Tasks & Reminders
            </h2>
            <TaskList refreshTrigger={refreshTrigger} />
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <div>
            <h2 style={{ fontFamily: "'Syne'", fontSize: "20px", fontWeight: 800, color: "#3D1A0A", marginBottom: "20px" }}>
              📅 Calendar Events
            </h2>
            <TaskList refreshTrigger={refreshTrigger} defaultTab="events" />
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div>
            <h2 style={{ fontFamily: "'Syne'", fontSize: "20px", fontWeight: 800, color: "#3D1A0A", marginBottom: "20px" }}>
              🕒 Recent History
            </h2>
            <HistoryPanel refreshTrigger={refreshTrigger} onReplay={(msg) => { handleAnalyze(msg); }} />
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: "white", borderTop: "1px solid #FFD4C2",
        padding: "20px", textAlign: "center",
        fontSize: "12px", color: "#C4826A",
      }}>
        Intent Engine · Powered by Llama 3.3 70B · Zero cost · Your data stays local
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 0; }
        @media (max-width: 768px) {
          nav { padding: 0 12px !important; }
        }
      `}</style>
    </div>
  );
}