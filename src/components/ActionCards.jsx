import { useState } from "react";
import { addEvent, addTask } from "../services/localStore";

const TYPE_CONFIG = {
  meeting: { color: "#7c6fff", bg: "rgba(124,111,255,0.08)", label: "MEETING" },
  task: { color: "#34d399", bg: "rgba(52,211,153,0.08)", label: "TASK" },
  reminder: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", label: "REMINDER" },
  travel: { color: "#f87171", bg: "rgba(248,113,113,0.08)", label: "TRAVEL" },
  deadline: { color: "#f87171", bg: "rgba(248,113,113,0.08)", label: "DEADLINE" },
  event: { color: "#7c6fff", bg: "rgba(124,111,255,0.08)", label: "EVENT" },
  call: { color: "#34d399", bg: "rgba(52,211,153,0.08)", label: "CALL" },
  unknown: { color: "#9090b0", bg: "rgba(144,144,176,0.08)", label: "UNKNOWN" },
};

const PRIORITY_CONFIG = {
  high: { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  low: { color: "#34d399", bg: "rgba(52,211,153,0.12)" },
};

function EntityChip({ icon, value }) {
  if (!value) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px", borderRadius: "8px",
      background: "var(--surface)", border: "1px solid var(--border)",
      fontSize: "12px", color: "var(--text-secondary)"
    }}>
      <span style={{ fontSize: "11px" }}>{icon}</span>
      <span style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function ActionButton({ label, executed, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        padding: "10px 14px", borderRadius: "10px",
        background: executed ? `${color}12` : "var(--surface)",
        border: `1px solid ${executed ? color : "var(--border)"}`,
        color: executed ? color : "var(--text-secondary)",
        fontSize: "13px", cursor: executed ? "default" : "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!executed) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.background = `${color}08`;
        }
      }}
      onMouseLeave={(e) => {
        if (!executed) {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.background = "var(--surface)";
        }
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: "11px", opacity: 0.7 }}>
        {executed ? "✓ Done" : "Execute →"}
      </span>
    </button>
  );
}

function IntentCard({ intent, index, onExecuted, onMapRequest }) {
  const [executed, setExecuted] = useState([]);
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
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "16px",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-hover)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Card top accent bar */}
      <div style={{ height: "3px", background: config.color, opacity: 0.8 }} />

      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: config.bg, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "20px",
              border: `1px solid ${config.color}22`,
              flexShrink: 0,
            }}>
              {intent.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
                  color: config.color, fontFamily: "'JetBrains Mono'"
                }}>
                  {config.label}
                </span>
                <span style={{
                  fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                  background: priorityConfig.bg, color: priorityConfig.color,
                  fontFamily: "'JetBrains Mono'", letterSpacing: "0.04em"
                }}>
                  {intent.priority}
                </span>
              </div>
              <h3 style={{
                fontSize: "15px", fontWeight: 600,
                color: "var(--text-primary)", fontFamily: "'Syne'",
              }}>
                {intent.title}
              </h3>
            </div>
          </div>

          {/* Confidence badge */}
          <div style={{
            fontSize: "13px", fontWeight: 600,
            color: pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171",
            fontFamily: "'JetBrains Mono'",
            background: "var(--surface)", border: "1px solid var(--border)",
            padding: "4px 10px", borderRadius: "8px",
          }}>
            {pct}%
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{
          height: "3px", background: "var(--border)",
          borderRadius: "2px", marginBottom: "14px"
        }}>
          <div style={{
            height: "3px", borderRadius: "2px",
            width: `${pct}%`,
            background: pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171",
            transition: "width 0.6s ease",
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

        {/* Actions */}
        <p style={{
          fontSize: "10px", color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em",
          marginBottom: "8px"
        }}>
          ACTIONS
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {intent.actions?.map((action, ai) => (
            <ActionButton
              key={ai}
              label={action}
              executed={executed.includes(ai)}
              onClick={() => executeAction(action, ai)}
              color={config.color}
            />
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
      {/* Summary */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 16px", borderRadius: "12px", marginBottom: "16px",
        background: "var(--card)", border: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "18px" }}>🧠</span>
        <div>
          <p style={{
            fontSize: "10px", color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", marginBottom: "2px"
          }}>
            {intents?.length} INTENT{intents?.length !== 1 ? "S" : ""} DETECTED
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{summary}</p>
        </div>
      </div>

      {/* Intent cards */}
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