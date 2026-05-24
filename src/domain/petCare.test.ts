import { describe, expect, it } from "vitest";

import type { ShopItem } from "../types/app";
import {
  FREE_SNACK_COOLDOWN_HOURS,
  FREE_SNACK_DAILY_LIMIT,
  calculateEffectiveIntimacy,
  createNextFreeSnackClaims,
  feedPet,
  getFreeSnackClaimState,
} from "./petCare";

const carrot: ShopItem = {
  id: "carrot-snack",
  name: "아삭 당근",
  icon: "carrot-snack",
  itemType: "snack",
  price: 80,
  intimacyBoost: 6,
};

describe("pet care domain", () => {
  it("decays intimacy very slowly after feeding time passes", () => {
    expect(
      calculateEffectiveIntimacy(50, "2026-05-20T00:00:00.000Z", new Date("2026-05-24T01:00:00.000Z")),
    ).toBe(48);
  });

  it("feeds a snack and consumes one inventory count", () => {
    const result = feedPet({
      inventory: { "carrot-snack": 2 },
      intimacy: 50,
      lastFedAt: "2026-05-23T00:00:00.000Z",
      now: new Date("2026-05-23T01:00:00.000Z"),
      snack: carrot,
    });

    expect(result.status).toBe("fed");
    if (result.status === "fed") {
      expect(result.nextIntimacy).toBe(56);
      expect(result.nextInventory["carrot-snack"]).toBe(1);
    }
  });

  it("allows two free snack claims per day with a 12 hour cooldown", () => {
    const first = new Date("2026-05-24T09:00:00+09:00");
    const firstClaims = createNextFreeSnackClaims([], first);
    expect(firstClaims).toHaveLength(1);

    expect(getFreeSnackClaimState(firstClaims, new Date("2026-05-24T10:00:00+09:00"))).toMatchObject({
      canClaim: false,
      claimedToday: 1,
    });

    const second = new Date(first.getTime() + FREE_SNACK_COOLDOWN_HOURS * 60 * 60 * 1000);
    expect(getFreeSnackClaimState(firstClaims, second).canClaim).toBe(true);

    const secondClaims = createNextFreeSnackClaims(firstClaims, second);
    expect(getFreeSnackClaimState(secondClaims, new Date("2026-05-24T22:00:00+09:00"))).toMatchObject({
      canClaim: false,
      claimedToday: FREE_SNACK_DAILY_LIMIT,
    });
  });
});
