import { afterEach, describe, expect, it, vi } from "vitest";

import { petPresets } from "../mocks/appData";
import { createPetFromPhoto, createPetFromPreset, createSkippedPet } from "./avatarGenerator";
import { STANDARD_CHARACTER_TEMPLATE_ID, getPresetVisualLayers } from "./petCharacterSet";

describe("avatarGenerator", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates preset pets with a single PNG character asset", () => {
    const preset = petPresets[1];
    const pet = createPetFromPreset(preset);

    expect(pet.source).toBe("preset");
    expect(pet.templateId).toBe(STANDARD_CHARACTER_TEMPLATE_ID);
    expect(pet.visualLayers).toEqual(getPresetVisualLayers(preset.id));
  });

  it("keeps uploaded photos as the current single PNG source", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T09:00:00+09:00"));
    const file = new File(["photo"], "my-pet.png", { type: "image/png" });
    const pet = createPetFromPhoto(file, "blob:local-photo");

    expect(pet.id).toBe("photo-1778976000000");
    expect(pet.source).toBe("photo");
    expect(pet.sourcePhotoUrl).toBe("blob:local-photo");
    expect(pet.imageUrl).toBe("blob:local-photo");
    expect(pet.templateId).toBe(STANDARD_CHARACTER_TEMPLATE_ID);
    expect(pet.visualLayers).toBeUndefined();
  });

  it("creates skipped pets with the default standard-v1 preset", () => {
    const pet = createSkippedPet();

    expect(pet.source).toBe("skip");
    expect(pet.templateId).toBe(STANDARD_CHARACTER_TEMPLATE_ID);
    expect(pet.visualLayers).toEqual(getPresetVisualLayers("akkigae"));
  });
});
