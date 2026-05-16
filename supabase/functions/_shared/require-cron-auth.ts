// Shared guard for cron-triggered edge functions.
// Accepts either:
//  - Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
//  - x-cron-secret: <CRON_SECRET>
// Returns null on success, or a 401 Response to return immediately on failure.

export function requireCronAuth(req: Request, corsHeaders: Record<string, string> = {}): Response | null {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";

  const authHeader = req.headers.get("authorization") ?? "";
  const cronHeader = req.headers.get("x-cron-secret") ?? "";

  const okAuth = serviceKey.length > 0 && authHeader === `Bearer ${serviceKey}`;
  const okCron = cronSecret.length > 0 && cronHeader === cronSecret;

  if (okAuth || okCron) return null;

  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
