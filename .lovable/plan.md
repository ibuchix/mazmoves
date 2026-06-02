## Investigation

The "RLS Disabled in Public" finding flags exactly one table:

- `public.spatial_ref_sys` — owned by `supabase_admin`, installed by the PostGIS extension.

This is a **PostGIS reference table** containing standard spatial reference system definitions (EPSG codes, projections). It is:
- Read-only reference data — no user/business information.
- Required by PostGIS functions on our `companies.location` and `move_requests.pickup_location/delivery_location` (`geography` columns).
- Owned by `supabase_admin`, not by us — we cannot `ALTER TABLE … ENABLE ROW LEVEL SECURITY` on it from the SQL editor.

This is a well-known Supabase linter false-positive. Supabase officially documents it: https://github.com/orgs/supabase/discussions/21347 — there is no security risk because the table contains no sensitive data, and disabling/enabling RLS on it can break PostGIS queries used by our geolocation features (company matching, distance checks, location-based search).

## What NOT to do

- Do **not** run `ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY` — it would fail (we don't own it) or, if it succeeded, would break every PostGIS query the app relies on for company matching and location features.
- Do **not** move the PostGIS extension out of `public` — that is a separate (also non-trivial) lint and would require rewriting every `ST_*` call site and re-indexing `geography` columns.

## Plan

1. Mark the `SUPA_rls_disabled_in_public` finding as **Ignore** with an explanation that this is PostGIS reference data, not owned by us, and contains no sensitive information.
2. Update the project's security memory so future scans understand this is an accepted, documented exception specific to `spatial_ref_sys`.

No application code, RLS policies, or database structure will change. The geolocation features continue to work exactly as today.

```text
Finding scope:
  public.spatial_ref_sys  →  PostGIS reference data  →  Ignore (documented)
```

## Technical details

- Finding: `SUPA_rls_disabled_in_public` (Supabase linter rule 0013)
- Affected object: `public.spatial_ref_sys` (PostGIS extension table)
- Owner: `supabase_admin`
- Reason for ignoring: standards/reference data, no PII, required by PostGIS, not owned by the project
- Action: `security--manage_security_finding` with `operation: ignore` + `security--update_memory` to record the exception
