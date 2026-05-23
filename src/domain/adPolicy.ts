export type AdPlacementKind = "banner" | "reward";

export type AdPlacementConfig = {
  enabled: boolean;
  kind: AdPlacementKind;
  unitId?: string;
};

export const AD_REWARD_COINS = 30;

export function getAdPlacementConfig(kind: AdPlacementKind): AdPlacementConfig {
  const unitId =
    kind === "banner"
      ? import.meta.env.VITE_AD_BANNER_UNIT_ID
      : import.meta.env.VITE_AD_REWARD_UNIT_ID;

  return {
    enabled: Boolean(unitId),
    kind,
    unitId,
  };
}

export function getRewardAdUnavailableMessage(): string {
  return "리워드 광고는 광고 ID 발급 후 열릴 예정이에요";
}
