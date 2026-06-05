
## Two things to address

### 1. Use Mapbox for driving distance (not Google Routes)

You're right, Mapbox is already integrated for geocoding and `MAPBOX_ACCESS_TOKEN` is set as a secret. The plan switches to **Mapbox Directions API** for the driving-distance fix:

- New helper `supabase/functions/calculate-move-estimate/mapbox-distance.ts` calls:
  ```
  https://api.mapbox.com/directions/v5/mapbox/driving/{lng1},{lat1};{lng2},{lat2}
    ?access_token=...&overview=false&geometries=geojson
  ```
- Reads `MAPBOX_ACCESS_TOKEN` (same secret already used by `geocode-address`).
- Parses `routes[0].distance` (meters) → miles, rounded to 1 dp.
- If Mapbox returns no route (e.g. international with sea crossing), set `requiresCustomQuote = true` instead of falling back to haversine, so the displayed mileage is always real road distance or no number at all.

`calculate-move-estimate/index.ts` replaces the `haversineMiles(...)` call with `await getDrivingDistanceMiles(...)`. The signed estimate token continues to carry `distanceMiles`, so `submit-move-request` verification keeps working untouched.

Result copy changes from "Approximately X miles" to "Approximately X miles by road".

### 2. The price IS persisted — just under different columns

I checked move request `b8e08772-9cc8-4bd1-9c0c-92b57e1f49d5` directly and the calculator estimate is there:

```
source                    = calculator
estimated_price_low       = 750.00
estimated_price_high      = 920.00
estimate_distance_miles   = 3.86
estimate_issued_at        = 2026-06-05 17:26:11+00
```

The columns that hold the calculator estimate are `estimated_price_low` / `estimated_price_high` / `estimate_distance_miles` / `estimate_issued_at`. The older `estimated_value` column (single numeric, legacy, unused by both the original Start Your Move form and the calculator) stays NULL — that is almost certainly the column you were looking at in the Supabase table editor.

**No code change needed for persistence** — it's working. If you'd like, I can additionally:
- (a) populate the legacy `estimated_value` column with the midpoint of the calculator range so old admin views that read it show something, **or**
- (b) leave it alone and rely on the new columns (preferred — cleaner separation between "what the customer was shown" and any future internal valuation).

I'll default to **(b)** unless you tell me otherwise. The other commercial-pricing, surcharge, and em-dash changes from the previous plan still apply as written.

---

## Files touched for this slice

- **New:** `supabase/functions/calculate-move-estimate/mapbox-distance.ts`
- **Edited:** `supabase/functions/calculate-move-estimate/index.ts` (use Mapbox helper instead of haversine; flag `requiresCustomQuote` when unroutable)
- **Edited:** `src/components/move-calculator/EstimateResult.tsx` (minor copy: "miles by road")

No DB migration. No secret to add. No frontend logic change.
