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

const PAYMENT_PRODUCT_SKU_ALIASES = {
  ai_character: ["ai_character", "sku:ai_character"],
  ai_character_pack: ["ai_character_pack", "sku:ai_character_pack"],
};

export function getPaymentProduct(productType) {
  return AI_PAYMENT_PRODUCTS[productType] ?? null;
}

export function getPaymentProductBySku(sku) {
  return (
    Object.values(AI_PAYMENT_PRODUCTS).find((product) => {
      const aliases = PAYMENT_PRODUCT_SKU_ALIASES[product.productType] ?? [];
      return product.sku === sku || aliases.includes(sku);
    }) ?? null
  );
}

export function getPaymentProductByType(productType) {
  return AI_PAYMENT_PRODUCTS[productType] ?? null;
}

export function getPaymentProductBySkuOrType(sku, productType) {
  const product = getPaymentProductBySku(sku);
  if (product) return product;

  const typedProduct = getPaymentProductByType(productType);
  if (!typedProduct) return null;

  const aliases = PAYMENT_PRODUCT_SKU_ALIASES[typedProduct.productType] ?? [];
  if (aliases.includes(sku) || sku.startsWith("ait.")) return typedProduct;

  return null;
}
