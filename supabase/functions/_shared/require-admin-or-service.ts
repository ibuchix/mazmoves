// Shared guard: allows either an internal service-role bearer token
// (used by pg_cron / SECURITY DEFINER SQL functions) or an authenticated admin user.
// Returns { kind: 'service' | 'admin', userId? } on success, or a Response on failure.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireAdminOrService(
  req: Request,
  corsHeaders: Record<string, string> = {},
): Promise<{ kind: "service" } | { kind: "admin"; userId: string } | Response> {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const token = authHeader.slice("Bearer ".length);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (serviceKey && token === serviceKey) {
    return { kind: "service" };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceKey,
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: row, error: roleErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (roleErr || row?.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return { kind: "admin", userId: userData.user.id };
}
