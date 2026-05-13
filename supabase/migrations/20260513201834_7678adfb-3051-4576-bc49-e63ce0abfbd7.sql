-- Lock down move_requests: remove public anon INSERT policies (the new
-- submit-move-request edge function inserts via the service role) and add
-- defence-in-depth CHECK constraints on customer-controlled fields.

DROP POLICY IF EXISTS "Anyone can create move requests" ON public.move_requests;
DROP POLICY IF EXISTS "Anyone can create requests" ON public.move_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.move_requests;

ALTER TABLE public.move_requests
  ADD CONSTRAINT move_requests_customer_name_length
    CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT move_requests_customer_email_length
    CHECK (char_length(customer_email) <= 255),
  ADD CONSTRAINT move_requests_customer_phone_length
    CHECK (customer_phone IS NULL OR char_length(customer_phone) <= 32),
  ADD CONSTRAINT move_requests_special_instructions_length
    CHECK (special_instructions IS NULL OR char_length(special_instructions) <= 500),
  ADD CONSTRAINT move_requests_move_type_allowed
    CHECK (move_type IS NULL OR move_type IN ('domestic','commercial','international'));