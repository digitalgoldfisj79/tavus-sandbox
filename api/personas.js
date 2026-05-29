import { personas } from "../lib/personas.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const safe = Object.entries(personas).map(([key, p]) => ({
    key,
    title: p.title,
    blurb: p.blurb,
    needs_mcp_bridge: !!p.needs_mcp_bridge,
  }));

  return res.status(200).json({ personas: safe });
}
