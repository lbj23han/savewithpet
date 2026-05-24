import { getPaymentProductBySku } from "../_payment-products.js";
import { getSupabaseAdmin, getUserFromRequest } from "../_supabase-admin.js";

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
    const { orderId, sku } = request.body ?? {};
    const normalizedOrderId = typeof orderId === "string" ? orderId.trim() : "";
    const normalizedSku = typeof sku === "string" ? sku.trim() : "";

    if (!normalizedOrderId || !normalizedSku) {
      response.status(400).json({ error: "missing_iap_params" });
      return;
    }

    const product = getPaymentProductBySku(normalizedSku);
    if (!product) {
      response.status(400).json({ error: "unsupported_iap_sku" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const user = await getUserFromRequest(request, supabase);
    const { data: existingPurchase, error: existingPurchaseError } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("provider", "apps_in_toss_iap")
      .eq("provider_order_id", normalizedOrderId)
      .maybeSingle();

    if (existingPurchaseError) throw existingPurchaseError;
    if (existingPurchase?.status === "paid") {
      response.status(200).json({
        alreadyGranted: true,
        creditCount: 0,
        productType: product.productType,
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("ai_character_credits")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const nextCredits = (profile?.ai_character_credits ?? 0) + product.creditCount;
    const { error: profileUpsertError } = await supabase.from("profiles").upsert(
      {
        ai_character_credits: nextCredits,
        id: user.id,
      },
      { onConflict: "id" },
    );

    if (profileUpsertError) throw profileUpsertError;

    const purchasePayload = {
      price_krw: product.priceKrw,
      product_id: normalizedSku,
      product_type: product.productType,
      provider: "apps_in_toss_iap",
      provider_order_id: normalizedOrderId,
      provider_payment_id: normalizedOrderId,
      status: "paid",
      user_id: user.id,
    };

    if (existingPurchase?.id) {
      const { error: updateError } = await supabase.from("purchases").update(purchasePayload).eq("id", existingPurchase.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("purchases").insert(purchasePayload);
      if (insertError) throw insertError;
    }

    response.status(200).json({
      alreadyGranted: false,
      creditCount: product.creditCount,
      productType: product.productType,
    });
  } catch (error) {
    console.error("iap_grant_failed", error);
    response.status(500).json({ error: "iap_grant_failed" });
  }
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}
