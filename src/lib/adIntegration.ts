import { AD_REWARD_COINS, getAdPlacementConfig, getRewardAdUnavailableMessage } from "../domain/adPolicy";

export type RewardAdResult =
  | { coins: number; status: "completed" }
  | { message: string; status: "unavailable" };

export function getBannerAdUnitId(): string | null {
  return getAdPlacementConfig("banner").unitId ?? null;
}

export async function showRewardAd(): Promise<RewardAdResult> {
  const config = getAdPlacementConfig("reward");

  if (!config.enabled) {
    return {
      message: getRewardAdUnavailableMessage(),
      status: "unavailable",
    };
  }

  return {
    message: "광고 SDK 연결 후 리워드를 지급할 수 있어요",
    status: "unavailable",
  };
}

export function getRewardAdCoinAmount(): number {
  return AD_REWARD_COINS;
}
