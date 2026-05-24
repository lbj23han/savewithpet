import { getSupabaseAdmin, getUserFromRequest } from "../_supabase-admin.js";
import { tossClient } from "../_toss-client.js";
import { decryptField } from "../_toss-decrypt.js";

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const { authorizationCode, referrer } = request.body ?? {};
    if (typeof authorizationCode !== "string" || !authorizationCode.trim()) {
      response.status(400).json({ error: "missing_authorization_code" });
      return;
    }
    if (typeof referrer !== "string" || !referrer.trim()) {
      response.status(400).json({ error: "missing_referrer" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const user = await getUserFromRequest(request, supabase);

    const tokenResponse = await tossClient.generateToken(authorizationCode.trim(), referrer.trim());
    if (tokenResponse?.resultType !== "SUCCESS" || !tokenResponse?.success?.accessToken) {
      const reason = tokenResponse?.error?.reason ?? "toss_generate_token_failed";
      response.status(401).json({ error: "toss_generate_token_failed", reason });
      return;
    }

    const accessToken = tokenResponse.success.accessToken;
    const userResponse = await tossClient.getMe(accessToken);
    if (userResponse?.resultType !== "SUCCESS" || !userResponse?.success?.userKey) {
      const reason = userResponse?.error?.reason ?? "toss_get_me_failed";
      response.status(401).json({ error: "toss_get_me_failed", reason });
      return;
    }

    const raw = userResponse.success;
    const tossUserKey = String(raw.userKey);
    const displayName = decryptField(raw.name) ?? null;

    // Reject if another supabase user already owns this toss_user_key.
    const { data: existingProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, toss_user_key")
      .eq("toss_user_key", tossUserKey)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existingProfile && existingProfile.id !== user.id) {
      response.status(409).json({ error: "toss_user_already_linked" });
      return;
    }

    const linkedAt = new Date().toISOString();
    const upsertPayload = {
      id: user.id,
      toss_user_key: tossUserKey,
      toss_login_linked_at: linkedAt,
    };
    if (displayName) upsertPayload.display_name = displayName;

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(upsertPayload, { onConflict: "id" });
    if (upsertError) throw upsertError;

    // Revoke the toss access token — we only needed the user identity.
    try {
      await tossClient.removeByAccessToken(accessToken);
    } catch (revokeError) {
      console.warn("toss_token_revoke_failed", revokeError?.message);
    }

    response.status(200).json({
      tossUserKey,
      displayName,
      linkedAt,
    });
  } catch (error) {
    console.error("toss_login_failed", error);
    const message = error instanceof Error ? error.message : "toss_login_failed";
    if (message === "missing_authorization" || message === "invalid_authorization") {
      response.status(401).json({ error: message });
      return;
    }
    if (message.startsWith("missing_mtls_credential")) {
      response.status(500).json({ error: "missing_mtls_credential" });
      return;
    }
    response.status(500).json({ error: "toss_login_failed" });
  }
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}
