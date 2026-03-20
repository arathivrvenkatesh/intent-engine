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
    showToast(type === "event" ? `📅 Saved: ${title}` : `✅ Saved: ${title}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 200,
          background: "white", border: "1px solid var(--border)",
          color: "var(--text-primary)", padding: "12px 18px",
          borderRadius: "12px", fontSize: "13px", fontWeight: 500,
          boxShadow: "var(--shadow-lg)",
          borderLeft: "4px solid var(--accent)",
        }}>
          {toast}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "white",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", lineHeight: 1 }}>
              Intent Engine
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}>
              AI Action Layer
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "20px",
            background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>Live</span>
          </div>
          <div style={{
            padding: "6px 12px", borderRadius: "20px",
            background: "var(--accent-dim)", border: "1px solid var(--border)",
            fontSize: "11px", color: "var(--accent)",
            fontFamily: "'JetBrains Mono'", fontWeight: 500,
          }}>
            Llama 3.3 70B
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
        padding: "48px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: "-40px", left: "-40px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "20px",
            background: "rgba(255,255,255,0.15)", marginBottom: "20px",
            fontSize: "12px", color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
          }}>
            ✨ Powered by Llama 3.3 70B — Zero cost
          </div>
          <h1 style={{
            fontFamily: "'Syne'", fontSize: "clamp(24px, 5vw, 40px)",
            fontWeight: 800, color: "white", marginBottom: "12px",
            lineHeight: 1.2, letterSpacing: "-0.5px",
          }}>
            What do you need to do?
          </h1>
          <p style={{
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "rgba(255,255,255,0.75)", maxWidth: "500px",
            margin: "0 auto",
          }}>
            Paste any message — WhatsApp, email, or note. AI extracts intent and creates actions automatically.
          </p>
        </div>
      </div>

      {/* ── INPUT CARD (overlaps hero) ── */}
      <div style={{ maxWidth: "800px", margin: "-40px auto 0", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{
          background: "white", borderRadius: "20px",
          padding: "24px", boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}>
          <InputBox onAnalyze={handleAnalyze} loading={loading} />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1200px", margin: "32px auto 100px", padding: "0 16px" }}>

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px", padding: "14px 18px", marginBottom: "24px",
            fontSize: "13px", color: "var(--red)", display: "flex", gap: "8px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "white", borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>
                Analyzing your message...
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Llama 3.3 70B is extracting intents
              </p>
            </div>
          </div>
        )}

        {/* Desktop layout */}
        <div className="desktop-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
          {/* Left */}
          <div>
            {result && !loading && (
              <ActionCards result={result} onExecuted={handleExecuted} onMapRequest={setMapLocation} />
            )}
            {!result && !loading && (
              <div style={{
                background: "white", borderRadius: "20px",
                padding: "60px 24px", textAlign: "center",
                border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
              }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "20px",
                  background: "var(--accent-dim)", margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px",
                }}>🧠</div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Ready to analyze
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "280px", margin: "0 auto" }}>
                  Paste any message above — meeting invites, deadlines, reminders, anything
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <MapView location={mapLocation} />
            <TaskList refreshTrigger={refreshTrigger} />
            <HistoryPanel refreshTrigger={refreshTrigger} onReplay={handleAnalyze} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="mobile-layout" style={{ display: "none" }}>
          {mobileTab === "analyze" && (
            <div>
              {loading && (
                <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px", border: "1px solid var(--border)" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Analyzing...</p>
                </div>
              )}
              {error && (
                <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "var(--red)" }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {mobileTab === "results" && (
            <div>
              {result && !loading ? (
                <ActionCards result={result} onExecuted={handleExecuted} onMapRequest={(loc) => { setMapLocation(loc); setMobileTab("map"); }} />
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🧠</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No results yet — paste a message in the Analyze tab</p>
                </div>
              )}
            </div>
          )}

          {mobileTab === "map" && <MapView location={mapLocation} />}

          {mobileTab === "tasks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <TaskList refreshTrigger={refreshTrigger} />
              <HistoryPanel refreshTrigger={refreshTrigger} onReplay={(msg) => { handleAnalyze(msg); setMobileTab("analyze"); }} />
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-nav" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid var(--border)",
        zIndex: 100, padding: "8px 0 16px",
        boxShadow: "0 -4px 20px rgba(79,70,229,0.08)",
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
              fontSize: "10px", cursor: "pointer", fontWeight: mobileTab === tab.key ? 700 : 400,
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px", padding: "4px 8px",
              fontFamily: "'Plus Jakarta Sans'",
            }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: mobileTab === tab.key ? "var(--accent-dim)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", transition: "all 0.2s",
            }}>
              {tab.icon}
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: "white", borderTop: "1px solid var(--border)",
        padding: "20px", textAlign: "center",
        fontSize: "12px", color: "var(--text-muted)",
      }}>
        Intent Engine · Powered by Llama 3.3 70B · Zero cost · Your data stays local
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: block !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}