import type { ShopItem } from "../types/app";

export const INITIAL_INTIMACY = 50;
export const MIN_INTIMACY = 0;
export const MAX_INTIMACY = 100;
export const INTIMACY_DECAY_INTERVAL_HOURS = 48;
export const FREE_SNACK_DAILY_LIMIT = 2;
export const FREE_SNACK_COOLDOWN_HOURS = 12;

export type FreeSnackClaimState = {
  canClaim: boolean;
  claimedToday: number;
  nextClaimLabel: string;
};

export type FeedPetResult =
  | {
      nextIntimacy: number;
      nextInventory: Record<string, number>;
      nextLastFedAt: string;
      status: "fed";
    }
  | { message: string; status: "not_available" };

export function calculateEffectiveIntimacy(
  intimacy: number,
  lastFedAt: string | null,
  now: Date = new Date(),
): number {
  const safeIntimacy = clampIntimacy(intimacy);
  if (!lastFedAt) return safeIntimacy;

  const fedAt = new Date(lastFedAt);
  if (Number.isNaN(fedAt.getTime())) return safeIntimacy;

  const elapsedHours = Math.max(0, (now.getTime() - fedAt.getTime()) / (1000 * 60 * 60));
  const decay = Math.floor(elapsedHours / INTIMACY_DECAY_INTERVAL_HOURS);

  return clampIntimacy(safeIntimacy - decay);
}

export function feedPet({
  inventory,
  intimacy,
  lastFedAt,
  snack,
  now = new Date(),
}: {
  inventory: Record<string, number>;
  intimacy: number;
  lastFedAt: string | null;
  snack: ShopItem | undefined;
  now?: Date;
}): FeedPetResult {
  if (!snack || snack.itemType !== "snack") {
    return { message: "간식을 찾을 수 없어요", status: "not_available" };
  }

  const ownedCount = inventory[snack.id] ?? 0;
  if (ownedCount <= 0) {
    return { message: `${snack.name}을 먼저 구매해주세요`, status: "not_available" };
  }

  const nextInventory = { ...inventory, [snack.id]: ownedCount - 1 };
  if (nextInventory[snack.id] <= 0) delete nextInventory[snack.id];

  return {
    nextIntimacy: clampIntimacy(calculateEffectiveIntimacy(intimacy, lastFedAt, now) + (snack.intimacyBoost ?? 6)),
    nextInventory,
    nextLastFedAt: now.toISOString(),
    status: "fed",
  };
}

export function getSnackBoostLabel(snack: ShopItem): string {
  return `친밀도 +${snack.intimacyBoost ?? 6}`;
}

export function getFreeSnackClaimState(claimedAt: string[], now: Date = new Date()): FreeSnackClaimState {
  const todayClaims = getTodayFreeSnackClaims(claimedAt, now);
  const lastClaim = getLatestValidClaim(claimedAt);

  if (todayClaims.length >= FREE_SNACK_DAILY_LIMIT) {
    return {
      canClaim: false,
      claimedToday: todayClaims.length,
      nextClaimLabel: "오늘 무료 간식은 모두 받았어요",
    };
  }

  if (lastClaim) {
    const nextClaimAt = new Date(lastClaim.getTime() + FREE_SNACK_COOLDOWN_HOURS * 60 * 60 * 1000);
    if (now.getTime() < nextClaimAt.getTime()) {
      return {
        canClaim: false,
        claimedToday: todayClaims.length,
        nextClaimLabel: `${formatClaimTime(nextClaimAt)} 이후 받을 수 있어요`,
      };
    }
  }

  return {
    canClaim: true,
    claimedToday: todayClaims.length,
    nextClaimLabel: `무료 간식 ${FREE_SNACK_DAILY_LIMIT - todayClaims.length}회 남음`,
  };
}

export function createNextFreeSnackClaims(claimedAt: string[], now: Date = new Date()): string[] {
  return [...getRecentValidClaims(claimedAt, now).map((claim) => claim.toISOString()), now.toISOString()];
}

function clampIntimacy(value: number): number {
  if (!Number.isFinite(value)) return INITIAL_INTIMACY;
  return Math.min(MAX_INTIMACY, Math.max(MIN_INTIMACY, Math.round(value)));
}

function getTodayFreeSnackClaims(claimedAt: string[], now: Date): Date[] {
  const todayKey = getLocalDateKey(now);
  return getRecentValidClaims(claimedAt, now).filter((claim) => getLocalDateKey(claim) === todayKey);
}

function getRecentValidClaims(claimedAt: string[], now: Date): Date[] {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);

  return claimedAt
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= cutoff.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
}

function getLatestValidClaim(claimedAt: string[]): Date | null {
  const claims = claimedAt
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return claims[0] ?? null;
}

function getLocalDateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatClaimTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
