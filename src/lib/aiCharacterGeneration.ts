import { getApiUrl } from "./apiBase";

export type AiCharacterGenerationResult = {
  imageUrl: string;
  name: string;
  trait: string;
};

export async function generateAiCharacter({
  fileName,
  imageDataUrl,
  mimeType,
}: {
  fileName: string;
  imageDataUrl: string;
  mimeType: string;
}): Promise<AiCharacterGenerationResult> {
  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/ai-character"), {
      body: JSON.stringify({ fileName, imageDataUrl, mimeType }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new Error("AI 생성 서버에 연결하지 못했어요. 배포 URL 또는 API 설정을 확인해주세요.");
  }

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? "ai_character_generation_failed");

  return {
    imageUrl: payload.imageUrl,
    name: payload.name,
    trait: payload.trait,
  };
}
