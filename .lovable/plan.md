## Campaign tracking implementation plan

Wire the customer app to the admin campaign system. Three new files, two route updates, three call-site hooks. Edge functions `track-event` and `campaign-redirect` already exist on the shared Supabase project (verified — both return 200 on OPTIONS).

### Corrections to the spec

1. **Slug list** — the spec has `"norfolk"` but the actual route slug is `"norwich"`. Other slugs (kings-lynn, st-neots, st-ives, bury-st-edmunds, felixstowe, southend-on-sea, leighton-buzzard, milton-keynes) all match the customer app exactly.
2. **No drift risk** — instead of hard-coding the slug set in `useCampaignTracking`, we import `locations` from `src/data/locations.ts` (the single source of truth used by the routes).
3. **Route shape** — the spec's hook does `pathname.split("/")[0]`, but our landing pages live at `/removals/:slug`, not `/:slug`. We'll parse the slug as the segment after `/removals/`.

### Files to create

- `src/lib/campaign-tracking.ts` — visitor/session id storage, `?cid` capture (first-touch preserved, last-touch updated), and `track(payload)` using `navigator.sendBeacon` with `fetch keepalive` fallback. Posts to `${VITE_SUPABASE_URL}/functions/v1/track-event` with the anon key.
- `src/hooks/useCampaignTracking.ts` — on every route change, runs `captureCidFromUrl()` and fires `landing_view` when `pathname` matches `/removals/:slug` and the slug exists in the imported `locations` array.
- `src/pages/CampaignRedirect.tsx` — `/go/:code` page. Calls `campaign-redirect` edge fn with `code`, `visitor_id`, `base_url`, `referrer`, then `window.location.replace(destination)`.

### Files to edit

- `src/config/routes.tsx` — add `{ path: "/go/:code", element: <CampaignRedirect /> }` (lazy import).
- `src/App.tsx` — mount `useCampaignTracking()` inside a component rendered under `MainLayout` (router context is needed; add a tiny `<TrackingMount />` inside `<MainLayout>` or call inside an inner component above `<Routes>`).
- `src/components/move-request/hooks/useMoveRequestForm.tsx` — in `handleMoveTypeChange`, call `track({ event_type: "move_type_selected", move_type: type })`.
- `src/components/home/hero/HeroForm.tsx` — when the user picks a type via the hero `MoveTypeStep`, also fire `move_type_selected` (the hero `setMoveType` setter is in `HeroSection`; add the track call in the `setMoveType` handler there — confirm by reading the file at build time).
- `src/hooks/use-submit-move-request.tsx` — after `insertMoveRequest` returns `moveRequestId`, call `track({ event_type: "form_submitted", request_id: moveRequestId, move_type: data.moveType, location_slug: <derived from referrer/landing if available> })`. The edge function will stamp `campaign_id` on the `move_requests` row server-side as the durable attribution.

### Notes

- `track-event` is public (no JWT) per the spec; we still send the anon key in the `fetch` fallback path because Supabase functions require it by default.
- `sendBeacon` cannot send custom headers, so the public edge fn must accept unauthenticated POSTs (already deployed that way — verified via OPTIONS preflight).
- All tracking is wrapped in try/catch; no failure can ever surface to the user or block submission.
- `landing_view` fires once per route change (React Router triggers the effect on `pathname` change), preventing double-fires.

### Verification after build

1. Visit `/removals/cambridge?cid=TEST1` → check Network for a `track-event` POST with `event_type: landing_view`, `location_slug: cambridge`, `cid: TEST1`.
2. Pick a move type on the hero or wizard → second event `move_type_selected`.
3. Submit a full move request → third event `form_submitted` with `request_id`.
4. Visit `/go/TEST1` → redirects via `campaign-redirect`.
