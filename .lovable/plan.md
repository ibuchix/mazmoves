# Proxy the MCP endpoint and harden the agent attack surface

## Goal

Stop publishing the raw Supabase functions hostname, and tighten the MCP surface so it can't be turned into a spam/abuse vector against the move-requests pipeline — while still letting legitimate AI agents submit moves.

## Part 1 — Dedicated proxy edge function

Add a new edge function with a **generic, non-descriptive name**: `agent-bridge`. Its only job is to forward requests to the internal `mcp-server` function and stream the response back.

- Public URL advertised everywhere: `https://tcyulkuyfptlisfyefnn.functions.supabase.co/agent-bridge` (and later, if a custom-domain rewrite is added, `https://housemove.co/agent-bridge`).
- `mcp-server` becomes the internal name. It stops being referenced in `Agents.tsx`, `ai-plugin.json`, or `llms.txt`.
- The proxy forwards method, body, and the MCP-required headers (`Content-Type`, `Accept: application/json, text/event-stream`, `Mcp-Session-Id` if present). It streams the response body so SSE works.
- `verify_jwt = false` (same as `mcp-server`; auth model is IP-based rate limiting).
- CORS preserved.

Files:
- `supabase/functions/agent-bridge/index.ts` — proxy.
- `supabase/functions/agent-bridge/config.toml` — `verify_jwt = false`.
- `src/pages/Agents.tsx` — endpoint constant → `agent-bridge` URL.
- `public/.well-known/ai-plugin.json` — `url` → `agent-bridge` URL.

## Part 2 — Attack-surface review and mitigations

The MCP path opens these risks today. Each gets a concrete fix.

### Risk 1 — IP-based rate limit is bypassable

`mcp-server` rate-limits `2 submissions / IP / 24h`. An attacker with a residential proxy pool or a botnet trivially gets thousands of IPs. The cap also doesn't apply to the proxy hop (proxy forwards client IP via `X-Forwarded-For`, which is itself spoofable from outside Supabase's edge).

**Fix:** Layer additional caps inside `mcp-server` that don't depend solely on IP:
- Per-email cap: max 2 MCP submissions per `customer_email` per 24h.
- Per-phone cap: max 2 MCP submissions per `customer_phone` per 24h.
- Global MCP cap: max N submissions across all MCP traffic per hour (circuit breaker — protects the pipeline if one attacker gets through). N defaults to 20/hour; admin-tunable later.
- Trust the IP only from a known header chain. Inside `agent-bridge` we set `X-Agent-Bridge-Client-IP` from Supabase's own `x-forwarded-for` and have `mcp-server` prefer that header. Outside callers can't set it because they hit `agent-bridge`, not `mcp-server` directly — but `mcp-server` is still publicly reachable, so see Risk 2.

**Isolation from the human submission path (critical):**
- All new caps live **only inside `mcp-server`**. The `submit-move-request` function (used by the homepage form) is not touched. Its existing 5-per-email-per-hour cap stays exactly as-is.
- Every cap query in `mcp-server` filters with `.eq('source', 'mcp')`, the same way the current per-IP cap already does. This means:
  - A human who submits twice from the website today does **not** consume any agent quota.
  - An agent submission does **not** consume any human quota.
  - The two pipelines share the `move_requests` table but never count each other's rows.
- Acceptance check before shipping: submit two MCP requests with email X, then submit a human request from the website with the same email X — the human submission must still succeed.

### Risk 2 — `mcp-server` is still publicly reachable

Even after we advertise `agent-bridge`, the underlying `mcp-server` URL is discoverable (DNS enumeration of `*.functions.supabase.co/<project>/...`, prior screenshots, archive.org, etc.). An attacker who finds it can bypass the proxy and any header-based trust.

**Fix:** Require a shared secret between proxy and server.
- New secret `AGENT_BRIDGE_SECRET` (random 32 bytes), available to both functions.
- `agent-bridge` adds header `X-Agent-Bridge-Auth: <secret>` on every forwarded request.
- `mcp-server` rejects any request missing or mismatching that header with `403`.
- Result: direct calls to `mcp-server` fail. The only working path is through `agent-bridge`, where our rate limits and (future) bot defenses apply.

### Risk 3 — Pipeline pollution

Even a single successful MCP submission triggers `geocode-address` (paid Mapbox calls) and `notify-companies` (emails real movers). 10 bad rows = 10 geocode calls and potentially dozens of unwanted emails to companies, eroding trust in the matching feed.

