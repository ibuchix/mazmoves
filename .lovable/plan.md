## Update `useCampaignTracking` hook

Replace the body of `src/hooks/useCampaignTracking.ts` with the snippet from `customer-app-snippets/README.md` (lines 150–159).

### What changes

Current logic only fires `landing_view` for `/removals/:slug`. The new logic:

1. Parses the URL the same way.
2. Uses `parts[1]` when `parts[0] === "removals"` (unchanged behavior for our 34 pages).
3. **New:** falls back to `parts[0]` as the slug otherwise — so if a campaign ever points at `/cambridge` directly (root-level slug), `landing_view` still fires.
4. Still gated by `LOCATION_SLUGS` (imported from `src/data/locations.ts`), so non-location routes like `/contact` or `/agents` will never trigger an event.

### Why it's safe

- For all current routes (`/removals/cambridge`, `/removals/norwich`, etc.) behavior is identical.
- The root fallback only activates for paths whose first segment matches a known location slug — which today never happens, so no false positives.
- No new dependencies; the existing `LOCATION_SLUGS` set, `captureCidFromUrl`, and `track` calls are reused.

### Files

- `src/hooks/useCampaignTracking.ts` — replace the `useEffect` body with the snippet, update the top-of-file comment.

### Verification

After republish:
1. `/removals/cambridge?cid=TEST1` → `landing_view` POST with `location_slug: cambridge` (unchanged).
2. `/contact` → no event (correct, not a location).
3. Hypothetical `/cambridge` → would now fire `landing_view` (new fallback, harmless since route doesn't exist yet).

### Nothing else needs fixing

- `/go/:code` route is registered ✅
- `CampaignRedirect.tsx` exists ✅
- `track-event` + `campaign-redirect` edge functions are live (200 on OPTIONS) ✅
- `useCampaignTracking()` is mounted inside the Router in `App.tsx` ✅
- `?cid` capture + visitor/session ids + `sendBeacon` dispatch all in place ✅

The only outstanding action after this edit is **republish housemove.co** so the new bundle ships.
