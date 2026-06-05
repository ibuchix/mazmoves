# Move calculator: smarter pricing, cleaner copy, post-booking reset

Four changes, all scoped to the calculator surface (frontend) and the `calculate-move-estimate` edge function.

## 1. New "alive" pricing algorithm

Replace the current flat `base + distanceCost` model in `supabase/functions/calculate-move-estimate/pricing-config.ts` and `index.ts` with a **labour + vehicle + demand** model. Pricing reflects what actually drives a UK removal cost: crew hours, vehicle, fuel, and live demand signals.

**Formula**

```text
volume        = VOLUME_M3[propertySize | commercial profile]
crewSize      = ceil(volume / 12)          // 1 mover per ~12 m3, min 2, max 6
loadHours     = volume * 0.10              // ~6 min per m3 to load
unloadHours   = volume * 0.08
driveHours    = (distanceMiles / 30) * 2   // round trip at 30 mph avg UK
totalHours    = max(2, loadHours + unloadHours + driveHours)

labour        = crewSize * HOURLY_RATE * totalHours
vehicle       = VEHICLE_DAY_RATE[vehicleClass(volume)]
fuel          = distanceMiles * 2 * FUEL_PER_MILE
materials     = volume * 1.2               // boxes, blankets, tape

subtotal      = (labour + vehicle + fuel + materials) * TYPE_MULTIPLIER[moveType]
demandFactor  = 1 + seasonalLift(month) + dayOfWeekLift(dow) + shortNoticeLift(daysUntil)
total         = clamp(subtotal * demandFactor, MIN_BY_TYPE, MAX_BY_TYPE)

low           = round10(total * 0.92)
high          = round10(total * 1.08)
```

**Tuned constants (GBP)**

- `HOURLY_RATE` 28 (per crew member)
- `FUEL_PER_MILE` 0.42
- `VEHICLE_DAY_RATE`: Luton 95, 7.5t 160, 18t 240
- `VOLUME_M3`: 1-bed 18, 2-bed 30, 3-bed 45, 4-bed 60, 5+ 80, commercial small/medium/large from a new `COMMERCIAL_VOLUME_M3` table (office S 22, M 55, L 130 etc.)
- `TYPE_MULTIPLIER`: domestic 1.00, commercial 1.10, international 1.85
- `seasonalLift`: Jun–Aug +0.05, Dec/Jan –0.03, else 0
- `dayOfWeekLift`: Sat/Sun +0.05, Fri +0.02
- `shortNoticeLift`: <2 days +0.15, 2–6 days +0.05
- Range spread tightened from ±10% to ±8% (cleaner-looking quote)

**Sanity samples**

- 1-bed flat, 7 mi, midweek: ~£230–£280
- Small office, 7 mi, midweek: ~£360–£440  *(today: £730–£890)*
- 3-bed house, 35 mi, Saturday: ~£780–£920
- Enterprise commercial: still returns `requiresCustomQuote`, unchanged

**Edge function changes**

- `pricing-config.ts`: replace flat `BASE_BY_SIZE`/`COMMERCIAL_BASE` numbers with `VOLUME_M3`, `COMMERCIAL_VOLUME_M3`, `HOURLY_RATE`, `VEHICLE_DAY_RATE`, `FUEL_PER_MILE`, `MATERIALS_PER_M3`, plus the lift helpers.
- `index.ts`: compute total via the new pipeline. Surcharge list returned in `breakdown.surcharges` now shows the active lifts (Weekend +5%, Short notice +15%, Peak season +5%, etc.) so the "How we calculated this" panel still makes sense.
- Signed payload (`signing.ts`) unchanged in shape, only the `low`/`high` values change.

## 2. Trim copy

- `EstimateResult.tsx`: drop the trailing sentence. New copy: "Approximately {n} miles by road. Final price confirmed by your matched mover." (delete "This reflects typical UK market rates.")
- `BookEstimateDialog.tsx`: delete the line "Free for you. Movers pay to be matched. No card required." (lines 162–164) entirely.

## 3. Reset after successful booking

Currently after a booking succeeds the user clicks "Done" or dismisses the dialog and the estimate hero + Book/Recalculate buttons stay on screen.

- `BookEstimateDialog.tsx`: when submission succeeds, call a new `onBookingComplete` prop (in addition to the existing close behaviour). Triggered when the user clicks "Done" or closes the dialog via outside click / Esc after `success === true`.
- `MoveCalculator.tsx`: implement `onBookingComplete` that clears `estimate` + `inputs`, scrolls to top, and forces `CalculatorWizard` to remount (bump a `wizardKey` state). Remounting the wizard naturally resets it to step 1 with empty inputs, no extra reset plumbing needed.
- Net effect: dialog closes, hero result disappears, wizard returns to step 1.

## 4. Out of scope

- No database/migration changes.
- No design or layout changes beyond removing the two copy lines.
- Mapbox driving-distance integration stays as-is.

## Files to change

- `supabase/functions/calculate-move-estimate/pricing-config.ts`
- `supabase/functions/calculate-move-estimate/index.ts`
- `src/components/move-calculator/EstimateResult.tsx`
- `src/components/move-calculator/BookEstimateDialog.tsx`
- `src/pages/MoveCalculator.tsx`

Re-deploy `calculate-move-estimate` after the edits.
