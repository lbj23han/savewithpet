export const AI_CHARACTER_GENERATION_PRICE_KRW = 550;
export const AI_CHARACTER_GENERATION_COUNT = 2;
export const AI_CHARACTER_PACK_PRICE_KRW = 1_100;
export const AI_CHARACTER_PACK_GENERATION_COUNT = 5;
export const AI_CHARACTER_MAX_OWNED_COUNT = 5;
export const AI_CHARACTER_GENERATION_ENABLED = false;

export const AI_CHARACTER_PROMPT_VERSION = "single-png-v1";

export const AI_CHARACTER_OUTPUT_CONTRACT = {
  background: "transparent",
  format: "png",
  maxOutputCount: 1,
  style: "soft 3D cute app character",
} as const;

export function getAiCharacterDisabledMessage(): string {
  return `AI 캐릭터 생성은 결제/사진 검수 연결 후 ${AI_CHARACTER_GENERATION_COUNT}회 ${AI_CHARACTER_GENERATION_PRICE_KRW.toLocaleString("ko-KR")}원 상품으로 열릴 예정이에요`;
}

export function getAiCharacterLimitMessage(): string {
  return `AI 캐릭터는 최대 ${AI_CHARACTER_MAX_OWNED_COUNT}개까지 보유할 수 있어요. 새로 만들려면 캐릭터 컬렉션에서 하나를 삭제해주세요`;
}

export function getAiCharacterNoEditMessage(): string {
  return "AI 캐릭터는 생성 후 수정할 수 없어요.";
}
