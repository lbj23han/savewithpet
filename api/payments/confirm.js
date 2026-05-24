import { getPaymentProduct } from "../_payment-products.js";
import { getSupabaseAdmin, getUserFromRequest } from "../_supabase-admin.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const { amount, orderId, paymentKey } = request.body ?? {};
    if (!amount || !orderId || !paymentKey) {
      response.status(400).json({ error: "missing_payment_params" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const user = await getUserFromRequest(request, supabase);
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, price_krw, product_type, status")
      .eq("user_id", user.id)
      .eq("provider", "toss_payments")
      .eq("provider_order_id", orderId)
      .single();

    if (purchaseError || !purchase) {
      response.status(404).json({ error: "purchase_not_found" });
      return;
    }

    if (purchase.status === "paid") {
      const product = getPaymentProduct(purchase.product_type);
      response.status(200).json({ creditCount: product?.creditCount ?? 0, productType: purchase.product_type });
      return;
    }

    const product = getPaymentProduct(purchase.product_type);
    if (!product || purchase.price_krw !== Number(amount) || product.priceKrw !== Number(amount)) {
      response.status(400).json({ error: "payment_amount_mismatch" });
      return;
    }

    await confirmTossPayment({ amount: Number(amount), orderId, paymentKey });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("ai_character_credits")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const nextCredits = (profile?.ai_character_credits ?? 0) + product.creditCount;
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ ai_character_credits: nextCredits })
      .eq("id", user.id);

    if (updateProfileError) throw updateProfileError;

    const { error: updatePurchaseError } = await supabase
      .from("purchases")
      .update({
        provider_payment_id: paymentKey,
        status: "paid",
      })
      .eq("id", purchase.id);

    if (updatePurchaseError) throw updatePurchaseError;

    response.status(200).json({ creditCount: product.creditCount, productType: purchase.product_type });
  } catch (error) {
    console.error("payment_confirm_failed", error);
    response.status(500).json({ error: "payment_confirm_failed" });
  }
}

async function confirmTossPayment({ amount, orderId, paymentKey }) {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  if (!secretKey) throw new Error("missing_toss_payments_secret_key");

  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    body: JSON.stringify({ amount, orderId, paymentKey }),
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": orderId,
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`toss_payment_confirm_failed:${payload}`);
  }
}
