# MCP Server for AI-Agent Move Bookings

## Goal

Allow third-party AI agents (ChatGPT, Claude, custom assistants, etc.) to book a move on the customer side using the Model Context Protocol — without changing how the human-facing form works today.

## Why this fits the current architecture

The customer app is a Vite SPA with no server runtime; all backend logic already lives in Supabase Edge Functions (`submit-move-request`, `geocode-address`, `notify-companies`). MCP servers can be hosted as a single Edge Function using `mcp-lite` + Hono over Streamable HTTP. So we add **one new edge function** plus **one small public page** — and reuse every existing validation, geocoding, and matching path.

The human submission flow (`useSubmitMoveRequest` → `submit-move-request`) is untouched.

## What we build

### 1. New edge function: `mcp-server`

A standalone MCP endpoint at `https://<project>.functions.supabase.co/mcp-server`. Exposes two tools:

| Tool | Purpose |
|---|---|
| `get_required_fields` | Returns the JSON schema an agent must fill to submit a request (mirrors `moveRequestSchema`). Self-documenting so agents collect the right info from the user. |
| `submit_move_request` | Validates input, geocodes pickup+delivery server-side, inserts the row, and triggers `notify-companies`. Returns the request id + status (`assigned` / `no_companies_found`). |

No pre-flight service-area check — agents submit and the existing matching pipeline (`notify-companies` → `process-matches`) decides coverage, exactly like the web form. Keeps matching logic in one place.

Internally, the function reuses the exact same Zod schema (`validation.ts`), geocoding edge function, and matching pipeline — no duplicated business logic, no second source of truth.

### 2. Auth + abuse model (the non-obvious part)

Today, `submit-move-request` blocks non-browser callers via `verifyOrigin`. Agents have no browser origin, so MCP can't reuse that gate. Cleanest approach:

- **Open MCP endpoint, no API key required** (matches the spirit of the human form being open).
- **Tight per-IP rate limit** in the MCP function: **2 successful submissions per IP per 24 hours**, plus a separate **30 tool calls per IP per 24 hours** cap so `get_required_fields` discovery doesn't burn the submission budget. A real person never submits more than 1–2 move requests a day, so anything above that is almost certainly abuse.
- **Mark agent-originated rows** with a new nullable `source` column on `move_requests` (`'web' | 'mcp'`, default `'web'`). This gives admins visibility and a future kill-switch without affecting matching.
- **No new secrets** in v1. If abuse appears, we can later add an `MCP_API_KEY` header check — a 5-line change.

### 3. Discovery page: `/agents`

A single public page at `/agents` (linked from the footer in small text) that:

- Explains the MCP endpoint URL, transport (Streamable HTTP), and the two tools.
- Shows a copy-paste connection snippet for Claude Desktop / ChatGPT.
- Links to a `/.well-known/ai-plugin.json`–style descriptor served from `public/` so AI directories can index it.

No interactive UI, no auth on this page — pure documentation. Zero impact on existing routes.

### 4. SEO + robots

- Add `/agents` to `sitemap.xml` and `llms.txt`.
- Allow the MCP path in `robots.txt`.

## What we deliberately do NOT do

- No changes to `submit-move-request`, `notify-companies`, `process-matches`, `geocode-address`, or any frontend submission code.
- No new database tables. Only an additive nullable `source` column (safe migration, no backfill needed).
- No payment, no account creation for agents in v1. Agents pass `customerEmail` + `customerPhone` exactly like the web form requires.
- No streaming/conversational tools — MCP tools are request/response only, matching how movers actually need bookings to arrive.

## Technical details

### Files added
- `supabase/functions/mcp-server/index.ts` — Hono + mcp-lite, three tools.
- `supabase/functions/mcp-server/tools.ts` — tool handlers that internally `fetch` `geocode-address` and insert via service role using the shared Zod schema.
- `supabase/functions/mcp-server/config.toml` — `verify_jwt = false` (public, like `submit-move-request`).
- `src/pages/Agents.tsx` — documentation page.
- `public/.well-known/ai-plugin.json` — minimal descriptor pointing to the MCP endpoint.
- Route added to `src/config/routes.tsx`.

### Files changed
- `src/components/layout/Footer.tsx` — small "For AI agents" link.
- `public/sitemap.xml`, `public/llms.txt`, `public/robots.txt`.

### Migration
```sql
ALTER TABLE move_requests
  ADD COLUMN source text DEFAULT 'web';
```
(Nullable-safe, no RLS changes — existing policies still apply.)

### Required headers (per MCP spec)
The function must accept `Accept: application/json, text/event-stream` on POST — handled by `mcp-lite`'s `StreamableHttpTransport` automatically.

### Reused, not duplicated
- Validation: imports `moveRequestSchema` from `submit-move-request/validation.ts`.
- Geocoding: `fetch`es the existing `geocode-address` function with the service role key.
- Matching: after insert, `fetch`es `notify-companies` exactly like the web path does.

## Risk review

| Risk | Mitigation |
|---|---|
| Agents spam fake bookings | Per-IP rate limit + `source='mcp'` flag so admin can filter/disable. |
| Movers get low-quality leads | Same Zod validation as web form; phone + email are required and format-checked. |
| Breaking the web submission path | Zero shared code paths modified. New function is fully isolated. |
| MCP spec drift | `mcp-lite ^0.10.0` is actively maintained and recommended in Lovable knowledge. |
| Geocoding cost spike | `submit_move_request` geocodes twice (same as web). 2-submissions/IP/day cap hard-limits blast radius. |

## Out of scope (future)

- Agent authentication via API keys + per-key quotas.
- Quote estimation tool (needs pricing logic we don't have yet).
- Webhook back to the agent when a mover accepts (needs assignment-status notifications, which the admin-side feature you mentioned will design).
