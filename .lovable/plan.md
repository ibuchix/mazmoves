## Goal
Fire the new Google Ads "House Move Lead" conversion (`AW-18198179087/zqK-CKHAnL4cEI_ayOVD`) on every successful move-request submission across the entire customer site — the homepage hero wizard, all 34 location pages (they all submit through the same hook), and the Move Calculator's BookEstimateDialog.

## Current state
- `src/utils/tracking/google-ads.ts` already exposes `trackAdsConversion()` and an existing conversion label `xmIOCK2v97UcEI_ayOVD` (kept as-is — different Google Ads action).
- `src/hooks/use-submit-move-request.tsx` (line 231) already fires the existing conversion on successful submit. This hook backs the homepage hero form, the standalone Request-a-Move page, and every location page.
- `src/components/move-calculator/BookEstimateDialog.tsx` submits via `supabase.functions.invoke("submit-move-request", ...)` directly and currently fires **no** Google Ads conversion.

## Changes

1. **`src/utils/tracking/google-ads.ts`**
   - Add a new exported constant:
     ```ts
     export const GOOGLE_ADS_LEAD_CONVERSION_SEND_TO = "AW-18198179087/zqK-CKHAnL4cEI_ayOVD";
     ```
   - Update top-of-file comment to document both conversion labels.

2. **`src/hooks/use-submit-move-request.tsx`**
   - Import the new constant.
   - Right after the existing `trackAdsConversion(...)` call on successful submission, fire a second `trackAdsConversion({ sendTo: GOOGLE_ADS_LEAD_CONVERSION_SEND_TO, value: GOOGLE_ADS_CONVERSION_VALUE, transactionId: <same id> })`.
   - This automatically covers the homepage hero, `/request-move`, and all 34 location pages since they all flow through this hook.

3. **`src/components/move-calculator/BookEstimateDialog.tsx`**
   - After the successful `supabase.functions.invoke("submit-move-request", ...)` response (before `onSubmitted`), call `trackAdsConversion({ sendTo: GOOGLE_ADS_LEAD_CONVERSION_SEND_TO, value: GOOGLE_ADS_CONVERSION_VALUE, transactionId: <request id from response, if returned> })`.
   - Update the file's top comment to note the conversion fire.

## Notes
- The existing `xmIOCK2v97UcEI_ayOVD` conversion stays in place — this is purely additive so the new "House Move Lead" action is tracked alongside it.
- No `<script>` tags need to be added to `index.html`; the global `gtag` is already loaded there, and `trackAdsConversion` uses it.
- Conversions fire only on **successful** submission (after server confirms), matching how the existing one works — avoids counting validation failures.