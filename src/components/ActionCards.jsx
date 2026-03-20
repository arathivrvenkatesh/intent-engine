import { useState } from "react";
import { addEvent, addTask } from "../services/localStore";

const TYPE_CONFIG = {
  meeting: { color: "#4f46e5", bg: "rgba(79,70,229,0.08)", label: "MEETING", border: "rgba(79,70,229,0.2)" },
  task: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "TASK", border: "rgba(5,150,105,0.2)" },
  reminder: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "REMINDER", border: "rgba(245,158,11,0.2)" },
  travel: { color: "#ec4899", bg: "rgba(236,72,153,0.08)", label: "TRAVEL", border: "rgba(236,72,153,0.2)" },
  deadline: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "DEADLINE", border: "rgba(239,68,68,0.2)" },
  event: { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", label: "EVENT", border: "rgba(124,58,237,0.2)" },
  call: { color: "#0891b2", bg: "rgba(8,145,178,0.08)", label: "CALL", border: "rgba(8,145,178,0.2)" },
  unknown: { color: "#6b7280", bg: "rgba(107,114,128,0.08)", label: "UNKNOWN", border: "rgba(107,114,128,0.2)" },
};

const PRIORITY_CONFIG = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  low: { color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" },
};

function EntityChip({ icon, value }) {
  if (!value) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px", borderRadius: "8px",
      background: "var(--bg)", border: "1px solid var(--border)",
      fontSize: "12px", color: "#4b5563",
    }}>
      <span>{icon}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function IntentCard({ intent, index, onExecuted, onMapRequest }) {
  const [executed, setExecuted] = useState([]);
  const [hoveredAction, setHoveredAction] = useState(null);
  const config = TYPE_CONFIG[intent.type] || TYPE_CONFIG.unknown;
  const priorityConfig = PRIORITY_CONFIG[intent.priority] || PRIORITY_CONFIG.medium;
  const pct = Math.round((intent.confidence || 0) * 100);

  const executeAction = (action, ai) => {
    if (executed.includes(ai)) return;
    if (action.toLowerCase().includes("map") || action.toLowerCase().includes("location") || action.toLowerCase().includes("travel")) {
      if (intent.entities?.location) onMapRequest(intent.entities.location);
    }
    if (action.toLowerCase().includes("calendar") || action.toLowerCase().includes("event") || action.toLowerCase().includes("meeting") || action.toLowerCase().includes("schedule")) {
      addEvent({ title: intent.title, type: intent.type, time: intent.entities?.time, date: intent.entities?.date, location: intent.entities?.location, person: intent.entities?.person, priority: intent.priority });
      onExecuted("event", intent.title);
    }
    if (action.toLowerCase().includes("task") || action.toLowerCase().includes("remind") || action.toLowerCase().includes("to-do") || action.toLowerCase().includes("deadline")) {
      addTask({ title: intent.title, type: intent.type, time: intent.entities?.time, date: intent.entities?.date || intent.entities?.deadline, priority: intent.priority });
      onExecuted("task", intent.title);
    }
    if ("Notification" in window && (action.toLowerCase().includes("reminder") || action.toLowerCase().includes("notify"))) {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification("Intent Engine", { body: intent.title });
      });
    }
    setExecuted((prev) => [...prev, ai]);
  };

  return (
    <div style={{
      background: "white", borderRadius: "20px",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden", marginBottom: "16px",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Top color bar */}
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />

      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: config.bg, border: `1px solid ${config.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", flexShrink: 0,
            }}>
              {intent.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                  color: config.color, background: config.bg,
                  padding: "3px 8px", borderRadius: "6px",
                  border: `1px solid ${config.border}`,
                  fontFamily: "'JetBrains Mono'",
                }}>
                  {config.label}
                </span>
                <span style={{
                  fontSize: "10px", padding: "3px 8px", borderRadius: "6px",
                  background: priorityConfig.bg, color: priorityConfig.color,
                  border: `1px solid ${priorityConfig.border}`,
                  fontFamily: "'JetBrains Mono'", fontWeight: 600,
                }}>
                  {intent.priority}
                </span>
              </div>
              <h3 style={{
                fontSize: "16px", fontWeight: 700,
                color: "var(--text-primary)", fontFamily: "'Syne'",
              }}>
                {intent.title}
              </h3>
            </div>
          </div>

          {/* Confidence */}
          <div style={{
            textAlign: "center", padding: "8px 12px", borderRadius: "12px",
            background: pct >= 80 ? "rgba(5,150,105,0.08)" : pct >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${pct >= 80 ? "rgba(5,150,105,0.2)" : pct >= 60 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <div style={{
              fontSize: "16px", fontWeight: 800,
              color: pct >= 80 ? "#059669" : pct >= 60 ? "#f59e0b" : "#ef4444",
              fontFamily: "'Syne'",
            }}>
              {pct}%
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}>
              confidence
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ height: "6px", background: "var(--bg)", borderRadius: "3px", marginBottom: "14px", overflow: "hidden" }}>
          <div style={{
            height: "6px", borderRadius: "3px",
            width: `${pct}%`,
            background: pct >= 80
              ? "linear-gradient(90deg, #059669, #10b981)"
              : pct >= 60
              ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
              : "linear-gradient(90deg, #ef4444, #fca5a5)",
            transition: "width 0.8s ease",
          }} />
        </div>

        {/* Entity chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          <EntityChip icon="⏰" value={intent.entities?.time} />
          <EntityChip icon="📅" value={intent.entities?.date} />
          <EntityChip icon="📍" value={intent.entities?.location} />
          <EntityChip icon="👤" value={intent.entities?.person} />
          <EntityChip icon="⚠️" value={intent.entities?.deadline} />
          <EntityChip icon="⏱️" value={intent.entities?.duration} />
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)", marginBottom: "14px" }} />

        {/* Actions label */}
        <p style={{
          fontSize: "10px", color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em",
          marginBottom: "10px", fontWeight: 600,
        }}>
          SUGGESTED ACTIONS
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {intent.actions?.map((action, ai) => (
            <button
              key={ai}
              onClick={() => executeAction(action, ai)}
              onMouseEnter={() => setHoveredAction(ai)}
              onMouseLeave={() => setHoveredAction(null)}
              style={{
                width: "100%", textAlign: "left",
                padding: "11px 16px", borderRadius: "12px",
                background: executed.includes(ai)
                  ? config.bg
                  : hoveredAction === ai
                  ? "var(--bg)"
                  : "white",
                border: `1px solid ${executed.includes(ai) ? config.border : hoveredAction === ai ? config.border : "var(--border)"}`,
                color: executed.includes(ai) ? config.color : "var(--text-primary)",
                fontSize: "13px", cursor: executed.includes(ai) ? "default" : "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.15s ease", fontWeight: 500,
              }}
            >
              <span>{action}</span>
              <span style={{
                fontSize: "11px",
                color: executed.includes(ai) ? config.color : "var(--text-muted)",
                fontWeight: 600,
              }}>
                {executed.includes(ai) ? "✓ Done" : "Run →"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActionCards({ result, onExecuted, onMapRequest }) {
  if (!result) return null;
  const { intents, summary } = result;

  return (
    <div>
      {/* Summary banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", borderRadius: "16px", marginBottom: "20px",
        background: "white", border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: "var(--accent-dim)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "20px",
          flexShrink: 0,
        }}>🧠</div>
        <div>
          <p style={{
            fontSize: "10px", color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em",
            marginBottom: "3px", fontWeight: 600,
          }}>
            {intents?.length} INTENT{intents?.length !== 1 ? "S" : ""} DETECTED
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600 }}>
            {summary}
          </p>
        </div>
      </div>

      {/* Cards */}
      {intents?.map((intent, i) => (
        <IntentCard
          key={i}
          intent={intent}
          index={i}
          onExecuted={onExecuted}
          onMapRequest={onMapRequest}
        />
      ))}
    </div>
  );
}