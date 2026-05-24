import type { LedgerEntryDraft, RewardEvent } from "../types/app";

export const ATTENDANCE_REWARD_COINS = 20;
export const ATTENDANCE_REWARD_LABEL = "출석 보상";

function getRewardDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
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

export function hasClaimedAttendanceReward(rewardEvents: RewardEvent[], date = new Date()): boolean {
  const dateKey = getRewardDateKey(date);

  return rewardEvents.some(
    (reward) => reward.label === ATTENDANCE_REWARD_LABEL && reward.createdAt.slice(0, 10) === dateKey,
  );
}
