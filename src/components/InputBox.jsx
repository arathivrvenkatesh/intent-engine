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
      {/* Textarea */}
      <div style={{
        borderRadius: "12px",
        border: `1.5px solid ${focused ? "var(--accent)" : "var(--border)"}`,
        background: "var(--surface)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(124,111,255,0.08)" : "none",
        marginBottom: "14px",
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKey}
          placeholder={`Paste any message here...\n\ne.g. "Let's meet at 5pm in Indiranagar tomorrow"`}
          rows={5}
          style={{
            width: "100%", background: "transparent",
            border: "none", outline: "none", resize: "none",
            padding: "16px", fontSize: "14px", lineHeight: "1.7",
            color: "var(--text-primary)", fontFamily: "'Inter', sans-serif",
            caretColor: "var(--accent)",
          }}
        />

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          borderTop: "1px solid var(--border)",
        }}>
          <span style={{
            fontSize: "11px", color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono'"
          }}>
            {value.length > 0 ? `${value.length} chars · Ctrl+Enter` : "Ctrl+Enter to analyze"}
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            {value && (
              <button
                onClick={() => setValue("")}
                style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                  background: "none", border: "1px solid var(--border)",
                  color: "var(--text-muted)", cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || loading}
              style={{
                padding: "6px 18px", borderRadius: "8px", fontSize: "13px",
                fontWeight: 600, cursor: !value.trim() || loading ? "not-allowed" : "pointer",
                background: !value.trim() || loading ? "var(--border)" : "var(--accent)",
                color: !value.trim() || loading ? "var(--text-muted)" : "white",
                border: "none", display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'Syne'", transition: "all 0.15s ease",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    border: "2px solid white", borderTopColor: "transparent",
                    display: "inline-block", animation: "spin 0.7s linear infinite"
                  }} />
                  Analyzing...
                </>
              ) : (
                <> ⚡ Analyze Intent </>
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
          marginBottom: "8px"
        }}>
          TRY AN EXAMPLE →
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setValue(ex); textareaRef.current?.focus(); }}
              style={{
                padding: "5px 12px", borderRadius: "20px", fontSize: "12px",
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer",
                fontFamily: "'Inter'", transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}