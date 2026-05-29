const TAVUS_API = "https://tavusapi.com/v2";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "server_misconfigured" });

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}); }
  catch { return res.status(400).json({ error: "invalid_json" }); }

  const cid = body.conversation_id;
  if (!cid || !/^c[a-f0-9]{8,32}$/i.test(cid)) {
    return res.status(400).json({ error: "invalid_conversation_id" });
  }

  try {
    const r = await fetch(`${TAVUS_API}/conversations/${cid}/end`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
    });
    if (r.status !== 200) {
      const detail = await r.text();
      return res.status(502).json({ error: "tavus_end_failed", status: r.status, detail });
    }
    console.log(JSON.stringify({ event: "conversation_ended", conversation_id: cid, at: new Date().toISOString() }));
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: "tavus_unreachable", detail: err.message });
  }
}
