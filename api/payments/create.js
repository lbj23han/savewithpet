import { getPaymentProduct } from "../_payment-products.js";
import { getSupabaseAdmin, getUserFromRequest } from "../_supabase-admin.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const { productType } = request.body ?? {};
    const product = getPaymentProduct(productType);
    if (!product) {
      response.status(400).json({ error: "invalid_product_type" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const user = await getUserFromRequest(request, supabase);
    const orderId = `swp_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;

    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert({
        price_krw: product.priceKrw,
        product_type: productType,
        provider: "toss_payments",
        provider_order_id: orderId,
        status: "pending",
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error) throw error;

    const origin = getRequestOrigin(request);
    const searchParams = new URLSearchParams({
      paymentResult: "success",
      productType,
      purchaseId: purchase.id,
    });
    const failParams = new URLSearchParams({
      paymentResult: "fail",
      productType,
      purchaseId: purchase.id,
    });

    response.status(200).json({
      amount: product.priceKrw,
      customerKey: user.id,
      failUrl: `${origin}/?${failParams.toString()}`,
      orderId,
      orderName: product.orderName,
      purchaseId: purchase.id,
      successUrl: `${origin}/?${searchParams.toString()}`,
    });
  } catch (error) {
    console.error("payment_create_failed", error);
    response.status(500).json({ error: "payment_create_failed" });
  }
}

function getRequestOrigin(request) {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const forwardedHost = request.headers["x-forwarded-host"];
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  const host = request.headers.host;
  return host ? `https://${host}` : "http://localhost:5174";
}
