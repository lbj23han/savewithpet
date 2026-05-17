import { describe, expect, it } from "vitest";

import {
  BASE_CHARACTER_IDS,
  PET_EXPRESSIONS,
  STANDARD_PRESET_BASE_BODY_URL,
  getBaseCharacterUrl,
  getExpressionPartUrl,
  getGeneratedOverlayUrl,
  getPresetVisualLayers,
  hasLayeredCharacterAssets,
} from "./petCharacterSet";

describe("petCharacterSet", () => {
  it("defines the required preset character and expression coverage", () => {
    expect(BASE_CHARACTER_IDS).toEqual(["akkigae", "ttoosseunyang", "kangchongmu"]);
    expect(PET_EXPRESSIONS).toEqual(["neutral", "happy", "sad", "wink", "surprised", "sleepy"]);
  });

  it("returns fixed-frame base body paths for preset pets", () => {
    expect(getPresetVisualLayers("akkigae")).toEqual({
      baseBodyUrl: "/assets/pets/base-body-standard/akkigae.png",
    });
    expect(getPresetVisualLayers("unknown")).toBeUndefined();
  });

  it("falls back to preset base body paths when visual layers are absent", () => {
    expect(getBaseCharacterUrl({ id: "ttoosseunyang" })).toBe("/assets/pets/base-body-standard/ttoosseunyang.png");
    expect(getBaseCharacterUrl({ id: "custom", visualLayers: { baseBodyUrl: STANDARD_PRESET_BASE_BODY_URL } })).toBe(
      STANDARD_PRESET_BASE_BODY_URL,
    );
    expect(getBaseCharacterUrl({ id: "custom" })).toBeNull();
  });

  it("resolves expression assets only for layered presets", () => {
    expect(hasLayeredCharacterAssets("kangchongmu")).toBe(true);
    expect(hasLayeredCharacterAssets("custom")).toBe(false);
    expect(getExpressionPartUrl("kangchongmu", "sleepy")).toBe("/assets/pet-parts/kangchongmu/sleepy.svg");
    expect(getExpressionPartUrl("custom", "sleepy")).toBeNull();
  });

  it("keeps generated overlays optional and disabled by default", () => {
    expect(getGeneratedOverlayUrl({ visualLayers: { baseBodyUrl: STANDARD_PRESET_BASE_BODY_URL } })).toBeNull();
    expect(
      getGeneratedOverlayUrl({
        visualLayers: { baseBodyUrl: STANDARD_PRESET_BASE_BODY_URL, generatedOverlayUrl: "/assets/overlay.png" },
      }),
    ).toBe("/assets/overlay.png");
  });
});
