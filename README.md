# Tavus mint-on-click sandbox

Single durable URL, hidden API key, persona catalogue, MCP bridge for Voynich.

## What's here

```
.
├── public/index.html        Front-end (durable URL points here)
├── api/personas.js          GET — list configured personas
├── api/mint.js              POST — server-side conversation creation
├── api/end.js               POST — explicit teardown
├── lib/personas.js          Persona catalogue (edit to add/change)
├── package.json
└── vercel.json              Headers + no-cache on /api
```

No npm dependencies. Pure Node 20 + native `fetch`. Vercel handles everything.

## Deploy

```bash
npm install -g vercel              # if you don't already have it
cd mint-server
vercel link                        # link to a new or existing project
vercel env add TAVUS_API_KEY       # paste your key when prompted
vercel deploy --prod
```

That's it. Vercel returns a permanent URL like `https://tavus-sandbox.vercel.app`. Bookmark it. The URL doesn't expire, rooms still do — but cleanly, only after you've finished talking.

## How a conversation goes

1. Open the durable URL — see the persona picker
2. Click a card — server creates a conversation, browser joins
3. Talk — the avatar is live, MCP bridge log shows tool calls if relevant
4. Click "End conversation" — server tears the room down, no empty-room burn

## To add a new persona

Edit `lib/personas.js`, add a row, redeploy:

```js
my_new_persona: {
  title: "Some new agent",
  blurb: "What it does",
  persona_id: "p...",
  replica_id: "r...",
  pipeline_mode: "full",
  document_retrieval_strategy: "quality",
  max_call_duration: 1200,
  needs_mcp_bridge: false,
}
```

For an MCP-backed persona, also set `needs_mcp_bridge: true` and `mcp_endpoint: "https://..."`. The persona itself still needs its tools configured in Tavus (`layers.llm.tools` in the persona definition) for the LLM to know about them.

## Operating notes

- **API key never reaches the browser.** Only the conversation URL does.
- **Empty-room burn is bounded to ~2 minutes** thanks to a tight `participant_absent_timeout` — the human is clicking right now, so they don't need 10 minutes of grace.
- **`/api/end` is called on tab close** via `navigator.sendBeacon` — best-effort, but most browsers honour it.
- **Logs are in Vercel dashboard** under Functions → mint / end — useful for credit accounting.
