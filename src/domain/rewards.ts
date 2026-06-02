import type { LedgerEntryDraft, RewardEvent } from "../types/app";
import { AD_REWARD_COINS, AD_REWARD_COOLDOWN_MINUTES, AD_REWARD_DAILY_LIMIT } from "./adPolicy";

export const ATTENDANCE_REWARD_COINS = 20;
export const ATTENDANCE_REWARD_LABEL = "출석 보상";
export const REWARD_AD_LABEL = "영상 광고 보상";

function getRewardDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getLocalRewardDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createEntryReward(entry: LedgerEntryDraft, streakDays: number): RewardEvent {
  const baseCoins = entry.type === "expense" ? Math.max(10, Math.floor(entry.amount / 1000)) : entry.type === "saving" ? 35 : 15;
  const streakBonus = streakDays >= 7 ? 30 : streakDays >= 3 ? 15 : 0;

  return {
    id: `reward-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    label: entry.type === "saving" ? "저축 기록 보상" : entry.type === "income" ? "수입 기록 보상" : "소비 기록 보상",
    coins: baseCoins + streakBonus,
    createdAt: new Date().toISOString(),
  };
}

export function createAttendanceReward(date = new Date()): RewardEvent {
  const dateKey = getRewardDateKey(date);

  return {
    id: `attendance-${dateKey}-${Date.now()}`,
    label: ATTENDANCE_REWARD_LABEL,
    coins: ATTENDANCE_REWARD_COINS,
    createdAt: date.toISOString(),
  };
}

export function createRewardAdReward(date = new Date()): RewardEvent {
  return {
    id: `reward-ad-${date.getTime()}-${Math.round(Math.random() * 1000)}`,
    label: REWARD_AD_LABEL,
    coins: AD_REWARD_COINS,
    createdAt: date.toISOString(),
  };
}

export function hasClaimedAttendanceReward(rewardEvents: RewardEvent[], date = new Date()): boolean {
  const dateKey = getRewardDateKey(date);

  return rewardEvents.some(
    (reward) => reward.label === ATTENDANCE_REWARD_LABEL && reward.createdAt.slice(0, 10) === dateKey,
  );
}

export type RewardAdClaimState = {
  canClaim: boolean;
  claimedToday: number;
  message: string;
  nextClaimAt: string | null;
  remainingToday: number;
};

export function getRewardAdClaimState(rewardEvents: RewardEvent[], date = new Date()): RewardAdClaimState {
  const todayKey = getLocalRewardDateKey(date);
  const todayRewards = rewardEvents
    .filter((reward) => reward.label === REWARD_AD_LABEL)
    .filter((reward) => {
      const createdAt = new Date(reward.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      return getLocalRewardDateKey(createdAt) === todayKey;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const claimedToday = todayRewards.length;
  const remainingToday = Math.max(0, AD_REWARD_DAILY_LIMIT - claimedToday);

  if (remainingToday <= 0) {
    return {
      canClaim: false,
      claimedToday,
      message: "오늘 영상 보상은 모두 받았어요",
      nextClaimAt: null,
      remainingToday,
    };
  }

  const lastReward = todayRewards[0];
  const lastRewardAt = lastReward ? new Date(lastReward.createdAt) : null;
  if (lastRewardAt && !Number.isNaN(lastRewardAt.getTime())) {
    const nextClaimAt = new Date(lastRewardAt.getTime() + AD_REWARD_COOLDOWN_MINUTES * 60 * 1000);
    if (date.getTime() < nextClaimAt.getTime()) {
      return {
        canClaim: false,
        claimedToday,
        message: `다음 영상 보상까지 ${formatRemainingMinutes(nextClaimAt, date)} 남았어요`,
        nextClaimAt: nextClaimAt.toISOString(),
        remainingToday,
      };
    }
  }

  return {
    canClaim: true,
    claimedToday,
    message: `오늘 ${remainingToday}회 더 받을 수 있어요`,
    nextClaimAt: null,
    remainingToday,
  };
}

function formatRemainingMinutes(nextClaimAt: Date, date: Date): string {
  const remainingMs = Math.max(0, nextClaimAt.getTime() - date.getTime());
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return `${remainingMinutes}분`;
}
