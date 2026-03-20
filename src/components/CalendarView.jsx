import { useState, useEffect } from "react";
import { getEvents, deleteEvent } from "../services/localStore";

export default function CalendarView({ refreshTrigger }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getEvents());
  }, [refreshTrigger]);

  const handleDelete = (id) => {
    deleteEvent(id);
    setEvents(getEvents());
  };

  if (events.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 20px",
        background: "white", borderRadius: "20px",
        border: "1px solid #FFD4C2",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "#3D1A0A", marginBottom: "8px" }}>
          No calendar events yet
        </p>
        <p style={{ fontSize: "13px", color: "#C4826A" }}>
          Analyze a message with a meeting or event to auto-create calendar entries
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {events.map((event) => (
        <div key={event.id} style={{
          background: "white", borderRadius: "16px",
          border: "1px solid #FFD4C2", padding: "20px",
          boxShadow: "0 2px 8px rgba(255,160,122,0.08)",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "#FFF0EB", border: "1px solid #FFD4C2",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", flexShrink: 0,
            }}>
              📅
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#3D1A0A", marginBottom: "6px", fontFamily: "'Syne'" }}>
                {event.title}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {event.date && (
                  <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A" }}>
                    📅 {event.date}
                  </span>
                )}
                {event.time && (
                  <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A" }}>
                    ⏰ {event.time}
                  </span>
                )}
                {event.location && (
                  <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#FFA07A" }}>
                    📍 {event.location}
                  </span>
                )}
                {event.person && (
                  <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A" }}>
                    👤 {event.person}
                  </span>
                )}
                {event.priority && (
                  <span style={{
                    fontSize: "12px", padding: "3px 10px", borderRadius: "8px",
                    background: event.priority === "high" ? "rgba(239,68,68,0.08)" : "#FFF5F0",
                    border: `1px solid ${event.priority === "high" ? "rgba(239,68,68,0.2)" : "#FFD4C2"}`,
                    color: event.priority === "high" ? "#ef4444" : "#C4826A",
                    fontWeight: 600,
                  }}>
                    ● {event.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(event.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#E8B4A0", fontSize: "18px", flexShrink: 0,
              padding: "4px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#E8B4A0"}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}