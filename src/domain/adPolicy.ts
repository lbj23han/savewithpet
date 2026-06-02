export type AdPlacementKind = "banner" | "reward";

export type AdPlacementConfig = {
  enabled: boolean;
  kind: AdPlacementKind;
  unitId?: string;
};

export const AD_BANNER_UNIT_ID = "ait.v2.live.40145900ff404573";
export const AD_REWARD_UNIT_ID = "ait.v2.live.cf2b6c321a3f4d33";
export const AD_REWARD_COINS = 100;
export const AD_REWARD_DAILY_LIMIT = 5;
export const AD_REWARD_COOLDOWN_MINUTES = 30;

export function getAdPlacementConfig(kind: AdPlacementKind): AdPlacementConfig {
  const unitId =
    kind === "banner"
      ? import.meta.env.VITE_AD_BANNER_UNIT_ID || AD_BANNER_UNIT_ID
      : import.meta.env.VITE_AD_REWARD_UNIT_ID || AD_REWARD_UNIT_ID;

  return {
    enabled: Boolean(unitId),
    kind,
    unitId,
  };
}

export function getRewardAdUnavailableMessage(): string {
  return "리워드 광고는 광고 ID 발급 후 열릴 예정이에요";
}
