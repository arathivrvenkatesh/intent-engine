import { useState, useEffect } from "react";
import { getTasks, toggleTask, deleteTask, getEvents, deleteEvent } from "../services/localStore";

function EmptyState({ icon, text }) {
  return (
    <div className="py-8 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{text}</p>
    </div>
  );
}

export default function TaskList({ refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("tasks");

  const refresh = () => {
    setTasks(getTasks());
    setEvents(getEvents());
  };

  useEffect(() => {
    refresh();
  }, [refreshTrigger]);

  const handleToggle = (id) => {
    toggleTask(id);
    refresh();
  };

  const handleDeleteTask = (id) => {
    deleteTask(id);
    refresh();
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    refresh();
  };

  const PRIORITY_COLOR = { high: "#ff6584", medium: "#ffb347", low: "#43ffaf" };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="flex" style={{ background: "var(--panel)", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "tasks", label: "Tasks", count: tasks.length },
          { key: "events", label: "Calendar", count: events.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Syne'",
              color: tab === t.key ? "var(--bright)" : "var(--muted)",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-md"
                style={{
                  background: tab === t.key ? "var(--accent)" : "var(--border)",
                  color: tab === t.key ? "white" : "var(--muted)",
                  fontFamily: "'JetBrains Mono'",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-72 overflow-y-auto" style={{ background: "var(--surface)" }}>
        {tab === "tasks" && (
          <>
            {tasks.length === 0 ? (
              <EmptyState icon="✅" text="No tasks yet. Analyze a message to auto-create tasks." />
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl group transition-all duration-200"
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      opacity: task.done ? 0.5 : 1,
                    }}
                  >
                    <button
                      onClick={() => handleToggle(task.id)}
                      className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center"
                      style={{
                        borderColor: task.done ? "#43ffaf" : "var(--muted)",
                        background: task.done ? "#43ffaf" : "transparent",
                      }}
                    >
                      {task.done && <span className="text-xs text-black font-bold">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm"
                        style={{
                          color: "var(--bright)",
                          textDecoration: task.done ? "line-through" : "none",
                          fontFamily: "'DM Sans'",
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.date && (
                          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "'JetBrains Mono'" }}>
                            {task.date}
                          </span>
                        )}
                        {task.time && (
                          <span className="text-xs" style={{ color: "var(--muted)" }}>⏰ {task.time}</span>
                        )}
                        {task.priority && (
                          <span className="text-xs" style={{ color: PRIORITY_COLOR[task.priority] || "var(--muted)" }}>
                            ● {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                      style={{ color: "#ff6584" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "events" && (
          <>
            {events.length === 0 ? (
              <EmptyState icon="📅" text="No calendar events yet. Analyze a message to auto-create events." />
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl group transition-all duration-200"
                    style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--bright)", fontFamily: "'Syne'" }}>
                          {event.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {event.date && (
                            <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "'JetBrains Mono'" }}>
                              📅 {event.date}
                            </span>
                          )}
                          {event.time && (
                            <span className="text-xs" style={{ color: "var(--muted)" }}>⏰ {event.time}</span>
                          )}
                          {event.location && (
                            <span className="text-xs" style={{ color: "var(--accent)" }}>📍 {event.location}</span>
                          )}
                          {event.person && (
                            <span className="text-xs" style={{ color: "var(--soft)" }}>👤 {event.person}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                        style={{ color: "#ff6584" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}