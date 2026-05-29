import { createHash } from "node:crypto";

import { getSupabaseAdmin, getUserFromRequest } from "./_supabase-admin.js";

const AI_GENERATION_PRICE_KRW = 550;
const AI_GENERATION_COUNT = 2;
const AI_GENERATION_PACK_PRICE_KRW = 1100;
const AI_GENERATION_PACK_COUNT = 5;
const AI_GENERATION_MAX_OWNED_COUNT = 5;
const DEFAULT_IMAGE_MODEL = "gpt-image-1";
const MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROMPT_VERSION = "single-png-v1";

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

  let supabase;
  let user;
  let consumedCredit = false;
  let jobId = null;

  try {
    const body = await readJsonBody(request);
    const sourceImage = parseDataUrlImage(body.imageDataUrl, body.mimeType);
    if (sourceImage.buffer.length > MAX_SOURCE_IMAGE_BYTES) {
      response.status(413).json({ error: "source_image_too_large", message: "사진은 5MB 이하로 올려주세요." });
      return;
    }

    supabase = getSupabaseAdmin();
    user = await getUserFromRequest(request, supabase);

    const clientId = normalizeClientId(body.clientGenerationId);
    const sourceHash = createHash("sha256").update(sourceImage.buffer).digest("hex");
    const copy = createCharacterCopy(body.fileName ?? "");
    const existingJob = clientId ? await findExistingJob(supabase, user.id, clientId) : null;
    if (existingJob) {
      const metadata = existingJob.input_metadata ?? {};
      if (existingJob.status === "succeeded" && existingJob.result_image_url) {
        response.status(200).json({
          imageUrl: existingJob.result_image_url,
          jobId: existingJob.id,
          name: metadata.copy?.name ?? copy.name,
          remainingCredits: await getRemainingCredits(supabase, user.id),
          trait: metadata.copy?.trait ?? copy.trait,
          ...getPolicyPayload(),
        });
        return;
      }

      response.status(409).json({
        error: `ai_character_job_${existingJob.status}`,
        message:
          existingJob.status === "processing" || existingJob.status === "queued"
            ? "이미 캐릭터를 만들고 있어요. 잠시 후 컬렉션을 확인해주세요."
            : "이전 생성 요청이 실패했어요. 새로 다시 시도해주세요.",
      });
      return;
    }

    jobId = await createAiCharacterJob(supabase, {
      clientId,
      copy,
      fileName: body.fileName,
      mimeType: sourceImage.mimeType,
      sourceHash,
      userId: user.id,
    });

    const remainingAfterConsume = await consumeCredit(supabase, user.id);
    consumedCredit = true;

    const form = new FormData();
    form.append("model", process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL);
    form.append(
      "prompt",
      [
        "Transform the user's pet photo into one premium cute companion character for a Korean savings app.",
        "Use the photo only as identity reference: preserve species, main fur colors, distinctive markings, ear shape, tail feel, and gentle expression.",
        "Do not return, crop, paste, frame, or embed the original photograph.",
        "Make a polished soft 3D chibi app mascot, full body, front-facing, centered, with transparent background.",
        "The result should feel like a collectible mobile game character, not a realistic animal photo.",
        "No text, no logo, no frame, no room background, no furniture, no curtain, no human, no watermark.",
        "Leave generous safe padding around ears, tail, and feet for a 1024 square app asset.",
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
      throw new AiCharacterError(
        "openai_image_generation_failed",
        payload?.error?.message ?? "AI 캐릭터 생성에 실패했어요.",
        openAiResponse.status,
      );
    }

    const b64Json = payload?.data?.[0]?.b64_json;
    if (!b64Json) {
      throw new AiCharacterError("missing_generated_image", "생성된 이미지가 비어 있어요.", 502);
    }

    const imageUrl = await uploadGeneratedCharacter(supabase, {
      b64Json,
      jobId,
      userId: user.id,
    });

    await updateAiCharacterJob(supabase, jobId, {
      result_image_url: imageUrl,
      status: "succeeded",
    });

    response.status(200).json({
      imageUrl,
      jobId,
      name: copy.name,
      remainingCredits: remainingAfterConsume,
      trait: copy.trait,
      ...getPolicyPayload(),
    });
  } catch (error) {
    if (consumedCredit && supabase && user) {
      await refundCredit(supabase, user.id).catch((refundError) => {
        console.error("ai_character_credit_refund_failed", refundError);
      });
    }
    if (jobId && supabase) {
      await updateAiCharacterJob(supabase, jobId, {
        error_message: error instanceof Error ? error.message : "unknown_error",
        status: "failed",
      }).catch((jobError) => {
        console.error("ai_character_job_update_failed", jobError);
      });
    }

    const publicError = toPublicError(error);
    response.status(publicError.status).json({
      error: publicError.code,
      message: publicError.message,
      ...getPolicyPayload(),
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

function normalizeClientId(clientGenerationId) {
  const value = typeof clientGenerationId === "string" ? clientGenerationId.trim() : "";
  return value.slice(0, 80) || null;
}

function createCharacterCopy(fileName) {
  const lowerFileName = String(fileName).toLowerCase();
  if (["cat", "kitten", "nyang", "고양", "냥"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "몽글냥", trait: "사진 속 초롱한 눈빛과 부드러운 분위기를 담았어요" };
  }
  if (["rabbit", "bunny", "토끼", "깡총"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "방긋토끼", trait: "사진 속 말랑한 표정과 가벼운 발걸음을 담았어요" };
  }
  if (["dog", "puppy", "강아", "멍"].some((keyword) => lowerFileName.includes(keyword))) {
    return { name: "포근개", trait: "사진 속 다정한 표정과 따뜻한 눈빛을 담았어요" };
  }
  return { name: "몽글친구", trait: "사진 속 사랑스러운 분위기를 포근하게 담았어요" };
}

async function findExistingJob(supabase, userId, clientId) {
  const { data, error } = await supabase
    .from("ai_character_jobs")
    .select("id, status, result_image_url, input_metadata, error_message")
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createAiCharacterJob(supabase, { clientId, copy, fileName, mimeType, sourceHash, userId }) {
  const { data, error } = await supabase
    .from("ai_character_jobs")
    .insert({
      client_id: clientId,
      input_metadata: {
        clientGenerationId: clientId,
        copy,
        fileName: typeof fileName === "string" ? fileName.slice(0, 120) : "",
        mimeType,
        promptVersion: PROMPT_VERSION,
        sourceHash: sourceHash.slice(0, 16),
      },
      prompt_version: PROMPT_VERSION,
      source_photo_url: `inline:${sourceHash.slice(0, 16)}`,
      status: "processing",
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function updateAiCharacterJob(supabase, jobId, values) {
  const { error } = await supabase.from("ai_character_jobs").update(values).eq("id", jobId);
  if (error) throw error;
}

async function consumeCredit(supabase, userId) {
  const { data, error } = await supabase.rpc("consume_ai_character_credit", { target_user_id: userId });
  if (error) {
    throw new AiCharacterError(
      "no_ai_character_credit",
      "AI 생성권이 부족해요. 생성권을 구매한 뒤 다시 시도해주세요.",
      402,
    );
  }
  return Number(data ?? 0);
}

async function refundCredit(supabase, userId) {
  const { error } = await supabase.rpc("refund_ai_character_credit", { target_user_id: userId });
  if (error) throw error;
}

async function getRemainingCredits(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("ai_character_credits")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.ai_character_credits ?? 0);
}

async function uploadGeneratedCharacter(supabase, { b64Json, jobId, userId }) {
  const imageBuffer = Buffer.from(b64Json, "base64");
  const storagePath = `${userId}/${jobId}.png`;
  const { error } = await supabase.storage.from("pet-characters").upload(storagePath, imageBuffer, {
    cacheControl: "31536000",
    contentType: "image/png",
    upsert: true,
  });

  if (error) throw new AiCharacterError("image_storage_failed", "생성된 캐릭터 저장에 실패했어요.", 502);

  const { data } = supabase.storage.from("pet-characters").getPublicUrl(storagePath);
  if (!data?.publicUrl) throw new AiCharacterError("missing_public_image_url", "생성된 캐릭터 URL을 만들지 못했어요.", 502);

  return data.publicUrl;
}

class AiCharacterError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function toPublicError(error) {
  if (error instanceof AiCharacterError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof Error && error.message === "missing_authorization") {
    return {
      code: "missing_authorization",
      message: "AI 캐릭터 생성을 위해 로그인이 필요해요.",
      status: 401,
    };
  }

  if (error instanceof Error && error.message === "invalid_authorization") {
    return {
      code: "invalid_authorization",
      message: "로그인 세션이 만료됐어요. 다시 접속한 뒤 시도해주세요.",
      status: 401,
    };
  }

  console.error("ai_character_generation_failed", error);
  return {
    code: "invalid_ai_character_request",
    message: error instanceof Error ? error.message : "사진 정보를 읽지 못했어요.",
    status: 400,
  };
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Cache-Control", "no-store");
}
