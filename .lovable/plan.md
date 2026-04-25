# Plan: Save Move Requests to the Database

## What's wrong

When a customer submits the move form, **nothing is written to the database**. The function in `src/hooks/use-submit-move-request.tsx` that's supposed to save the request is a leftover stub:

```ts
const submitMainRequest = async (data: MoveRequestForm): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Main request submitted:", data);
};
```

It just waits and logs — there is no `supabase.from('move_requests').insert(...)` anywhere in the customer flow.

This is **not** an RLS issue. The `move_requests` table already has `Anyone can create move requests` (INSERT for `public`, `WITH CHECK (true)`), so anonymous inserts are allowed.

The correct destination is confirmed to be the `move_requests` table — the same table all the edge functions (`notify-companies`, `process-matches`, `check-move-distance`, `generate-invoice`) read from.

## Fix

Replace the stub with a real Supabase insert into `move_requests`, and decouple the email from the insert so a Resend failure no longer hides a successful submission.

### Field mapping

| Form field | DB column |
|---|---|
| `moveType` | `move_type` |
| `propertySize` | `estimated_size` |
| `pickupAddress` (object) | `pickup_address` (jsonb) |
| `deliveryAddress` (object) | `delivery_address` (jsonb) |
| `moveDate` | `requested_date` |
| `fullName` | `customer_name` |
| `email` | `customer_email` |
| `phone` | `customer_phone` |
| `specialInstructions` | `special_instructions` |

`status` defaults to `'pending'`. Lat/lng columns stay null (geocoding isn't wired into this submit path; out of scope).

### New behaviour

1. User completes the 5-step form and clicks Submit.
2. The row is inserted into `move_requests` first. If this fails, an error toast is shown and the success dialog does not appear.
3. After the insert succeeds, the confirmation email is attempted. If it fails (e.g. current Resend domain issue), a small warning toast appears but the success dialog still shows — the request is saved either way.

## Files touched

- `src/hooks/use-submit-move-request.tsx` — replace stub with real insert; reorder so email failure doesn't block success.

## Out of scope

- Resend domain re-verification (deferred per your instruction).
- Triggering `notify-companies` after insert (no companies on the platform right now).
- Adding geocoding into the submission path.
- Any UI/design changes.
