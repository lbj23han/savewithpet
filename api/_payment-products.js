export const AI_PAYMENT_PRODUCTS = {
  ai_character: {
    creditCount: 2,
    orderName: "AI 캐릭터 생성권 2회",
    priceKrw: 550,
    productType: "ai_character",
    sku: process.env.IAP_AI_CHARACTER_SKU || process.env.VITE_IAP_AI_CHARACTER_SKU || "ai_character",
  },
  ai_character_pack: {
    creditCount: 5,
    orderName: "AI 캐릭터 생성권 5회권",
    priceKrw: 1100,
    productType: "ai_character_pack",
    sku: process.env.IAP_AI_CHARACTER_PACK_SKU || process.env.VITE_IAP_AI_CHARACTER_PACK_SKU || "ai_character_pack",
  },
};

export function getPaymentProduct(productType) {
  return AI_PAYMENT_PRODUCTS[productType] ?? null;
}

export function getPaymentProductBySku(sku) {
  return Object.values(AI_PAYMENT_PRODUCTS).find((product) => product.sku === sku) ?? null;
}
