# Plan

## 1. Track `/move-calculator` in campaign attribution

Goal: when a user lands on `/move-calculator` (especially via `?cid=...`), fire a `landing_view` event with `location_slug: "move-calculator"`, so the page appears in the same campaign-performance reports as the 34 town pages (Option 1).

**Change `src/hooks/useCampaignTracking.ts`:**
- After the existing `LOCATION_SLUGS` check, add a branch: if `location.pathname === "/move-calculator"`, fire `track({ event_type: "landing_view", location_slug: "move-calculator" })`.
- `captureCidFromUrl()` already runs on every navigation, so `?cid=...` attribution is unchanged.

No other files need to change for tracking — `move_requests` submissions from the calculator already inherit `campaign_id` / `first_campaign_id` / `landing_location_slug` from the cookie/session set by `captureCidFromUrl`.

### Note on reports
After deploy, the admin location-performance list will include a row labelled `move-calculator` alongside real town slugs. That matches what you asked for ("one unified list").

---

## 2. Rename "State/Province" → "County" on both forms (label-only)

Goal: UK-friendly wording without breaking submissions.

### Why this is safe
The underlying data key everywhere — TypeScript `Address` type, Zod schemas (`submit-move-request/validation.ts`, `_shared/move-request-validation.ts`), and the `pickup_address` / `delivery_address` JSONB columns in `move_requests` — is `state`. The DB stores whatever JSON we send under that key. If we only change the **visible label and placeholder text** (not the form field `name`/register key), the payload shape stays identical and every existing validator, edge function, notification email, and admin view keeps working.

We will NOT:
- rename the `state` property in `src/types/address.ts`
- change Zod schemas
- run a DB migration
- touch `register("...Address.state")` keys

We WILL only change visible text.

### Files to edit (label/placeholder text only)

1. **`src/components/move-request/AddressStep.tsx`**
   - `<Label>` text: `State/Province` → `County`
   - Validation messages: `"State/Province is required"` → `"County is required"`, `"State/Province name cannot exceed 20 characters"` → `"County name cannot exceed 50 characters"` (UK counties can be longer than 20 chars, e.g. "Buckinghamshire" is 15 but "East Riding of Yorkshire" is 24 — bumping to 50 prevents legitimate rejections).
   - Keep `register("${type}Address.state" as any, ...)` unchanged.
   - Relax the regex slightly to allow spaces typical in UK counties (already allowed) — no change needed.

2. **Move calculator wizard address step** — check `src/components/move-calculator/CalculatorWizard.tsx` (and any address sub-step it renders) for a "State/Province" label and apply the same rename. If the wizard reuses `AddressStep.tsx`, step 1 covers it.

3. **Optional UX nicety:** make the County field optional in the UI for UK addresses (many UK addresses don't need a county — town + postcode is enough). The Zod schemas already treat `state` as `.optional().default("")`, so we can drop the `required: "County is required"` rule on the client. **Confirm if you want this** — otherwise we keep it required and just relabel.

### Verification after the change
- Submit one test move from `/move-calculator` and one from the home-page hero. Confirm both reach `move_requests` and the County value lands in `pickup_address.state` / `delivery_address.state` as expected.
- Confirm admin views and notification emails still render the address correctly (they read `state` from JSONB — unaffected).

---

## Open question
Should the County field stay **required** (current behaviour, just relabelled), or become **optional** since many UK addresses don't include a county? Let me know and I'll lock it into the implementation.
