# TikTok Events API (Server-Side) Setup

## Goal
Add server-side event tracking to complement the existing client-side TikTok Pixel. Server events are more reliable (not blocked by ad-blockers, iOS ITP, or cookie restrictions). TikTok deduplicates browser + server events using a shared `event_id`.

## Scope — relevant events only

The app is a free lead-generation service for movers (no cart, no payment, no wishlist, no search, no account signup). Only these 4 events map to real user actions:

| Event | Trigger | Notes |
|---|---|---|
| `ViewContent` | User lands on `/request-move` | Top of funnel |
| `InitiateCheckout` | User reaches step 2 (move type chosen) | Mid funnel |
| `CompleteRegistration` | Move request saved successfully | Conversion (lead) |
| `PlaceAnOrder` | Move request saved successfully (same moment) | TikTok treats this as the "order placed" signal even when no payment occurs |

Skipped: `AddToCart`, `AddToWishlist`, `AddPaymentInfo`, `Search`, `Purchase` — no equivalent flow exists.

## Architecture

```text
Browser                          Edge Function                  TikTok
-------                          -------------                  ------
ttq.track(event, props,
          { event_id })  ──────────────────────────────────►  pixel event
                                                                   ↘  dedup by event_id
fetch tiktok-track       ──►  POST business-api.tiktok.com/   ──►  server event
  { event, event_id,           open_api/v1.3/event/track/
    user, props }              Header: Access-Token: <secret>
```

Same `event_id` from both sides → TikTok counts it once.

## Changes

### 1. Secrets (added via secrets tool)
- `TIKTOK_EVENTS_ACCESS_TOKEN` — long-lived token from TikTok Events Manager → Pixel → Events API → "Generate access token"
- `TIKTOK_PIXEL_ID` — `D832OKRC77U1Q23AB6T0` (stored as secret so it isn't hard-coded server-side; matches the one in `index.html`)

### 2. New edge function: `tiktok-track`
Files: `supabase/functions/tiktok-track/{index.ts, config.toml}` with `verify_jwt = false`.

Responsibilities:
- CORS preflight + `verifyOrigin` (reuse `_shared/verify-origin.ts`).
- Zod validation of body:
  ```
  {
    event: "ViewContent" | "InitiateCheckout" | "CompleteRegistration" | "PlaceAnOrder",
    event_id: string (uuid),
    event_time?: number (unix seconds; default now),
    url?: string,
    content?: { id: string, type: "product" | "product_group", name: string },
    value?: number,           // default 0
    currency?: string,        // default "GBP"
    user?: { email?, phone?, external_id?, ttclid?, ttp? }
  }
  ```
- Server-side enrichment:
  - `ip` ← first hop of `x-forwarded-for`
  - `user_agent` ← `user-agent` header
  - `ttclid` / `ttp` ← from request body (browser reads them from URL/cookie)
- SHA-256 hash `email`, `phone_number`, `external_id` server-side (never trust client to have hashed).
- Per-IP hourly rate limit via existing `check_rate_limit` RPC to prevent abuse.
- POST to `https://business-api.tiktok.com/open_api/v1.3/event/track/` with header `Access-Token: <secret>`:
  ```json
  {
    "event_source": "web",
    "event_source_id": "<TIKTOK_PIXEL_ID>",
    "data": [{
      "event": "CompleteRegistration",
      "event_time": 1715800000,
      "event_id": "<uuid>",
      "user": { "email":"<sha256>", "phone":"<sha256>", "external_id":"<sha256>",
                "ip":"...", "user_agent":"...", "ttclid":"...", "ttp":"..." },
      "properties": { "currency":"GBP", "value":0,
                      "contents":[{"content_id":"...","content_type":"product","content_name":"..."}] },
      "page": { "url": "..." }
    }]
  }
  ```
- Log non-2xx TikTok responses with the response body for debugging.
- Always return `{ success: true }` to the caller (tracking failures must never break UX).

### 3. Frontend wiring — extend `src/utils/tracking/tiktok.ts`

Add helpers:
- `getTtclid()` — read `?ttclid=` from URL, persist to `localStorage`, return cached value.
- `getTtp()` — read `_ttp` cookie.
- `sendServerEvent(event, payload, eventId)` — fire-and-forget `supabase.functions.invoke("tiktok-track", { body: ... })`.
- Update `trackEvent(...)` to:
  1. Generate `event_id = crypto.randomUUID()`.
  2. Call `ttq.track(event, props, { event_id })` (pixel side, with explicit dedup id).
  3. Call `sendServerEvent(event, props, event_id)` (server side).
- Update `identifyUser` to also stash hashed user info in a module-level cache so `sendServerEvent` can include it on the same call without re-hashing in the browser (we still re-hash server-side for safety).

Call sites — no functional change, they keep calling `trackEvent` / `identifyUser`:
- `src/pages/RequestMove.tsx` — `ViewContent`, `InitiateCheckout`
- `src/hooks/use-submit-move-request.tsx` — `identifyUser` then `PlaceAnOrder` + `CompleteRegistration`

### 4. CSP
Add `https://business-api.tiktok.com` to `connect-src` in `index.html`? **Not needed** — the browser calls our own edge function, and the edge function calls TikTok server-to-server. CSP unaffected.

## Verification
1. Submit a test move request → `tiktok-track` logs show `200` from TikTok with `code: 0`.
2. TikTok Events Manager → Test Events → paired Browser + Server events with matching `event_id` (deduplicated).
3. Confirm no UX regression if TikTok API is slow/down (fire-and-forget; toast/UI unaffected).

## Order of operations
1. You approve the plan.
2. I request `TIKTOK_EVENTS_ACCESS_TOKEN` + `TIKTOK_PIXEL_ID` via the secrets tool — you paste them in.
3. I add the edge function and frontend wiring.
4. We test on preview using TikTok's Test Events tool.

## Out of scope
- The 5 unused event types (easy to add later if a paid step / search / wishlist is introduced).
- Backfilling historical events.
- Offline / CRM conversions API.
