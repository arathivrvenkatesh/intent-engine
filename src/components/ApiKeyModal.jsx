import { useState } from "react";
import { saveApiKey } from "../services/localStore";

export default function ApiKeyModal({ onSaved }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!key.trim().startsWith("gsk_")) {
      setError("Groq API keys start with gsk_ — please check your key");
      return;
    }
    saveApiKey(key.trim());
    onSaved(key.trim());
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 animate-[slideUp_0.4s_ease-out]"
        style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4"
            style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)" }}
          >
            ⚡
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne'", color: "var(--bright)" }}>
            Intent Engine
          </h1>
          <p className="text-sm" style={{ color: "var(--soft)" }}>
            AI-powered action layer for your messages
          </p>
        </div>

        {/* Steps */}
        <div
          className="rounded-xl p-4 mb-6 space-y-2"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)", fontFamily: "'Syne'", letterSpacing: "0.08em" }}>
            GET YOUR FREE API KEY
          </p>
          {[
            { step: "1", text: "Go to console.groq.com" },
            { step: "2", text: "Sign up with Google (no card needed)" },
            { step: "3", text: "API Keys → Create New Key" },
            { step: "4", text: "Paste it below" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: "rgba(108,99,255,0.2)", color: "var(--accent)", fontFamily: "'JetBrains Mono'" }}
              >
                {s.step}
              </span>
              <span className="text-sm" style={{ color: "var(--soft)" }}>{s.text}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all duration-200"
            style={{
              background: "var(--surface)",
              border: `1px solid ${error ? "#ff6584" : "var(--border)"}`,
              color: "var(--bright)",
              fontFamily: "'JetBrains Mono'",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "var(--border)";
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {error && (
            <p className="text-xs mt-2" style={{ color: "#ff6584" }}>{error}</p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: key.trim() ? "var(--accent)" : "var(--border)",
            color: key.trim() ? "white" : "var(--muted)",
            fontFamily: "'Syne'",
            letterSpacing: "0.04em",
            cursor: key.trim() ? "pointer" : "not-allowed",
          }}
        >
          Launch Intent Engine →
        </button>

        <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
          Key is stored only in your browser. Never leaves your device.
        </p>
      </div>
    </div>
  );
}