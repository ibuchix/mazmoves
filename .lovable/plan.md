# Remove the unused `public.secrets` table

## Why

The security scanner flagged `public.secrets` (a `bytea` column for raw secret storage) as risky: no SELECT policy exists, but any future `SECURITY DEFINER` function could leak it, and storing raw secrets in an application table is an anti-pattern.

Investigation findings:
- The table is **empty** (0 rows).
- **No code** in `src/` or `supabase/functions/` reads from or writes to it — the only reference is in the auto-generated `src/integrations/supabase/types.ts`, which regenerates from the schema.
- **No database function** references it.
- All real secrets (Resend, Stripe, Mapbox, TikTok, Supabase service role, etc.) are already stored in Supabase Edge Function secrets (`Deno.env.get(...)`), which is the correct place.

So the table is dead weight and a latent risk. The cleanest fix is to drop it.

## Change

Single migration:

```sql
DROP TABLE IF EXISTS public.secrets;
DROP SEQUENCE IF EXISTS public.secrets_id_seq;
```

After the migration runs, the Supabase types file will auto-regenerate without the `secrets` entry. No application code needs to change.

## Out of scope

The security view shows many other unrelated findings (plaintext passwords in `companies`, privilege-escalation policies on `users`, unauthenticated edge functions, etc.). Those are separate issues and not addressed here — this plan is only about the `secrets` table finding.
