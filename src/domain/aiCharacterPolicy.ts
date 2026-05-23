export const AI_CHARACTER_GENERATION_PRICE_KRW = 100;
export const AI_CHARACTER_GENERATION_ENABLED = false;

export const AI_CHARACTER_PROMPT_VERSION = "single-png-v1";

export const AI_CHARACTER_OUTPUT_CONTRACT = {
  background: "transparent",
  format: "png",
  maxOutputCount: 1,
  style: "soft 3D cute app character",
} as const;

export function getAiCharacterDisabledMessage(): string {
  return `AI 캐릭터 생성은 결제/사진 검수 연결 후 ${AI_CHARACTER_GENERATION_PRICE_KRW.toLocaleString("ko-KR")}원 상품으로 열릴 예정이에요`;
}
