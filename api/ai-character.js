const AI_GENERATION_PRICE_KRW = 330;
const AI_GENERATION_PACK_PRICE_KRW = 1100;
const AI_GENERATION_PACK_COUNT = 5;
const AI_GENERATION_MAX_OWNED_COUNT = 5;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (process.env.AI_CHARACTER_GENERATION_ENABLED !== "true") {
    response.status(503).json({
      error: "ai_character_generation_disabled",
      message: "AI character generation is wired but disabled until payment and photo review are approved.",
      maxOwnedCount: AI_GENERATION_MAX_OWNED_COUNT,
      packCount: AI_GENERATION_PACK_COUNT,
      packPriceKrw: AI_GENERATION_PACK_PRICE_KRW,
      priceKrw: AI_GENERATION_PRICE_KRW,
    });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(500).json({ error: "missing_openai_api_key" });
    return;
  }

  response.status(501).json({
    error: "not_implemented",
    message: "Connect paid payment verification, photo review, then call the image generation pipeline here.",
    maxOwnedCount: AI_GENERATION_MAX_OWNED_COUNT,
    packCount: AI_GENERATION_PACK_COUNT,
    packPriceKrw: AI_GENERATION_PACK_PRICE_KRW,
    priceKrw: AI_GENERATION_PRICE_KRW,
  });
}
