import { useState } from "react";
import { addEvent, addTask } from "../services/localStore";

const TYPE_CONFIG = {
  meeting: { color: "#FFA07A", bg: "rgba(255,160,122,0.1)", label: "MEETING", border: "#FFD4C2" },
  task: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "TASK", border: "rgba(5,150,105,0.2)" },
  reminder: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "REMINDER", border: "rgba(245,158,11,0.2)" },
  travel: { color: "#ec4899", bg: "rgba(236,72,153,0.08)", label: "TRAVEL", border: "rgba(236,72,153,0.2)" },
  deadline: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "DEADLINE", border: "rgba(239,68,68,0.2)" },
  event: { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", label: "EVENT", border: "rgba(124,58,237,0.2)" },
  call: { color: "#0891b2", bg: "rgba(8,145,178,0.08)", label: "CALL", border: "rgba(8,145,178,0.2)" },
  unknown: { color: "#C4826A", bg: "rgba(196,130,106,0.08)", label: "UNKNOWN", border: "#FFD4C2" },
};

const PRIORITY_COLOR = {
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
      background: "#FFF5F0", border: "1px solid #FFD4C2",
      fontSize: "12px", color: "#C4826A",
    }}>
      <span>{icon}</span>
      <span style={{ fontWeight: 500, color: "#3D1A0A" }}>{value}</span>
    </div>
  );
}

