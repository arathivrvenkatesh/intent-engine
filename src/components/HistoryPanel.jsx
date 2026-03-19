import { getHistory, clearHistory } from "../services/localStore";
import { useState, useEffect } from "react";

export default function HistoryPanel({ refreshTrigger, onReplay }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshTrigger]);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--panel)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span>🕒</span>
          <span className="text-sm font-semibold" style={{ fontFamily: "'Syne'", color: "var(--bright)" }}>
            Recent
          </span>
        </div>
        <button
          onClick={handleClear}
          className="text-xs transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) => (e.target.style.color = "#ff6584")}
          onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
        >
          Clear
        </button>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        {history.slice(0, 5).map((h) => (
          <button
            key={h.id}
            onClick={() => onReplay(h.message)}
            className="w-full px-4 py-3 text-left transition-colors group"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--panel)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <p
              className="text-xs truncate"
              style={{ color: "var(--soft)", fontFamily: "'DM Sans'" }}
            >
              {h.message}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "'JetBrains Mono'" }}>
              {new Date(h.timestamp).toLocaleTimeString()} · {h.intentCount} intent{h.intentCount !== 1 ? "s" : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}