import type { PetExpression, UserPet } from "../types/app";

export const STANDARD_CHARACTER_TEMPLATE_ID = "single-png-v1" as const;
export const BASE_CHARACTER_IDS = ["akkigae", "ttoosseunyang", "kangchongmu"] as const;

export const PET_EXPRESSIONS: PetExpression[] = ["neutral", "happy", "sad", "wink", "surprised", "sleepy"];

export const STANDARD_PRESET_CHARACTER_URL = "/assets/pets/akkigae.png?v=2";

export function getPresetVisualLayers(petId: string): UserPet["visualLayers"] | undefined {
  if (!hasLayeredCharacterAssets(petId)) return undefined;

  return {
    baseBodyUrl: `/assets/pets/${petId}.png?v=2`,
  };
}

export function hasLayeredCharacterAssets(petId: string): boolean {
  return BASE_CHARACTER_IDS.some((id) => id === petId);
}

export function getBaseCharacterUrl(pet: Pick<UserPet, "id" | "visualLayers">): string | null {
  if (pet.visualLayers?.baseBodyUrl) return pet.visualLayers.baseBodyUrl;

  const petId = pet.id;
  if (!hasLayeredCharacterAssets(petId)) return null;

  return `/assets/pets/${petId}.png?v=2`;
}

export function getGeneratedOverlayUrl(pet: Pick<UserPet, "visualLayers">): string | null {
  return pet.visualLayers?.generatedOverlayUrl ?? null;
}

export function getExpressionPartUrl(petId: string, expression: PetExpression): string | null {
  if (!hasLayeredCharacterAssets(petId)) return null;
  if (!PET_EXPRESSIONS.includes(expression)) return null;

  return `/assets/pet-parts/${petId}/${expression}.svg`;
}
