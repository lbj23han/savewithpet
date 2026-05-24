const AI_GENERATION_PRICE_KRW = 550;
const AI_GENERATION_COUNT = 2;
const AI_GENERATION_PACK_PRICE_KRW = 1100;
const AI_GENERATION_PACK_COUNT = 5;
const AI_GENERATION_MAX_OWNED_COUNT = 5;
const DEFAULT_IMAGE_MODEL = "gpt-image-1";
const MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;

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

  if (process.env.AI_CHARACTER_GENERATION_ENABLED !== "true") {
    response.status(503).json({
      error: "ai_character_generation_disabled",
      message: "AI 캐릭터 생성이 아직 비활성화되어 있어요.",
      ...getPolicyPayload(),
    });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(500).json({ error: "missing_openai_api_key" });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const sourceImage = parseDataUrlImage(body.imageDataUrl, body.mimeType);
    if (sourceImage.buffer.length > MAX_SOURCE_IMAGE_BYTES) {
      response.status(413).json({ error: "source_image_too_large", message: "사진은 5MB 이하로 올려주세요." });
      return;
    }

    const copy = createCharacterCopy(body.fileName ?? "");
    const form = new FormData();
    form.append("model", process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL);
    form.append(
      "prompt",
      [
        "Create one premium cute companion character for a Korean savings app from the user's pet photo.",
        "Use the photo only as identity reference. Do not return or crop the original photo.",
        "Make a polished soft 3D app mascot, full body, centered, transparent background.",
        "No text, no frame, no room background, no human, no watermark.",
        "The output must be a clean standalone character suitable for a mobile app home screen.",
      ].join(" "),
    );
    form.append("image", new Blob([sourceImage.buffer], { type: sourceImage.mimeType }), sanitizeFileName(body.fileName));
    form.append("size", "1024x1024");
    form.append("background", "transparent");
    form.append("output_format", "png");

    const openAiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      body: form,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
    });

    const payload = await openAiResponse.json();
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: "openai_image_generation_failed",
        message: payload?.error?.message ?? "AI 캐릭터 생성에 실패했어요.",
      });
      return;
    }

    const b64Json = payload?.data?.[0]?.b64_json;
    if (!b64Json) {
      response.status(502).json({ error: "missing_generated_image", message: "생성된 이미지가 비어 있어요." });
      return;
    }

    response.status(200).json({
      imageUrl: `data:image/png;base64,${b64Json}`,
      name: copy.name,
      trait: copy.trait,
      ...getPolicyPayload(),
    });
  } catch (error) {
    response.status(400).json({
      error: "invalid_ai_character_request",
      message: error instanceof Error ? error.message : "사진 정보를 읽지 못했어요.",
    });
  }
}

function getPolicyPayload() {
  return {
    generationCount: AI_GENERATION_COUNT,
    maxOwnedCount: AI_GENERATION_MAX_OWNED_COUNT,
    packCount: AI_GENERATION_PACK_COUNT,
    packPriceKrw: AI_GENERATION_PACK_PRICE_KRW,
    priceKrw: AI_GENERATION_PRICE_KRW,
  };
}

async function readJsonBody(request) {
  if (typeof request.body === "string") return request.body ? JSON.parse(request.body) : {};
  if (Buffer.isBuffer(request.body)) return request.body.length ? JSON.parse(request.body.toString("utf8")) : {};
  if (request.body && typeof request.body === "object") return request.body;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function parseDataUrlImage(imageDataUrl, fallbackMimeType = "image/png") {
  if (typeof imageDataUrl !== "string") throw new Error("이미지 데이터가 없어요.");

  const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
  if (!match) throw new Error("지원하지 않는 이미지 형식이에요.");

  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1] || fallbackMimeType;
  return {
    buffer: Buffer.from(match[2], "base64"),
    mimeType,
  };
}

function sanitizeFileName(fileName) {
  const safeName = typeof fileName === "string" ? fileName.replace(/[^\w.-]/g, "_") : "";
  return safeName || "pet-photo.png";
}

function createCharacterCopy(fileName) {
  const lowerFileName = String(fileName).toLowerCase();
  if (["cat", "kitten", "nyang", "고양", "냥"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "몽글냥", trait: "사진 속 초롱한 눈빛을 귀엽게 담은 친구예요" };
  }
  if (["rabbit", "bunny", "토끼", "깡총"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "방긋토끼", trait: "사진 속 말랑한 분위기를 다정하게 담은 친구예요" };
  }
  if (["dog", "puppy", "강아", "멍"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "포근개", trait: "사진 속 다정한 표정을 포근하게 담은 친구예요" };
  }
  return { name: "몽글친구", trait: "사진 속 사랑스러운 분위기를 귀엽게 담은 친구예요" };
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Cache-Control", "no-store");
}
