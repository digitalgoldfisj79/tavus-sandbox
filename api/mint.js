import { personas } from "../lib/personas.js";

const TAVUS_API = "https://tavusapi.com/v2";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "server_misconfigured", detail: "TAVUS_API_KEY not set" });
  }

  // Body: { personaKey: "voynich" | "quintet", userLabel?: string }
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const personaKey = body.personaKey;
  const persona = personas[personaKey];
  if (!persona) {
    return res.status(400).json({ error: "unknown_persona", detail: `available: ${Object.keys(personas).join(", ")}` });
  }

  // Build the create-conversation payload from the persona definition
  const userLabel = (body.userLabel || "guest").toString().slice(0, 60);
  const payload = {
    replica_id: persona.replica_id,
    persona_id: persona.persona_id,
    conversation_name: `${persona.title} — ${userLabel}`,
    document_retrieval_strategy: persona.document_retrieval_strategy,
    max_participants: 2,
    properties: {
      // Once the human clicks Start, they're going to join within seconds.
      // So a tight absent timeout is fine and limits empty-room burn.
      participant_absent_timeout: 120,
      participant_left_timeout: 120,
      max_call_duration: persona.max_call_duration,
    },
  };

  let tavusResp;
  try {
    const r = await fetch(`${TAVUS_API}/conversations`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    tavusResp = { status: r.status, body: await r.json() };
  } catch (err) {
    return res.status(502).json({ error: "tavus_unreachable", detail: err.message });
  }

  if (tavusResp.status !== 200) {
    return res.status(502).json({ error: "tavus_error", status: tavusResp.status, detail: tavusResp.body });
  }

  // Audit log to Vercel function logs — visible in dashboard
  console.log(JSON.stringify({
    event: "conversation_minted",
    personaKey,
    userLabel,
    conversation_id: tavusResp.body.conversation_id,
    at: new Date().toISOString(),
  }));

  // Return only what the browser needs. NOT the API key, NOT the full payload.
  return res.status(200).json({
    conversation_id: tavusResp.body.conversation_id,
    conversation_url: tavusResp.body.conversation_url,
    persona: {
      key: personaKey,
      title: persona.title,
      needs_mcp_bridge: !!persona.needs_mcp_bridge,
      mcp_endpoint: persona.mcp_endpoint || null,
    },
  });
}
