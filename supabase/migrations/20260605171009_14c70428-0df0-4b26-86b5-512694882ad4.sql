ALTER TABLE public.move_requests
  ADD COLUMN IF NOT EXISTS estimated_price_low numeric(10,2),
  ADD COLUMN IF NOT EXISTS estimated_price_high numeric(10,2),
  ADD COLUMN IF NOT EXISTS estimate_distance_miles numeric(8,2),
  ADD COLUMN IF NOT EXISTS estimate_issued_at timestamptz;