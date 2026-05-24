import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("missing_supabase_admin_env");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getUserFromRequest(request, supabase) {
  const authorization = request.headers.authorization ?? request.headers.Authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;
  if (!token) throw new Error("missing_authorization");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("invalid_authorization");

  return data.user;
}
