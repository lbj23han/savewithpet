import type { PetPreset, UserPet } from "../types/app";
import {
  STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL,
  STANDARD_CHARACTER_TEMPLATE_ID,
  STANDARD_WEARABLE_PROFILE,
} from "./petWearableAnchors";

const defaultPet = {
  emoji: "🐶",
  imageUrl: "/assets/pets/akkigae.svg",
  name: "아끼개",
  species: "dog" as const,
  trait: "예산을 지키며 차근차근 아끼는 절약 친구예요",
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
    wearableAnchors: preset.wearableAnchors ?? STANDARD_WEARABLE_PROFILE,
  };
}

export function createPetFromPhoto(file: File, imageUrl: string): UserPet {
  const emoji = photoEmojis[file.name.length % photoEmojis.length];

  return {
    id: `photo-${Date.now()}`,
    name: "사진 속 친구",
    trait: "사진 특징을 standard-v1 템플릿에 반영할 캐릭터예요",
    emoji,
    imageUrl: STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL,
    species: "custom",
    source: "photo",
    sourcePhotoUrl: imageUrl,
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    wearableAnchors: STANDARD_WEARABLE_PROFILE,
  };
}

export function createSkippedPet(): UserPet {
  return {
    id: "default-akkigae",
    ...defaultPet,
    source: "skip",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    wearableAnchors: STANDARD_WEARABLE_PROFILE,
  };
}
