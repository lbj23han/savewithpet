import { IAP, isMinVersionSupported } from "@apps-in-toss/web-framework";
import {
  AI_CHARACTER_GENERATION_COUNT,
  AI_CHARACTER_GENERATION_PRICE_KRW,
  AI_CHARACTER_PACK_GENERATION_COUNT,
  AI_CHARACTER_PACK_PRICE_KRW,
} from "../domain/aiCharacterPolicy";
import { getApiUrl } from "./apiBase";
import { getSupabaseAccessToken } from "./supabase";

export type AiCharacterPaymentProduct = "ai_character" | "ai_character_pack";

export type AiCharacterPaymentOption = {
  creditCount: number;
  description: string;
  id: AiCharacterPaymentProduct;
  label: string;
  priceKrw: number;
  sku: string;
};

type AiCharacterPaymentGrantResult = {
  alreadyGranted: boolean;
  creditCount: number;
  productType: AiCharacterPaymentProduct;
};

const AI_CHARACTER_SKUS: Record<AiCharacterPaymentProduct, string> = {
  ai_character: import.meta.env.VITE_IAP_AI_CHARACTER_SKU || "ai_character",
  ai_character_pack: import.meta.env.VITE_IAP_AI_CHARACTER_PACK_SKU || "ai_character_pack",
};

const IAP_MIN_VERSION = {
  android: "5.219.0",
  ios: "5.219.0",
} as const;

export const AI_CHARACTER_PAYMENT_OPTIONS: AiCharacterPaymentOption[] = [
  {
    creditCount: AI_CHARACTER_GENERATION_COUNT,
    description: `사진 기반 캐릭터 ${AI_CHARACTER_GENERATION_COUNT}개 생성`,
    id: "ai_character",
    label: `${AI_CHARACTER_GENERATION_COUNT}회 생성`,
    priceKrw: AI_CHARACTER_GENERATION_PRICE_KRW,
    sku: AI_CHARACTER_SKUS.ai_character,
  },
  {
    creditCount: AI_CHARACTER_PACK_GENERATION_COUNT,
    description: `${AI_CHARACTER_PACK_GENERATION_COUNT}번 생성할 수 있는 묶음 상품`,
    id: "ai_character_pack",
    label: `${AI_CHARACTER_PACK_GENERATION_COUNT}회권`,
    priceKrw: AI_CHARACTER_PACK_PRICE_KRW,
    sku: AI_CHARACTER_SKUS.ai_character_pack,
  },
];

export async function requestAiCharacterPayment(productType: AiCharacterPaymentProduct): Promise<AiCharacterPaymentGrantResult> {
  const option = AI_CHARACTER_PAYMENT_OPTIONS.find((candidate) => candidate.id === productType);
  if (!option) throw new Error("invalid_iap_product");

  if (!isMinVersionSupported(IAP_MIN_VERSION)) {
    throw new Error("iap_unsupported_environment");
  }

  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("missing_supabase_session");

  return new Promise((resolve, reject) => {
    let cleanup = () => {};
    let settled = false;
    let grantResult: AiCharacterPaymentGrantResult | null = null;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    try {
      cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          processProductGrant: async ({ orderId }) => {
            grantResult = await grantAiCharacterProduct({ accessToken, orderId, sku: option.sku });
            finish(() => resolve(grantResult as AiCharacterPaymentGrantResult));
            return true;
          },
          sku: option.sku,
        },
        onError: (error) => finish(() => reject(error instanceof Error ? error : new Error("iap_purchase_failed"))),
        onEvent: (event) => {
          if (event.type === "success" || grantResult) {
            finish(() =>
              resolve(
                grantResult ?? {
                  alreadyGranted: false,
                  creditCount: option.creditCount,
                  productType,
                },
              ),
            );
          }
        },
      });
    } catch (error) {
      finish(() => reject(error));
    }
  });
}

export async function restorePendingAiCharacterPayments(): Promise<AiCharacterPaymentGrantResult[]> {
  if (!isMinVersionSupported(IAP_MIN_VERSION)) return [];

  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) return [];

  const pending = await IAP.getPendingOrders();
  const orders = pending?.orders ?? [];
  const results: AiCharacterPaymentGrantResult[] = [];

  for (const order of orders) {
    const sku = order.sku ?? "";
    if (!Object.values(AI_CHARACTER_SKUS).includes(sku)) continue;

    const result = await grantAiCharacterProduct({ accessToken, orderId: order.orderId, sku });
    results.push(result);

    await IAP.completeProductGrant({ params: { orderId: order.orderId } });
  }

  return results;
}

async function grantAiCharacterProduct({
  accessToken,
  orderId,
  sku,
}: {
  accessToken: string;
  orderId: string;
  sku: string;
}): Promise<AiCharacterPaymentGrantResult> {
  const response = await fetch(getApiUrl("/api/iap/grant"), {
    body: JSON.stringify({ orderId, sku }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? "iap_grant_failed");

  return {
    alreadyGranted: Boolean(payload.alreadyGranted),
    creditCount: Number(payload.creditCount ?? 0),
    productType: payload.productType,
  };
}
