import { personas } from "../lib/personas.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.TAVUS_API_KEY;
  const personaKeys = Object.keys(personas || {});

  // Optional liveness probe to Tavus — only runs if ?probe=1 to avoid
  // burning a request on every health check
  let tavusReachable = null;
  if (req.query?.probe === "1" && apiKey) {
    try {
      const r = await fetch("https://tavusapi.com/v2/personas?limit=1", {
        method: "GET",
        headers: { "x-api-key": apiKey },
        signal: AbortSignal.timeout(5000),
      });
      tavusReachable = { ok: r.ok, status: r.status };
    } catch (err) {
      tavusReachable = { ok: false, error: err.message };
    }
  }

  return res.status(200).json({
    ok: true,
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION || null,
      env: process.env.VERCEL_ENV || null,
    },
    config: {
      tavus_api_key_present: !!apiKey,
      tavus_api_key_length: apiKey ? apiKey.length : 0,   // length only, not value
      personas_configured: personaKeys.length,
      persona_keys: personaKeys,
    },
    tavus_reachable: tavusReachable,
    timestamp: new Date().toISOString(),
  });
}
