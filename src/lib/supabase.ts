import { createClient } from "@supabase/supabase-js";
import { isAuthEnabled } from "./apiBase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(isAuthEnabled() && supabaseUrl && supabaseAnonKey);

export const supabase =
  isAuthEnabled() && supabaseUrl && supabaseAnonKey
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

export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session?.access_token) return session.access_token;

  await ensureSupabaseUserId();
  const {
    data: { session: nextSession },
    error: nextSessionError,
  } = await supabase.auth.getSession();

  if (nextSessionError) throw nextSessionError;

  return nextSession?.access_token ?? null;
}
