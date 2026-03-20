import { useState, useEffect } from "react";
import { getTasks, toggleTask, deleteTask } from "../services/localStore";

export default function TaskList({ refreshTrigger, showOnly }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(getTasks());
  }, [refreshTrigger]);

  const handleToggle = (id) => {
    toggleTask(id);
    setTasks(getTasks());
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setTasks(getTasks());
  };

  const PRIORITY_COLOR = {
    high: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
    medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    low: { color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" },
  };

  if (tasks.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 20px",
        background: "white", borderRadius: "20px",
        border: "1px solid #FFD4C2",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "#3D1A0A", marginBottom: "8px" }}>
          No tasks yet
        </p>
        <p style={{ fontSize: "13px", color: "#C4826A" }}>
          Analyze a message with a task or deadline to auto-create tasks
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {tasks.map((task) => {
        const pc = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium;
        return (
          <div key={task.id} style={{
            background: "white", borderRadius: "16px",
            border: "1px solid #FFD4C2", padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(255,160,122,0.08)",
            display: "flex", alignItems: "center", gap: "14px",
            opacity: task.done ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}>
            <button
              onClick={() => handleToggle(task.id)}
              style={{
                width: "22px", height: "22px", borderRadius: "50%",
                border: `2px solid ${task.done ? "#059669" : "#FFD4C2"}`,
                background: task.done ? "#059669" : "white",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {task.done && <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>✓</span>}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "14px", fontWeight: 600, color: "#3D1A0A",
                textDecoration: task.done ? "line-through" : "none",
                marginBottom: "4px",
              }}>
                {task.title}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {task.date && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A" }}>
                    📅 {task.date}
                  </span>
                )}
                {task.time && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A" }}>
                    ⏰ {task.time}
                  </span>
                )}
                {task.priority && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color, fontWeight: 600 }}>
                    ● {task.priority}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#E8B4A0", fontSize: "16px", flexShrink: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#E8B4A0"}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}