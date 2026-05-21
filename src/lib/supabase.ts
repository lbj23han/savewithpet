import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function ensureSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session?.user.id) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return data.user?.id ?? data.session?.user.id ?? null;
}
