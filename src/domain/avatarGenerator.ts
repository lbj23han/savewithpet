import type { PetPreset, UserPet } from "../types/app";
import { STANDARD_CHARACTER_TEMPLATE_ID, getPresetVisualLayers } from "./petCharacterSet";

const defaultPet = {
  emoji: "🐶",
  imageUrl: "/assets/pets/akkigae.png?v=2",
  name: "아끼개",
  species: "dog" as const,
  trait: "예산을 지키며 차근차근 아끼는 절약 친구예요",
  visualLayers: getPresetVisualLayers("akkigae"),
};

const photoEmojis = ["🐶", "🐱", "🐰", "🐹"];

export function createPetFromPreset(preset: PetPreset): UserPet {
  return {
    id: preset.id,
    name: preset.name,
    trait: preset.trait,
    emoji: preset.emoji,
    imageUrl: preset.imageUrl,
    species: preset.species,
    source: "preset",
    templateId: preset.templateId ?? STANDARD_CHARACTER_TEMPLATE_ID,
    visualLayers: preset.visualLayers ?? getPresetVisualLayers(preset.id),
  };
}

export function createPetFromPhoto(file: File, imageUrl: string): UserPet {
  const emoji = photoEmojis[file.name.length % photoEmojis.length];

  return {
    id: `photo-${Date.now()}`,
    name: "사진 속 친구",
    trait: "사진 특징을 고퀄 PNG 캐릭터로 반영할 친구예요",
    emoji,
    imageUrl,
    species: "custom",
    source: "photo",
    sourcePhotoUrl: imageUrl,
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
  };
}

export function createSkippedPet(): UserPet {
  return {
    id: "default-akkigae",
    ...defaultPet,
    source: "skip",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
  };
}
