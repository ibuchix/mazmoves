# Harden the public `/agents` page

## Goal

Keep `/agents` useful for legitimate AI agents (discoverable, enough to connect and call tools) while removing the operational and business detail that helps attackers or competitors.

## What the page reveals today (and shouldn't)

1. **Raw Supabase functions hostname** (`*.functions.supabase.co/mcp-server`) — leaks our infra provider and exact function name, making it trivial to fingerprint and target other functions on the same project.
2. **Exact rate limits** ("2 submissions and 30 tool calls per IP per 24 hours") — tells an abuser precisely how to stay under the threshold and how many IPs they need.
3. **Internal matching rule** ("25-mile radius of pickup or delivery") — a core business rule we'd rather not publish; it's competitive info and helps spammers craft addresses that always match.
4. **Pipeline internals** ("geocode the addresses, insert the request, notify nearby moving companies") — describes our backend flow.
5. **Audit/abuse-detection hint** ("Submissions are tagged so HouseMove staff can audit agent traffic") — tells abusers exactly what signal we use.
6. **Tool input schema disclosure path** — we tell agents to call `get_required_fields` first, which is fine, but the page itself doesn't need to enumerate tools by exact internal name.

## Proposed changes

### 1. Hide the raw Supabase URL behind our own domain

Add a same-origin proxy route on `housemove.co` that forwards to the Supabase function:

```text
POST https://housemove.co/mcp  ->  https://<ref>.functions.supabase.co/mcp-server
```

Two options for the proxy (pick one in the technical section):
- A new edge function `mcp` whose only job is to forward to `mcp-server` (cleanest, but adds one hop).
- A Netlify/host rewrite in `public/_redirects` (zero hops, no code).

The public docs only ever advertise `https://housemove.co/mcp`. The Supabase URL stops appearing in the page, in `ai-plugin.json`, and in `llms.txt`.

### 2. Rewrite the page copy to be minimal and neutral

Keep: what HouseMove is, that there's an MCP endpoint, the endpoint URL, the Claude Desktop snippet, a short responsible-use note, and a contact email for agent operators.

Remove:
- Specific rate-limit numbers — replace with "Rate-limited; contact us for higher limits."
- The 25-mile radius rule — replace with "We match requests to nearby UK moving companies."
- The "geocode + insert + notify" pipeline description — replace with "Matched companies will contact the user directly."
- The "submissions are tagged for audit" line — drop entirely (we still tag internally; we just don't advertise it).
- The explicit tool list with internal names — replace with one sentence: "Call `tools/list` on the endpoint to discover available tools and their schemas." That's the standard MCP discovery path, so legitimate agents lose nothing.

### 3. Tighten `ai-plugin.json` and `llms.txt`

- `ai-plugin.json`: change `url` to `https://housemove.co/mcp`. Shorten `description_for_model` so it doesn't describe internal matching logic.
- `llms.txt`: keep the `/agents` link, but trim the one-line description to "MCP endpoint for AI agents."

### 4. Optional follow-up (not in this plan unless you want it)

- Move `/agents` behind a "request access" flow (email us, we issue a token) instead of a fully public endpoint. This is a bigger change to the MCP server itself and changes the abuse model, so I'd do it as a separate plan if you want it.

## Technical section

**Proxy choice — recommendation: host rewrite via `public/_redirects`.**

```text
/mcp  https://tcyulkuyfptlisfyefnn.functions.supabase.co/mcp-server  200
/mcp/*  https://tcyulkuyfptlisfyefnn.functions.supabase.co/mcp-server/:splat  200
```

Pros: no new edge function, no extra cold-start latency, no code to maintain. The Supabase hostname still appears in DNS/TLS if someone inspects deeply, but it's no longer in our docs or discovery files, which is the goal.

Cons: the rewrite is host-specific (Netlify/Lovable hosting). If we ever move hosts we re-add the rule.

If you'd rather have a real edge-function proxy (more control, can add headers, can later add auth), I'll wire `supabase/functions/mcp/index.ts` that forwards `req.method`, headers, and body to `mcp-server` and streams the response back. Slightly more code, one extra hop.

**CORS / MCP transport note:** the Streamable HTTP transport needs `Accept: application/json, text/event-stream` to pass through unchanged. A host rewrite preserves headers; an edge-function proxy must forward them explicitly and stream the response body (don't `await res.json()`).

**Files touched (rewrite path):**
- `src/pages/Agents.tsx` — rewrite copy, drop tool-by-name list and rate-limit/radius details, change endpoint URL constant to `https://housemove.co/mcp`.
- `public/ai-plugin.json` (well-known) — update `url`, trim `description_for_model`.
- `public/llms.txt` — trim `/agents` line.
- `public/_redirects` — add the two `/mcp` rewrite rules.

**No backend changes.** The `mcp-server` function, rate limits, `source='mcp'` tagging, and `ip_origin` tracking all stay exactly as they are — we're only changing what we publish about them.
