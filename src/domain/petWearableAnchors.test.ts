import { describe, expect, it } from "vitest";

import { petPresets, shopItems } from "../mocks/appData";
import { STANDARD_WEARABLE_PROFILE, getItemAnchorTransform, getPetWearableAnchors } from "./petWearableAnchors";

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

  it("compensates wearable anchor positions without shrinking fitted item sizes", () => {
    const rabbitPreset = petPresets.find((pet) => pet.id === "kangchongmu");
    expect(rabbitPreset).toBeDefined();

    const anchors = getPetWearableAnchors(rabbitPreset!);

    expect(anchors.eyes.x).not.toBe(STANDARD_WEARABLE_PROFILE.eyes.x);
    expect(anchors.eyes.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.eyes.width);
    expect(anchors.head.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.head.width!);
    expect(anchors.chest.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.chest.width!);
  });

  it("enlarges fitted items for non-dog presets that still need visual compensation", () => {
    const compensatedPresetIds = ["ttoosseunyang", "kangchongmu"];

    compensatedPresetIds.forEach((petId) => {
      const preset = petPresets.find((pet) => pet.id === petId);
      expect(preset).toBeDefined();

      const anchors = getPetWearableAnchors(preset!);

      expect(anchors.eyes.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.eyes.width);
      expect(anchors.head.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.head.width!);
      expect(anchors.chest.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.chest.width!);
      expect(anchors.back.width).toBeGreaterThan(STANDARD_WEARABLE_PROFILE.back.width!);
    });
  });
});
