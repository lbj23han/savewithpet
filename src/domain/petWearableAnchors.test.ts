import { describe, expect, it } from "vitest";

import { petPresets, shopItems } from "../mocks/appData";
import { getItemAnchorTransform, getPetWearableAnchors } from "./petWearableAnchors";

describe("petWearableAnchors", () => {
  it("provides a wearable profile for every preset pet", () => {
    petPresets.forEach((pet) => {
      const anchors = getPetWearableAnchors(pet);

      expect(anchors.eyes.left).toBeDefined();
      expect(anchors.eyes.right).toBeDefined();
      expect(anchors.head.width).toBeGreaterThan(0);
      expect(anchors.chest.width).toBeGreaterThan(0);
      expect(anchors.back.width).toBeGreaterThan(0);
    });
  });

  it("generates a stage transform for every shop item on every preset pet", () => {
    petPresets.forEach((pet) => {
      const anchors = getPetWearableAnchors(pet);

      shopItems.forEach((item) => {
        const transform = getItemAnchorTransform({ anchors, itemId: item.id, variant: "stage" });

        expect(transform).toContain("translate(");
        expect(transform).toContain("scale(");
      });
    });
  });

  it("does not apply custom placement transforms to non-stage previews", () => {
    const anchors = getPetWearableAnchors(petPresets[0]);

    expect(getItemAnchorTransform({ anchors, itemId: "sunglasses", variant: "preview" })).toBeUndefined();
  });
});
