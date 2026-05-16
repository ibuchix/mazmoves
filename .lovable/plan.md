# Fix: Realtime exposure of `move_assignments`

## The finding
`move_assignments` is published to Supabase Realtime (`supabase_realtime` publication). RLS on the underlying table does not apply to Realtime channel broadcasts, so any authenticated user can subscribe and receive change events for every company's assignments.

## What I verified
- `pg_publication_tables` confirms `public.move_assignments` is the only table in the `supabase_realtime` publication.
- Codebase-wide search across `src/` and `supabase/` for `.channel(`, `postgres_changes`, and `realtime` returns **zero matches**. Nothing in the frontend or any edge function subscribes to Realtime for `move_assignments` (or any other table).
- The matching system (`process-matches`, `submit-move-request`, company dashboards) reads/writes `move_assignments` via the standard PostgREST API — not Realtime. RLS policies on the table already correctly scope company access.

## Proposed fix
Remove `move_assignments` from the `supabase_realtime` publication. No code changes needed.

```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.move_assignments;
```

## Why this is safe for the matching system
- Matching, assignment creation, acceptance, and the 25-mile radius logic all run via service-role inserts (in `process-matches`) and authenticated SELECT/UPDATE through existing RLS policies. None of this depends on Realtime.
- Company dashboards fetch assignments via normal queries — confirmed no `.channel()` or `postgres_changes` subscriptions exist anywhere.
- Removing a table from the publication only stops change events from being broadcast; it does not affect table data, RLS, queries, or writes.

## Alternative considered (not recommended)
Adding RLS policies on `realtime.messages` to scope topic subscriptions by `auth.uid()` → company ownership. This is more complex, brittle (depends on topic naming conventions), and unnecessary because no client subscribes today. If a future feature needs Realtime for assignments, we re-add the table to the publication and add scoped `realtime.messages` policies then.

## Steps
1. Run a migration dropping `public.move_assignments` from `supabase_realtime`.
2. Mark the security finding as fixed.
