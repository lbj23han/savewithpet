import type { PremiumBoxResult, ShopItem, ShopItemViewModel } from "../types/app";

export const PREMIUM_BOX_PRICE = 10_000;
const PREMIUM_BOX_LIMITED_SALES_ENABLED = false;

export function createShopItemViewModels({
  items,
  coins,
  level,
  ownedItemIds,
  equippedItemId,
}: {
  items: ShopItem[];
  coins: number;
  level: number;
  ownedItemIds: string[];
  equippedItemId: string | null;
}): ShopItemViewModel[] {
  return items.map((item) => {
    const isOwned = ownedItemIds.includes(item.id);
    const isLocked = item.requiredLevel !== undefined && level < item.requiredLevel;
    const canBuy = !isOwned && !isLocked && coins >= item.price;

    return {
      ...item,
      state: equippedItemId === item.id ? "equipped" : isOwned ? "owned" : isLocked ? "locked" : "available",
      canBuy,
    };
  });
}

export function openPremiumBox(items: ShopItemViewModel[], coins: number): PremiumBoxResult {
  if (coins < PREMIUM_BOX_PRICE) {
    return {
      itemId: null,
      label: "코인이 부족해요",
      coinsSpent: 0,
      outcome: "not_enough_coins",
    };
  }

  if (!PREMIUM_BOX_LIMITED_SALES_ENABLED) {
    return {
      itemId: null,
      label: "기간 한정 판매 상품 준비 중이에요",
      coinsSpent: 0,
      outcome: "unavailable",
    };
  }

  const availableItems = items.filter((item) => item.state === "available");
  if (availableItems.length === 0) {
    return {
      itemId: null,
      label: "모든 아이템을 보유 중이에요",
      coinsSpent: 0,
      outcome: "sold_out",
    };
  }

  const sorted = [...availableItems].sort((a, b) => {
    const aScore = (a.requiredLevel ?? 0) * 1000 + a.price;
    const bScore = (b.requiredLevel ?? 0) * 1000 + b.price;
    return bScore - aScore;
  });
  const reward = sorted[0];

  return {
    itemId: reward.id,
    label: `${reward.name} 획득!`,
    coinsSpent: PREMIUM_BOX_PRICE,
    outcome: "item",
  };
}
