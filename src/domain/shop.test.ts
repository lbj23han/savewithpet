import { describe, expect, it } from "vitest";

import type { ShopItemViewModel } from "../types/app";
import { PREMIUM_BOX_PRICE, openPremiumBox } from "./shop";

const items: ShopItemViewModel[] = [
  { id: "hat", name: "모자", icon: "🎩", price: 300, state: "owned", canBuy: false },
  { id: "scarf", name: "목도리", icon: "🧣", price: 450, state: "available", canBuy: true },
];

describe("shop domain", () => {
  it("returns not enough coins result when coins are below premium price", () => {
    expect(openPremiumBox(items, PREMIUM_BOX_PRICE - 1).outcome).toBe("not_enough_coins");
  });

  it("keeps premium box unavailable until limited items are added", () => {
    const result = openPremiumBox(items, PREMIUM_BOX_PRICE);

    expect(result.outcome).toBe("unavailable");
    expect(result.itemId).toBeNull();
    expect(result.coinsSpent).toBe(0);
  });
});
