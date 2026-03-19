const BACKEND_URL = "https://intent-engine-api.intent-engine-api.workers.dev";

export async function extractIntent(message) {
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Backend API error");
  }

  return await response.json();
}