import { getApiUrl, isAuthEnabled } from "./apiBase";
import { getSupabaseAccessToken, isSupabaseConfigured, supabase } from "./supabase";

export type TossLoginInfo = {
  tossUserKey: string;
  displayName: string | null;
  linkedAt: string;
};

export type TossLoginResult =
  | { status: "linked"; info: TossLoginInfo }
  | { status: "cancelled" }
  | { status: "unsupported_environment" }
  | { status: "already_linked_to_other_account" }
  | { status: "error"; message: string };

export function getTossLoginReady(): boolean {
  return isAuthEnabled() && isSupabaseConfigured;
}

export async function requestTossLogin(): Promise<TossLoginResult> {
  if (!getTossLoginReady()) {
    return { status: "error", message: "Toss Login은 인증 설정 완료 후 사용할 수 있어요" };
  }

  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) {
    return { status: "error", message: "Supabase 세션이 필요해요" };
  }

  let appLoginResult: { authorizationCode: string; referrer: string };
  try {
    const framework = await import("@apps-in-toss/web-framework");
    if (typeof framework.appLogin !== "function") {
      return { status: "unsupported_environment" };
    }
    appLoginResult = await framework.appLogin();
  } catch (error) {
    if (isUserCancelled(error)) return { status: "cancelled" };
    if (isUnsupportedEnvironment(error)) return { status: "unsupported_environment" };
    return { status: "error", message: extractMessage(error, "Toss Login SDK 호출에 실패했어요") };
  }

  if (!appLoginResult?.authorizationCode || !appLoginResult?.referrer) {
    return { status: "error", message: "Toss Login 응답이 비어 있어요" };
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/auth/toss-login"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authorizationCode: appLoginResult.authorizationCode,
        referrer: appLoginResult.referrer,
      }),
    });
  } catch {
    return { status: "error", message: "Toss Login 서버에 연결하지 못했어요" };
  }

  if (response.status === 409) {
    return { status: "already_linked_to_other_account" };
  }

  let payload: { tossUserKey?: string; displayName?: string | null; linkedAt?: string; error?: string };
  try {
    payload = await response.json();
  } catch {
    return { status: "error", message: `Toss Login 응답 파싱 실패 (HTTP ${response.status})` };
  }

  if (!response.ok || !payload.tossUserKey || !payload.linkedAt) {
    return {
      status: "error",
      message: payload?.error ?? `Toss Login에 실패했어요 (HTTP ${response.status})`,
    };
  }

  return {
    status: "linked",
    info: {
      tossUserKey: payload.tossUserKey,
      displayName: payload.displayName ?? null,
      linkedAt: payload.linkedAt,
    },
  };
}

export async function loadTossLoginInfo(): Promise<TossLoginInfo | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user.id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("toss_user_key, display_name, toss_login_linked_at")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) {
    console.warn("load_toss_login_info_failed", error);
    return null;
  }
  if (!data?.toss_user_key || !data?.toss_login_linked_at) return null;

  return {
    tossUserKey: data.toss_user_key,
    displayName: data.display_name ?? null,
    linkedAt: data.toss_login_linked_at,
  };
}

function isUserCancelled(error: unknown): boolean {
  const message = extractMessage(error, "").toLowerCase();
  return message.includes("cancel") || message.includes("user_cancel");
}

function isUnsupportedEnvironment(error: unknown): boolean {
  const message = extractMessage(error, "").toLowerCase();
  return (
    message.includes("not_supported") ||
    message.includes("unsupported") ||
    message.includes("only available")
  );
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;
  return fallback;
}
