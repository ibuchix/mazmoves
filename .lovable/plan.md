## Goal
Fix the "View job in dashboard" CTA in the company notification email so it links to the company dashboard instead of the marketing site.

## Change
- File: `supabase/functions/notify-companies/send-company-email.ts`
- Update the CTA `<a href="https://housemove.co">` to `https://jobs.housemove.co/dashboard`.
- No other copy, styling, or logic changes.

## Verification
- Redeploy `notify-companies`.
- Trigger a test send and confirm the button href in the received email is `https://jobs.housemove.co/dashboard`.

## Out of scope
Any other email content, other edge functions, or matching/assignment logic.