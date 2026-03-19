const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are an intent extraction engine. Analyze user messages and extract structured intent data.

Always respond with ONLY a valid JSON object. No explanation, no markdown, no backticks.

JSON structure:
{
  "intents": [
    {
      "type": "meeting" | "task" | "reminder" | "travel" | "deadline" | "event" | "call" | "unknown",
      "confidence": 0.0-1.0,
      "title": "short action title",
      "description": "what should happen",
      "entities": {
        "time": "extracted time or null",
        "date": "extracted date or null",
        "location": "extracted location or null",
        "person": "extracted person name or null",
        "deadline": "extracted deadline or null",
        "duration": "extracted duration or null"
      },
      "actions": ["action1", "action2"],
      "priority": "high" | "medium" | "low",
      "icon": "📅" | "✅" | "⏰" | "🗺️" | "📞" | "🎯" | "📌"
    }
  ],
  "raw_message": "original message",
  "summary": "one line summary of what was detected"
}

Rules:
- Extract ALL intents from a single message (multi-intent support)
- For times like "tomorrow", "tonight", calculate relative to today
- Location: extract city, area, or place name
- Actions should be specific: "Create calendar event", "Open map to [location]", "Set reminder for [time]", "Add to task list"
- Be generous with confidence if context is clear
- today's date context: use relative terms as-is`;

export async function extractIntent(message, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || "{}";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("Failed to parse intent response");
  }
}