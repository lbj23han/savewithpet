import type { PetPreset, UserPet } from "../types/app";
import { STANDARD_CHARACTER_TEMPLATE_ID, STANDARD_PRESET_CHARACTER_URL, getPresetVisualLayers } from "./petCharacterSet";

const defaultPet = {
  emoji: "🐶",
  imageUrl: "/assets/pets/akkigae.png?v=2",
  name: "아끼개",
  species: "dog" as const,
  trait: "예산을 지키며 차근차근 아끼는 절약 친구예요",
  visualLayers: getPresetVisualLayers("akkigae"),
};

const photoCharacterProfiles = [
  {
    keywords: ["cat", "kitten", "neko", "nyang", "고양", "냥"],
    name: "몽글냥",
    presetId: "ttoosseunyang",
    trait: "사진 속 또렷한 눈빛을 귀여운 친구로 옮겼어요",
  },
  {
    keywords: ["rabbit", "bunny", "tokki", "토끼", "깡총"],
    name: "방긋토끼",
    presetId: "kangchongmu",
    trait: "사진 속 말랑한 분위기를 깡총한 캐릭터로 담은 친구예요",
  },
  {
    keywords: ["dog", "puppy", "pupp", "강아", "개", "멍"],
    name: "포근개",
    presetId: "akkigae",
    trait: "사진 속 다정한 표정을 포근하게 담은 친구예요",
  },
] as const;

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

export function createPetFromPhoto(
  file: File,
  sourcePhotoUrl: string,
  generated?: { imageUrl?: string; name?: string; trait?: string },
): UserPet {
  const profile = getPhotoCharacterProfile(file.name);
  const visualLayers = getPresetVisualLayers(profile.presetId) ?? { baseBodyUrl: STANDARD_PRESET_CHARACTER_URL };

  return {
    id: `photo-${Date.now()}`,
    name: sanitizePetName(generated?.name) || profile.name,
    trait: sanitizePetTrait(generated?.trait) || profile.trait,
    emoji: profile.presetId === "ttoosseunyang" ? "🐱" : profile.presetId === "kangchongmu" ? "🐰" : "🐶",
    imageUrl: generated?.imageUrl || visualLayers.baseBodyUrl,
    species: "custom",
    source: "photo",
    sourcePhotoUrl,
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    visualLayers,
  };
}

function sanitizePetName(name: string | undefined): string {
  return name?.replace(/\bPNG\b/gi, "").trim().slice(0, 12) ?? "";
}

function sanitizePetTrait(trait: string | undefined): string {
  return trait?.replace(/\bPNG\b/gi, "").replace(/\s+/g, " ").trim().slice(0, 60) ?? "";
}

function getPhotoCharacterProfile(fileName: string): (typeof photoCharacterProfiles)[number] {
  const lowerFileName = fileName.toLowerCase();
  return (
    photoCharacterProfiles.find((profile) => profile.keywords.some((keyword) => lowerFileName.includes(keyword))) ??
    photoCharacterProfiles[fileName.length % photoCharacterProfiles.length]
  );
}

export function createSkippedPet(): UserPet {
  return {
    id: "default-akkigae",
    ...defaultPet,
    source: "skip",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
  };
}
