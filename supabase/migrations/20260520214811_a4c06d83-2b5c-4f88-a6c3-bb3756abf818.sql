ALTER TABLE public.move_requests
  ADD COLUMN IF NOT EXISTS ip_origin text;

CREATE INDEX IF NOT EXISTS idx_move_requests_source_ip_created
  ON public.move_requests (source, ip_origin, created_at DESC)
  WHERE source = 'mcp';

COMMENT ON COLUMN public.move_requests.ip_origin IS
  'Client IP captured for MCP submissions; used for per-IP rate limiting in mcp-server.';