export const AI_PAYMENT_PRODUCTS = {
  ai_character: {
    creditCount: 1,
    orderName: "AI 캐릭터 생성권 1회",
    priceKrw: 330,
  },
  ai_character_pack: {
    creditCount: 5,
    orderName: "AI 캐릭터 생성권 5회권",
    priceKrw: 1100,
  },
};

export function getPaymentProduct(productType) {
  return AI_PAYMENT_PRODUCTS[productType] ?? null;
}
