# Verify TikTok tracking via Test Events Activity

## Goal
Confirm the `tiktok-track` edge function is successfully sending events to TikTok by making them appear in the **Test Events Activity** tab in TikTok Events Manager.

## What you need to do (in TikTok Events Manager)
1. Open TikTok Events Manager → your pixel → **Test Events** tab.
2. Copy the **test event code** shown there (looks like `TEST12345`).
3. Paste it when I prompt for the secret in the next step.

## What I will do
1. Add a new runtime secret `TIKTOK_TEST_EVENT_CODE` to the project (using your code).
2. The `tiktok-track` edge function already reads this secret — when present, it appends `test_event_code` to the TikTok payload so events route to the Test Events tab instead of the live stream.
3. No code changes are needed — that wiring is already in place from the previous implementation.

## How to verify
1. Once the secret is added, go to `/request-move` and submit a test move request.
2. Within ~30 seconds, you should see these events appear in TikTok's **Test Events Activity** tab, each with a matching `event_id` from both the **Browser** (pixel) and **Server** (Events API) sources — proving deduplication works:
   - `ViewContent` (on page load)
   - `ClickButton` (when you click "Get Free Quotes" on the homepage)
   - `InitiateCheckout` (on step 2+)
   - `SubmitForm` (on submit)
   - `CompleteRegistration` (on submit)
3. I will also check the `tiktok-track` edge function logs to confirm `code=0` (TikTok success) for each event.

## After verification
Once events are confirmed flowing correctly, **delete the `TIKTOK_TEST_EVENT_CODE` secret**. This switches events back to the live data stream so they count toward real campaign optimization (test events do not). I'll handle the deletion when you confirm.

## Out of scope
- No frontend or form changes.
- No edge function code changes.
- No changes to event names or business logic.
