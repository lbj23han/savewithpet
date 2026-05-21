export type PetItemLayer = "backdrop" | "foreground";

export function getPetItemLayer(itemId: string): PetItemLayer {
  if (itemId === "heart-aura" || itemId === "coin-shower" || itemId === "sparkle-sticker") return "foreground";
  return "backdrop";
}

export function isBackPetItem(itemId: string): boolean {
  return getPetItemLayer(itemId) === "backdrop";
}