**Fix:**
- Add a `confidence` field on insert (`source='mcp'` rows get `confidence='unverified'`).
- `notify-companies` already runs on insert — modify it to **defer** unverified MCP submissions: don't email companies immediately; queue for manual or automated review. (Implementation: a small `mcp_submission_review` table, or a `pending_review` boolean on `move_requests`. The matcher only runs once an admin marks the row verified, or a future verification step — email confirmation, callback, etc. — succeeds.)
- Phase-1 minimum: skip `notify-companies` dispatch for MCP rows. Admin marks them ready from the existing admin dashboard. This stops cold-start abuse without building a verification flow yet.

### Risk 4 — Information leakage in the proxy itself

A naive proxy that returns upstream error bodies verbatim leaks the upstream URL, stack traces, or Supabase error shapes.

**Fix:** `agent-bridge` returns generic `{ error: "upstream_unavailable" }` on non-2xx upstream responses (still preserves status code), and never echoes the upstream `URL` or headers. Logs the full detail server-side.

### Risk 5 — Discovery surface

`ai-plugin.json` lives at `/.well-known/ai-plugin.json` and is crawlable. Right now it's harmless after the prior trim, but it does confirm the endpoint exists. Acceptable trade-off (the whole point is that legitimate agents can find us), but worth noting.

**No change.** Mentioned for completeness.

## Out of scope (future plans)

- Cloudflare Turnstile / proof-of-work on `agent-bridge` to slow bot pools.
- Per-agent API keys (move from anonymous-with-caps to identified-with-quota).
- Custom-domain rewrite (`housemove.co/agent-bridge` → Supabase) once Lovable hosting supports it.
- Building the actual verification/review flow for Risk 3 beyond "skip notify for MCP rows."

## Technical section

### `agent-bridge` proxy (sketch)

```ts
// supabase/functions/agent-bridge/index.ts
const TARGET = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mcp-server`;
const SECRET = Deno.env.get("AGENT_BRIDGE_SECRET")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const fwdHeaders = new Headers();
  // Forward only what MCP needs
  for (const h of ["content-type", "accept", "mcp-session-id"]) {
    const v = req.headers.get(h);
    if (v) fwdHeaders.set(h, v);
  }
  fwdHeaders.set("X-Agent-Bridge-Auth", SECRET);
  fwdHeaders.set("X-Agent-Bridge-Client-IP", req.headers.get("x-forwarded-for") ?? "unknown");
  fwdHeaders.set("Authorization", `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`); // mcp-server has verify_jwt=false but anon needs this

  const upstream = await fetch(TARGET, { method: req.method, headers: fwdHeaders, body: req.body });

  if (!upstream.ok && upstream.status >= 500) {
    return new Response(JSON.stringify({ error: "upstream_unavailable" }),
      { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" }});
  }

  const out = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(corsHeaders)) out.set(k, v);
  return new Response(upstream.body, { status: upstream.status, headers: out });
});
```

### `mcp-server` changes

- Read shared secret on every request; `403` if missing/wrong.
- Prefer `X-Agent-Bridge-Client-IP` over `x-forwarded-for` for IP-based caps.
- Add per-email + per-phone + global hourly caps in `submit_move_request` handler.
- Drop the fire-and-forget `notify-companies` call; insert with a `pending_review` flag instead.

### Database migration

```sql
alter table move_requests add column if not exists pending_review boolean not null default false;
-- For MCP rows we set pending_review = true on insert.
-- Existing matcher/notify code paths must check this flag and skip notifying companies until it's cleared.
```

Admin UI changes to clear the flag are a follow-up — not in this plan.

### Files touched

- `supabase/functions/agent-bridge/index.ts` (new)
- `supabase/functions/agent-bridge/config.toml` (new)
- `supabase/functions/mcp-server/index.ts` (auth check, IP header, extra caps, set pending_review, drop notify)
- `supabase/functions/notify-companies/index.ts` (skip if pending_review)
- `supabase/migrations/<new>.sql` (add `pending_review`)
- `src/pages/Agents.tsx` (URL change)
- `public/.well-known/ai-plugin.json` (URL change)
- Secret `AGENT_BRIDGE_SECRET` added via the secrets tool before deploy.

No frontend behavior changes for human users.
