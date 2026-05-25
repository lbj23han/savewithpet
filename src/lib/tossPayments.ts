import { IAP, isMinVersionSupported } from "@apps-in-toss/web-framework";
import type { IapProductListItem } from "@apps-in-toss/web-framework";
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

let iapProductsPromise: Promise<IapProductListItem[]> | null = null;

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

  const resolvedSku = await resolveIapSku(option);

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
            grantResult = await grantAiCharacterProduct({ accessToken, orderId, productType, sku: resolvedSku });
            finish(() => resolve(grantResult as AiCharacterPaymentGrantResult));
            return true;
          },
          sku: resolvedSku,
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
    const productType = await resolveProductTypeBySku(sku);
    if (!productType) continue;

    const result = await grantAiCharacterProduct({ accessToken, orderId: order.orderId, productType, sku });
    results.push(result);

    await IAP.completeProductGrant({ params: { orderId: order.orderId } });
  }

  return results;
}

async function grantAiCharacterProduct({
  accessToken,
  orderId,
  productType,
  sku,
}: {
  accessToken: string;
  orderId: string;
  productType: AiCharacterPaymentProduct;
  sku: string;
}): Promise<AiCharacterPaymentGrantResult> {
  const response = await fetch(getApiUrl("/api/iap/grant"), {
    body: JSON.stringify({ orderId, productType, sku }),
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

async function getIapProducts(): Promise<IapProductListItem[]> {
  iapProductsPromise ??= IAP.getProductItemList()
    .then((response) => response?.products ?? [])
    .catch((error) => {
      console.info("IAP product list lookup skipped", error);
      iapProductsPromise = null;
      return [];
    });

  return iapProductsPromise;
}

async function resolveIapSku(option: AiCharacterPaymentOption): Promise<string> {
  const products = await getIapProducts();
  const exactProduct = products.find((product) => product.sku === option.sku || product.sku === `sku:${option.id}`);
  if (exactProduct) return exactProduct.sku;

  const matchingProducts = products.filter((product) => productMatchesOption(product, option));
  if (matchingProducts.length === 1) return matchingProducts[0].sku;

  const priceMatchedProducts = products.filter((product) => getDisplayAmount(product) === option.priceKrw);
  if (priceMatchedProducts.length === 1) return priceMatchedProducts[0].sku;

  return option.sku;
}

async function resolveProductTypeBySku(sku: string): Promise<AiCharacterPaymentProduct | null> {
  const configuredProduct = AI_CHARACTER_PAYMENT_OPTIONS.find(
    (option) => option.sku === sku || `sku:${option.id}` === sku || option.id === sku,
  );
  if (configuredProduct) return configuredProduct.id;

  const products = await getIapProducts();
  const product = products.find((candidate) => candidate.sku === sku);
  if (!product) return null;

  const matchedOption = AI_CHARACTER_PAYMENT_OPTIONS.find((option) => productMatchesOption(product, option));
  return matchedOption?.id ?? null;
}

function productMatchesOption(product: IapProductListItem, option: AiCharacterPaymentOption): boolean {
  const amount = getDisplayAmount(product);
  const searchableText = `${product.displayName} ${product.description ?? ""}`.toLowerCase();
  const hasMatchingCount = searchableText.includes(String(option.creditCount));
  const hasAiCharacterText =
    searchableText.includes("ai") || searchableText.includes("캐릭터") || searchableText.includes("character");

  if (amount !== option.priceKrw) return false;
  if (hasMatchingCount) return true;
  return hasAiCharacterText;
}

function getDisplayAmount(product: IapProductListItem): number | null {
  const amountText = product.displayAmount ?? "";
  const numeric = Number(amountText.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}
