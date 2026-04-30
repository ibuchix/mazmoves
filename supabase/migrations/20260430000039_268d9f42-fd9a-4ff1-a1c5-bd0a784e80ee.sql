-- 1. De-duplicate existing rows: keep the oldest assignment per (request_id, company_id)
DELETE FROM public.move_assignments a
USING public.move_assignments b
WHERE a.request_id = b.request_id
  AND a.company_id = b.company_id
  AND a.created_at > b.created_at;

-- Edge case: if two rows have identical created_at, keep the smaller id
DELETE FROM public.move_assignments a
USING public.move_assignments b
WHERE a.request_id = b.request_id
  AND a.company_id = b.company_id
  AND a.created_at = b.created_at
  AND a.id > b.id;

-- 2. Enforce uniqueness at the DB level so retries are safe
ALTER TABLE public.move_assignments
  ADD CONSTRAINT move_assignments_request_company_unique
  UNIQUE (request_id, company_id);