function IntentCard({ intent, onExecuted, onMapRequest }) {
  const [savedAsTask, setSavedAsTask] = useState(false);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderTime, setReminderTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [wantReminder, setWantReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  const config = TYPE_CONFIG[intent.type] || TYPE_CONFIG.unknown;
  const priorityConfig = PRIORITY_COLOR[intent.priority] || PRIORITY_COLOR.medium;
  const pct = Math.round((intent.confidence || 0) * 100);

  const handleSaveTask = () => {
    addTask({
      title: intent.title,
      type: intent.type,
      time: intent.entities?.time,
      date: intent.entities?.date || intent.entities?.deadline,
      priority: intent.priority,
    });
    setSavedAsTask(true);
    onExecuted("task", intent.title);
  };

  const handleSaveToCalendar = async () => {
    setSaving(true);
    try {
      addEvent({
        title: intent.title,
        type: intent.type,
        time: intent.entities?.time,
        date: intent.entities?.date,
        location: intent.entities?.location,
        person: intent.entities?.person,
        priority: intent.priority,
        reminderEmail: wantReminder ? reminderEmail : null,
        reminderTime: wantReminder ? reminderTime : null,
      });

      if (wantReminder && reminderEmail && reminderTime) {
        await fetch(
          "https://intent-engine-api.intent-engine-api.workers.dev/reminder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: intent.title,
              reminderDateTime: reminderTime,
              email: reminderEmail,
              entities: intent.entities,
            }),
          }
        );

        if ("Notification" in window) {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            const reminderDate = new Date(reminderTime);
            const delay = reminderDate.getTime() - Date.now();
            if (delay > 0) {
              setTimeout(() => {
                new Notification("⏰ Intent Engine Reminder", {
                  body: intent.title,
                  icon: "/icon-192.png",
                });
              }, delay);
            }
          }
        }
      }

      setCalendarSaved(true);
      setShowCalendarForm(false);
      onExecuted("event", intent.title);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: "white", borderRadius: "20px",
      border: "1px solid #FFD4C2",
      boxShadow: "0 2px 12px rgba(255,160,122,0.1)",
      overflow: "hidden", marginBottom: "16px",
    }}>
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />

      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "12px",
              background: config.bg, border: `1px solid ${config.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", flexShrink: 0,
            }}>
              {intent.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700,
                  color: config.color, background: config.bg,
                  padding: "3px 8px", borderRadius: "6px",
                  border: `1px solid ${config.border}`,
                  fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em",
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
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#3D1A0A", fontFamily: "'Syne'" }}>
                {intent.title}
              </h3>
            </div>
          </div>

          <div style={{
            textAlign: "center", padding: "8px 12px", borderRadius: "12px",
            background: "#FFF0EB", border: "1px solid #FFD4C2", flexShrink: 0,
          }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFA07A", fontFamily: "'Syne'" }}>{pct}%</div>
            <div style={{ fontSize: "9px", color: "#C4826A", fontFamily: "'JetBrains Mono'" }}>confidence</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ height: "6px", background: "#FFF0EB", borderRadius: "3px", marginBottom: "14px", overflow: "hidden" }}>
          <div style={{
            height: "6px", borderRadius: "3px", width: `${pct}%`,
            background: "linear-gradient(90deg, #FFA07A, #FF6B35)",
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

        <div style={{ height: "1px", background: "#FFE8DC", marginBottom: "16px" }} />

        {/* Action buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            onClick={handleSaveTask}
            disabled={savedAsTask}
            style={{
              padding: "9px 16px", borderRadius: "10px", fontSize: "12px",
              fontWeight: 600, cursor: savedAsTask ? "default" : "pointer",
              background: savedAsTask ? "rgba(5,150,105,0.08)" : "#FFF5F0",
              border: `1px solid ${savedAsTask ? "rgba(5,150,105,0.3)" : "#FFD4C2"}`,
              color: savedAsTask ? "#059669" : "#3D1A0A",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (!savedAsTask) { e.currentTarget.style.background = "#FFE8DC"; e.currentTarget.style.borderColor = "#FFA07A"; } }}
            onMouseLeave={(e) => { if (!savedAsTask) { e.currentTarget.style.background = "#FFF5F0"; e.currentTarget.style.borderColor = "#FFD4C2"; } }}
          >
            {savedAsTask ? "✓ Saved to Tasks" : "✅ Save as Task"}
          </button>

          <button
            onClick={() => !calendarSaved && setShowCalendarForm(!showCalendarForm)}
            disabled={calendarSaved}
            style={{
              padding: "9px 16px", borderRadius: "10px", fontSize: "12px",
              fontWeight: 600, cursor: calendarSaved ? "default" : "pointer",
              background: calendarSaved ? "rgba(5,150,105,0.08)" : "linear-gradient(135deg, #FFA07A, #FF6B35)",
              border: "none",
              color: calendarSaved ? "#059669" : "white",
              boxShadow: calendarSaved ? "none" : "0 2px 8px rgba(255,107,53,0.25)",
              transition: "all 0.15s",
            }}
          >
            {calendarSaved ? "✓ Saved to Calendar" : "📅 Save to Calendar"}
          </button>

          {intent.entities?.location && (
            <button
              onClick={() => onMapRequest(intent.entities.location)}
              style={{
                padding: "9px 16px", borderRadius: "10px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer",
                background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#3D1A0A",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FFE8DC"; e.currentTarget.style.borderColor = "#FFA07A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF5F0"; e.currentTarget.style.borderColor = "#FFD4C2"; }}
            >
              🗺️ Open Map
            </button>
          )}
        </div>

        {/* Calendar + Reminder Form */}
        {showCalendarForm && (
          <div style={{
            marginTop: "16px", padding: "20px", borderRadius: "16px",
            background: "#FFF5F0", border: "1px solid #FFD4C2",
          }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#3D1A0A", marginBottom: "4px", fontFamily: "'Syne'" }}>
              📅 Save to Calendar
            </p>
            <p style={{ fontSize: "12px", color: "#C4826A", marginBottom: "16px" }}>
              Save <strong>{intent.title}</strong> and optionally set an email reminder
            </p>

            {/* Reminder toggle */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "10px",
                background: "white", border: "1px solid #FFD4C2",
                marginBottom: "12px", cursor: "pointer",
              }}
              onClick={() => setWantReminder(!wantReminder)}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "6px",
                background: wantReminder ? "#FFA07A" : "white",
                border: `2px solid ${wantReminder ? "#FFA07A" : "#FFD4C2"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s",
              }}>
                {wantReminder && <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>✓</span>}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#3D1A0A" }}>⏰ Send me an email reminder</p>
                <p style={{ fontSize: "11px", color: "#C4826A" }}>Email will be sent at exactly the time you choose</p>
              </div>
            </div>

            {wantReminder && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#C4826A", fontWeight: 600, display: "block", marginBottom: "4px", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em" }}>
                    YOUR EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px",
                      border: "1px solid #FFD4C2", background: "white",
                      fontSize: "13px", color: "#3D1A0A", outline: "none",
                      fontFamily: "'Plus Jakarta Sans'",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#FFA07A"}
                    onBlur={(e) => e.target.style.borderColor = "#FFD4C2"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#C4826A", fontWeight: 600, display: "block", marginBottom: "4px", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em" }}>
                    SEND REMINDER EMAIL AT
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px",
                      border: "1px solid #FFD4C2", background: "white",
                      fontSize: "13px", color: "#3D1A0A", outline: "none",
                      fontFamily: "'Plus Jakarta Sans'",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#FFA07A"}
                    onBlur={(e) => e.target.style.borderColor = "#FFD4C2"}
                  />
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(255,160,122,0.08)", border: "1px solid #FFD4C2",
                  fontSize: "12px", color: "#C4826A",
                }}>
                  📧 Email will be sent to <strong>{reminderEmail || "your email"}</strong> at exactly <strong>{reminderTime ? new Date(reminderTime).toLocaleString() : "the time you set"}</strong>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSaveToCalendar}
                disabled={saving || (wantReminder && (!reminderEmail || !reminderTime))}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  background: saving || (wantReminder && (!reminderEmail || !reminderTime))
                    ? "#FFE8DC"
                    : "linear-gradient(135deg, #FFA07A, #FF6B35)",
                  border: "none",
                  color: saving || (wantReminder && (!reminderEmail || !reminderTime)) ? "#C4826A" : "white",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Syne'",
                }}
              >
                {saving ? "Saving..." : "✓ Confirm & Save"}
              </button>
              <button
                onClick={() => setShowCalendarForm(false)}
                style={{
                  padding: "11px 16px", borderRadius: "10px",
                  background: "white", border: "1px solid #FFD4C2",
                  color: "#C4826A", fontSize: "13px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActionCards({ result, onExecuted, onMapRequest }) {
  if (!result) return null;
  const { intents, summary } = result;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", borderRadius: "16px", marginBottom: "20px",
        background: "white", border: "1px solid #FFD4C2",
        boxShadow: "0 2px 8px rgba(255,160,122,0.08)",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "#FFF0EB", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "20px", flexShrink: 0,
        }}>🧠</div>
        <div>
          <p style={{ fontSize: "10px", color: "#C4826A", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", marginBottom: "2px", fontWeight: 600 }}>
            {intents?.length} INTENT{intents?.length !== 1 ? "S" : ""} DETECTED
          </p>
          <p style={{ fontSize: "14px", color: "#3D1A0A", fontWeight: 600 }}>{summary}</p>
        </div>
      </div>

      {intents?.map((intent, i) => (
        <IntentCard key={i} intent={intent} onExecuted={onExecuted} onMapRequest={onMapRequest} />
      ))}
    </div>
  );
}