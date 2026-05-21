// agent-bridge edge function
// --------------------------
// Generic-named public proxy in front of the internal mcp-server function.
// - Hides the internal function name from external discovery.
// - Forwards only MCP-required headers + a shared secret so mcp-server can
//   verify the caller came through this proxy (defense in depth against
//   direct calls to the internal function).
// - Streams upstream response so MCP Streamable HTTP (SSE) keeps working.
// - Returns generic error on 5xx upstream failures (no internal detail leak).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, mcp-session-id",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const TARGET = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mcp-server`;
const SECRET = Deno.env.get("AGENT_BRIDGE_SECRET") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!SECRET) {
    console.error("agent-bridge: AGENT_BRIDGE_SECRET not configured");
    return new Response(
      JSON.stringify({ error: "upstream_unavailable" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const fwdHeaders = new Headers();
  for (const h of ["content-type", "accept", "mcp-session-id"]) {
    const v = req.headers.get(h);
    if (v) fwdHeaders.set(h, v);
  }
  fwdHeaders.set("X-Agent-Bridge-Auth", SECRET);
  fwdHeaders.set(
    "X-Agent-Bridge-Client-IP",
    req.headers.get("x-forwarded-for") ?? "unknown",
  );
  // mcp-server has verify_jwt=false but the Supabase functions gateway still
  // requires a bearer token on the outer hop.
  fwdHeaders.set("Authorization", `Bearer ${SERVICE_ROLE}`);

  let upstream: Response;
  try {
    upstream = await fetch(TARGET, {
      method: req.method,
      headers: fwdHeaders,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    });
  } catch (err) {
    console.error("agent-bridge: upstream fetch failed:", err);
    return new Response(
      JSON.stringify({ error: "upstream_unavailable" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (upstream.status >= 500) {
    // Don't echo internal error bodies.
    const detail = await upstream.text().catch(() => "");
    console.error(`agent-bridge: upstream ${upstream.status}:`, detail);
    return new Response(
      JSON.stringify({ error: "upstream_unavailable" }),
      { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const out = new Headers();
  // Preserve only safe response headers.
  const ct = upstream.headers.get("content-type");
  if (ct) out.set("content-type", ct);
  const sid = upstream.headers.get("mcp-session-id");
  if (sid) out.set("mcp-session-id", sid);
  for (const [k, v] of Object.entries(corsHeaders)) out.set(k, v);

  return new Response(upstream.body, { status: upstream.status, headers: out });
});
