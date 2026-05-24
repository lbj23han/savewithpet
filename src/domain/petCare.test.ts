import { describe, expect, it } from "vitest";

import type { ShopItem } from "../types/app";
import { calculateEffectiveIntimacy, feedPet } from "./petCare";

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
});
