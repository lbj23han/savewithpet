import { AD_REWARD_COINS, getAdPlacementConfig, getRewardAdUnavailableMessage } from "../domain/adPolicy";

export type RewardAdResult =
  | { coins: number; status: "completed" }
  | { message: string; status: "cancelled" | "unavailable" };

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
  const adGroupId = config.unitId;
  if (!adGroupId) {
    return {
      message: getRewardAdUnavailableMessage(),
      status: "unavailable",
    };
  }

  try {
    const { GoogleAdMob } = await import("@apps-in-toss/web-framework");
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported() || !GoogleAdMob.showAppsInTossAdMob.isSupported()) {
      return {
        message: "리워드 광고는 토스앱에서 사용할 수 있어요",
        status: "unavailable",
      };
    }

    await loadRewardAd(adGroupId);
    const earnedReward = await showLoadedRewardAd(adGroupId);
    if (!earnedReward) {
      return {
        message: "광고를 끝까지 본 뒤에만 코인을 받을 수 있어요",
        status: "cancelled",
      };
    }

    return {
      coins: AD_REWARD_COINS,
      status: "completed",
    };
  } catch (error) {
    console.info("reward_ad_unavailable", error);
    return {
      message: "광고를 불러오지 못했어요. 잠시 후 다시 시도해주세요",
      status: "unavailable",
    };
  }
}

export function getRewardAdCoinAmount(): number {
  return AD_REWARD_COINS;
}

async function loadRewardAd(adGroupId: string): Promise<void> {
  const { GoogleAdMob } = await import("@apps-in-toss/web-framework");

  return new Promise((resolve, reject) => {
    let cleanup = () => {};

    cleanup = GoogleAdMob.loadAppsInTossAdMob({
      onError: (error) => {
        cleanup();
        reject(error);
      },
      onEvent: (event) => {
        if (event.type !== "loaded") return;
        cleanup();
        resolve();
      },
      options: { adGroupId },
    });
  });
}

async function showLoadedRewardAd(adGroupId: string): Promise<boolean> {
  const { GoogleAdMob } = await import("@apps-in-toss/web-framework");

  return new Promise((resolve, reject) => {
    let cleanup = () => {};
    let earnedReward = false;

    cleanup = GoogleAdMob.showAppsInTossAdMob({
      onError: (error) => {
        cleanup();
        reject(error);
      },
      onEvent: (event) => {
        if (event.type === "userEarnedReward") {
          earnedReward = true;
          return;
        }

        if (event.type === "dismissed" || event.type === "failedToShow") {
          cleanup();
          resolve(earnedReward);
        }
      },
      options: { adGroupId },
    });
  });
}
