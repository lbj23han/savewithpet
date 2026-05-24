import {
  AI_CHARACTER_GENERATION_PRICE_KRW,
  AI_CHARACTER_PACK_GENERATION_COUNT,
  AI_CHARACTER_PACK_PRICE_KRW,
} from "../domain/aiCharacterPolicy";
import { getSupabaseAccessToken } from "./supabase";

export type AiCharacterPaymentProduct = "ai_character" | "ai_character_pack";

export type AiCharacterPaymentOption = {
  creditCount: number;
  description: string;
  id: AiCharacterPaymentProduct;
  label: string;
  priceKrw: number;
};

type TossPaymentInstance = {
  requestPayment: (options: {
    amount: { currency: "KRW"; value: number };
    failUrl: string;
    method: "CARD";
    orderId: string;
    orderName: string;
    successUrl: string;
    windowTarget?: "self" | "iframe";
  }) => Promise<void>;
};

type TossPaymentsFactory = (clientKey: string) => {
  payment: (options: { customerKey: string }) => TossPaymentInstance;
};

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

export const AI_CHARACTER_PAYMENT_OPTIONS: AiCharacterPaymentOption[] = [
  {
    creditCount: 1,
    description: "사진 기반 캐릭터 1개 생성",
    id: "ai_character",
    label: "1회 생성",
    priceKrw: AI_CHARACTER_GENERATION_PRICE_KRW,
  },
  {
    creditCount: AI_CHARACTER_PACK_GENERATION_COUNT,
    description: `${AI_CHARACTER_PACK_GENERATION_COUNT}번 생성할 수 있는 묶음 상품`,
    id: "ai_character_pack",
    label: `${AI_CHARACTER_PACK_GENERATION_COUNT}회권`,
    priceKrw: AI_CHARACTER_PACK_PRICE_KRW,
  },
];

export async function requestAiCharacterPayment(productType: AiCharacterPaymentProduct): Promise<void> {
  const clientKey = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY as string | undefined;
  if (!clientKey) throw new Error("missing_toss_payments_client_key");

  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("missing_supabase_session");

  await loadTossPaymentsSdk();

  const response = await fetch("/api/payments/create", {
    body: JSON.stringify({ productType }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? "payment_create_failed");

  const payment = window.TossPayments?.(clientKey).payment({ customerKey: payload.customerKey });
  if (!payment) throw new Error("toss_payments_sdk_unavailable");

  await payment.requestPayment({
    amount: { currency: "KRW", value: payload.amount },
    failUrl: payload.failUrl,
    method: "CARD",
    orderId: payload.orderId,
    orderName: payload.orderName,
    successUrl: payload.successUrl,
    windowTarget: "self",
  });
}

export async function confirmAiCharacterPayment({
  amount,
  orderId,
  paymentKey,
}: {
  amount: string;
  orderId: string;
  paymentKey: string;
}): Promise<{ creditCount: number; productType: AiCharacterPaymentProduct }> {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("missing_supabase_session");

  const response = await fetch("/api/payments/confirm", {
    body: JSON.stringify({ amount: Number(amount), orderId, paymentKey }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? "payment_confirm_failed");

  return {
    creditCount: payload.creditCount,
    productType: payload.productType,
  };
}

function loadTossPaymentsSdk(): Promise<void> {
  if (window.TossPayments) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://js.tosspayments.com/v2/standard"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("toss_payments_sdk_load_failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("toss_payments_sdk_load_failed"));
    document.head.appendChild(script);
  });
}
