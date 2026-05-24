import type { ShopItem } from "../types/app";

export const INITIAL_INTIMACY = 50;
export const MIN_INTIMACY = 0;
export const MAX_INTIMACY = 100;
export const INTIMACY_DECAY_INTERVAL_HOURS = 48;

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

function clampIntimacy(value: number): number {
  if (!Number.isFinite(value)) return INITIAL_INTIMACY;
  return Math.min(MAX_INTIMACY, Math.max(MIN_INTIMACY, Math.round(value)));
}
