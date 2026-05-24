import { getSupabaseAdmin } from "../_supabase-admin.js";

// Toss가 사용자 연동 해제 시 GET 또는 POST로 호출하는 webhook.
// 본인 인증 없이 호출되므로 profile에서 toss_user_key/linked_at만 비웁니다.
export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST, OPTIONS");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const rawUserKey =
      request.method === "GET"
        ? request.query?.userKey
        : (request.body ?? {}).userKey;
    const tossUserKey = rawUserKey != null ? String(rawUserKey).trim() : "";

    if (!tossUserKey) {
      response.status(400).json({ error: "missing_user_key" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ toss_user_key: null, toss_login_linked_at: null })
      .eq("toss_user_key", tossUserKey);

    if (error) throw error;

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error("toss_disconnect_failed", error);
    response.status(500).json({ error: "toss_disconnect_failed" });
  }
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
