import type { ShopItem, ShopItemViewModel } from "../types/app";

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
