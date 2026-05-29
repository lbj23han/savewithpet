import { getApiUrl } from "./apiBase";
import { getSupabaseAccessToken } from "./supabase";

export type AiCharacterGenerationResult = {
  imageUrl: string;
  jobId?: string;
  name: string;
  remainingCredits?: number;
  trait: string;
};

export async function generateAiCharacter({
  fileName,
  imageDataUrl,
  mimeType,
}: {
  clientGenerationId?: string;
  fileName: string;
  imageDataUrl: string;
  mimeType: string;
}): Promise<AiCharacterGenerationResult> {
  const clientGenerationId = createClientGenerationId();
  const accessToken = await getSupabaseAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/ai-character"), {
      body: JSON.stringify({ clientGenerationId, fileName, imageDataUrl, mimeType }),
      headers,
      method: "POST",
    });
  } catch {
    throw new Error("AI 생성 서버에 연결하지 못했어요. 배포 URL 또는 API 설정을 확인해주세요.");
  }

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? "ai_character_generation_failed");

  return {
    imageUrl: payload.imageUrl,
    jobId: payload.jobId,
    name: payload.name,
    remainingCredits: typeof payload.remainingCredits === "number" ? payload.remainingCredits : undefined,
    trait: payload.trait,
  };
}

function createClientGenerationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
