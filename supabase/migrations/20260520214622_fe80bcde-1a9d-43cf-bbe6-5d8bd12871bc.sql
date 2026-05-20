ALTER TABLE public.move_requests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web';

COMMENT ON COLUMN public.move_requests.source IS
  'Origin of the request: ''web'' for human form, ''mcp'' for AI agents via mcp-server edge function.';