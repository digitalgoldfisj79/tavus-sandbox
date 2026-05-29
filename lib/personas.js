// Persona / replica catalogue. The web UI loads this list and the server
// uses it when minting conversations. To add a new persona, add a row here,
// redeploy. No other code changes needed.

export const personas = {
  voynich: {
    title: "Voynich research partner",
    blurb:
      "Talks about the Voynich Manuscript using live access to Ed's research database via MCP tool calls. Watch the bridge log on the right for tool calls.",
    persona_id: "p41511d21299",
    replica_id: "r4f5b5ef55c8",
    pipeline_mode: "full",
    document_retrieval_strategy: "balanced",
    max_call_duration: 1200,
    needs_mcp_bridge: true,
    mcp_endpoint: "https://project-ggqu9.vercel.app/mcp",
  },
  quintet: {
    title: "Quintet AI concierge — Müller portfolio",
    blurb:
      "Acts as the AI concierge for the synthetic Müller portfolio. Grounded in Quintet's published Counterpoints and the Müller portfolio statement.",
    persona_id: "p9d86f0efdfb",
    replica_id: "r4f5b5ef55c8",
    pipeline_mode: "full",
    document_retrieval_strategy: "quality",
    max_call_duration: 900,
    needs_mcp_bridge: false,
  },
};
