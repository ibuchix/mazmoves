// Shared guard for Supabase Database Webhook-triggered edge functions.
// Accepts either:
//  - x-webhook-secret: <MOVE_ASSIGNMENT_WEBHOOK_SECRET>  (preferred for DB webhooks)
//  - Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (server-to-server fallback)
// Returns null on success, or a 401 Response to return immediately on failure.

export function requireWebhookSecret(
  req: Request,
  secretEnv: string,
  corsHeaders: Record<string, string> = {},
): Response | null {
  const expectedSecret = Deno.env.get(secretEnv) ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const webhookHeader = req.headers.get("x-webhook-secret") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";

  const okWebhook = expectedSecret.length > 0 && webhookHeader === expectedSecret;
  const okService = serviceKey.length > 0 && authHeader === `Bearer ${serviceKey}`;

  if (okWebhook || okService) return null;

  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
