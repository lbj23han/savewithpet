import type { LedgerEntryDraft, RewardEvent } from "../types/app";

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
