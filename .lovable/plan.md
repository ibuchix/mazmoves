# Treat "no preference" companies as matching every move type

Update `find_companies_within_radius` so a company with no declared `service_areas.types` (missing key, null, or empty array) continues to match every request based on radius + verified + active — same as before the type filter existed. Only when a company has populated `types` do we restrict them to requests whose `move_type` is in that array.

## Filter change

Replace:

```sql
AND (
  move_type IS NULL
  OR (companies.service_areas ? 'types' AND companies.service_areas->'types' ? move_type)
)
```

With:

```sql
AND (
  move_type IS NULL
  OR NOT (companies.service_areas ? 'types')
  OR jsonb_typeof(companies.service_areas->'types') <> 'array'
  OR jsonb_array_length(companies.service_areas->'types') = 0
  OR companies.service_areas->'types' ? move_type
)
```

Match cases:

- Request has no `move_type` → match all (legacy).
- Company has no `types` key → match all.
- Company `types` is not an array or is `[]` → match all.
- Company `types` is a populated array → match only if it contains `move_type`.

## Files touched

- New migration replacing `find_companies_within_radius`
- `supabase/functions/sql/find_companies_within_radius.sql` (reference copy)

No edge function changes — the calling signature stays the same.
