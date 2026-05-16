// Shared guard: requires the caller to be the owner of the given companyId
// (companies.auth_user_id === user.id) OR an admin.
// Returns { user, isAdmin, company } on success, or a Response (401/403/404) on failure.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireCompanyOwnerOrAdmin(
  req: Request,
  companyId: string,
  corsHeaders: Record<string, string> = {},
): Promise<
  | { user: { id: string; email?: string }; isAdmin: boolean; company: any }
  | Response
> {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const token = authHeader.slice("Bearer ".length);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const userId = userData.user.id;

  const { data: roleRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const isAdmin = roleRow?.role === "admin";

  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (companyErr || !company) {
    return new Response(
      JSON.stringify({ error: "Company not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!isAdmin && company.auth_user_id !== userId) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return {
    user: { id: userId, email: userData.user.email ?? undefined },
    isAdmin,
    company,
  };
}
