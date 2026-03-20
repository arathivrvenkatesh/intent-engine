import { useState, useRef } from "react";

const EXAMPLES = [
  "Let's meet at 5pm in Indiranagar tomorrow",
  "Submit the project report by Friday 11am",
  "Movie tonight at 8 in Bangalore, book seats",
  "Call with Rahul at 3pm, discuss Q3 numbers",
  "Gym at 6am tomorrow, don't forget protein shake",
  "Team standup Monday 10am, send Zoom link to everyone",
];

export default function InputBox({ onAnalyze, loading }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!value.trim() || loading) return;
    onAnalyze(value.trim());
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div>
      {/* Textarea wrapper */}
      <div style={{
        borderRadius: "14px",
        border: `2px solid ${focused ? "var(--accent)" : "var(--border)"}`,
        background: focused ? "white" : "var(--bg)",
        transition: "all 0.2s ease",
        boxShadow: focused ? "0 0 0 4px rgba(79,70,229,0.08)" : "none",
        marginBottom: "14px",
        overflow: "hidden",
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKey}
          placeholder={"Paste any message here...\n\ne.g. \"Let's meet at 5pm in Indiranagar tomorrow\""}
          rows={5}
          style={{
            width: "100%", background: "transparent",
            border: "none", outline: "none", resize: "none",
            padding: "16px", fontSize: "14px", lineHeight: "1.7",
            color: "var(--text-primary)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            caretColor: "var(--accent)",
          }}
        />

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderTop: `1px solid ${focused ? "var(--border)" : "var(--border)"}`,
          background: "var(--bg)",
        }}>
          <span style={{
            fontSize: "11px", color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono'",
          }}>
            {value.length > 0 ? `${value.length} chars · Ctrl+Enter` : "Ctrl+Enter to analyze"}
          </span>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {value && (
              <button
                onClick={() => setValue("")}
                style={{
                  padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
                  background: "white", border: "1px solid var(--border)",
                  color: "var(--text-muted)", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans'",
                }}
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || loading}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                fontSize: "13px", fontWeight: 700,
                cursor: !value.trim() || loading ? "not-allowed" : "pointer",
                background: !value.trim() || loading
                  ? "var(--border)"
                  : "linear-gradient(135deg, var(--accent), var(--accent-2))",
                color: !value.trim() || loading ? "var(--text-muted)" : "white",
                border: "none",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'Syne'",
                boxShadow: !value.trim() || loading ? "none" : "0 4px 12px rgba(79,70,229,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Analyzing...
                </>
              ) : (
                <>⚡ Analyze Intent</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Example pills */}
      <div>
        <p style={{
          fontSize: "11px", color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em",
          marginBottom: "10px", fontWeight: 600,
        }}>
          TRY AN EXAMPLE →
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setValue(ex); textareaRef.current?.focus(); }}
              style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                background: "white", border: "1px solid var(--border)",
                color: "#6366f1", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans'", fontWeight: 500,
                transition: "all 0.15s ease",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-dim)";
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}