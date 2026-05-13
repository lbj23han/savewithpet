import type { PetExpression } from "../types/app";

export const BASE_CHARACTER_IDS = ["akkigae", "ttoosseunyang", "kangchongmu"] as const;

export const PET_EXPRESSIONS: PetExpression[] = ["neutral", "happy", "sad", "wink", "surprised", "sleepy"];

export function hasLayeredCharacterAssets(petId: string): boolean {
  return BASE_CHARACTER_IDS.some((id) => id === petId);
}

export function getBaseCharacterUrl(petId: string): string | null {
  if (!hasLayeredCharacterAssets(petId)) return null;

  return `/assets/pets/base-body/${petId}.png`;
}

export function getExpressionPartUrl(petId: string, expression: PetExpression): string | null {
  if (!hasLayeredCharacterAssets(petId)) return null;
  if (!PET_EXPRESSIONS.includes(expression)) return null;

  return `/assets/pet-parts/${petId}/${expression}.svg`;
}
