import type { PetPreset, UserPet } from "../types/app";

const photoEmojis = ["🐶", "🐱", "🐰", "🐹"];

export function createPetFromPreset(preset: PetPreset): UserPet {
  return {
    id: preset.id,
    name: preset.name,
    trait: preset.trait,
    emoji: preset.emoji,
    source: "preset",
  };
}

export function createPetFromPhoto(file: File, imageUrl: string): UserPet {
  const emoji = photoEmojis[file.name.length % photoEmojis.length];

  return {
    id: `photo-${Date.now()}`,
    name: "사진 속 친구",
    trait: "사진을 바탕으로 만든 임시 캐릭터예요",
    emoji,
    imageUrl,
    source: "photo",
  };
}

export function createSkippedPet(): UserPet {
  return {
    id: "default-pet",
    name: "토토리",
    trait: "기록을 기다리는 기본 친구예요",
    emoji: "🐹",
    source: "skip",
  };
}
