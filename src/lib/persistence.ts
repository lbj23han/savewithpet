import {
  initialCategoryBudgets,
  ledgerCategories,
  petPresets,
  shopItems,
} from "../mocks/appData";
import { STANDARD_PRESET_BASE_BODY_URL, getPresetVisualLayers } from "../domain/petCharacterSet";
import {
  STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL,
  STANDARD_CHARACTER_TEMPLATE_ID,
  STANDARD_WEARABLE_PROFILE,
} from "../domain/petWearableAnchors";
import type { PersistedAppState, UserPet } from "../types/app";

const STORAGE_KEY = "nyangbi-hajimalgae:v2";

function createDefaultPet(): UserPet {
  const preset = petPresets[0];

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
    wearableAnchors: preset.wearableAnchors ?? STANDARD_WEARABLE_PROFILE,
  };
}

export const defaultAppState: PersistedAppState = {
  categories: ledgerCategories,
  categoryBudgets: initialCategoryBudgets,
  communityPosts: [],
  coins: 0,
  entries: [],
  equippedItemId: null,
  hasCompletedOnboarding: false,
  monthlyBudget: 1_500_000,
  ownedItemIds: [],
  pet: createDefaultPet(),
  rewardEvents: [],
};

export function loadAppState(): PersistedAppState {
  if (typeof window === "undefined") return defaultAppState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppState;

    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;

    return {
      ...defaultAppState,
      ...parsed,
      categories: mergeCategories(parsed.categories),
      categoryBudgets: { ...initialCategoryBudgets, ...parsed.categoryBudgets },
      communityPosts: normalizeCommunityPosts(parsed.communityPosts),
      equippedItemId: normalizeEquippedItemId(parsed.equippedItemId),
      ownedItemIds: normalizeOwnedItemIds(parsed.ownedItemIds),
      pet: normalizePet(parsed.pet),
    };
  } catch {
    return defaultAppState;
  }
}

function normalizeEquippedItemId(itemId: unknown): PersistedAppState["equippedItemId"] {
  if (typeof itemId !== "string") return null;

  return shopItems.some((item) => item.id === itemId) ? itemId : null;
}

function normalizeOwnedItemIds(itemIds: unknown): PersistedAppState["ownedItemIds"] {
  if (!Array.isArray(itemIds)) return [];

  const validIds = new Set(shopItems.map((item) => item.id));
  return itemIds.filter((itemId): itemId is string => typeof itemId === "string" && validIds.has(itemId));
}

export function saveAppState(state: PersistedAppState): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeCategories(categories: unknown): typeof ledgerCategories {
  if (!Array.isArray(categories)) return ledgerCategories;

  const byId = new Map(ledgerCategories.map((category) => [category.id, category]));
  categories.forEach((category) => {
    if (category && typeof category === "object" && "id" in category && typeof category.id === "string") {
      byId.set(category.id, category as (typeof ledgerCategories)[number]);
    }
  });

  return Array.from(byId.values());
}

function normalizeCommunityPosts(posts: unknown): PersistedAppState["communityPosts"] {
  if (!Array.isArray(posts)) return [];

  return posts
    .filter((post): post is PersistedAppState["communityPosts"][number] =>
      Boolean(post && typeof post === "object" && "id" in post && typeof post.id === "string"),
    )
    .sort((a, b) => b.likes - a.likes);
}

function normalizePet(pet: unknown): UserPet {
  if (!pet || typeof pet !== "object") return createDefaultPet();
  if (!("id" in pet) || typeof pet.id !== "string") return createDefaultPet();

  const preset = petPresets.find((item) => item.id === pet.id);
  if (preset) {
    const persistedName = "name" in pet && typeof pet.name === "string" ? pet.name.trim().slice(0, 12) : "";

    return {
      id: preset.id,
      name: persistedName || preset.name,
      trait: preset.trait,
      emoji: preset.emoji,
      imageUrl: preset.imageUrl,
      species: preset.species,
      source: "preset",
      templateId: preset.templateId ?? STANDARD_CHARACTER_TEMPLATE_ID,
      visualLayers: preset.visualLayers ?? getPresetVisualLayers(preset.id),
      wearableAnchors: preset.wearableAnchors ?? STANDARD_WEARABLE_PROFILE,
    };
  }

  if ("source" in pet && pet.source === "photo") {
    const photoPet = pet as UserPet;

    return {
      ...createDefaultPet(),
      ...photoPet,
      imageUrl: getTemplateCharacterImageUrl(photoPet),
      species: "custom",
      source: "photo",
      sourcePhotoUrl: photoPet.sourcePhotoUrl ?? photoPet.imageUrl,
      templateId: photoPet.templateId ?? STANDARD_CHARACTER_TEMPLATE_ID,
      visualLayers: normalizeVisualLayers(photoPet),
      wearableAnchors: photoPet.wearableAnchors ?? STANDARD_WEARABLE_PROFILE,
    };
  }

  return createDefaultPet();
}

function getTemplateCharacterImageUrl(pet: UserPet): string {
  if (!pet.sourcePhotoUrl && pet.imageUrl?.startsWith("data:")) return STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL;
  if (pet.sourcePhotoUrl && pet.imageUrl === pet.sourcePhotoUrl) return STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL;

  return pet.imageUrl ?? STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL;
}

function normalizeVisualLayers(pet: UserPet): UserPet["visualLayers"] {
  return {
    baseBodyUrl: pet.visualLayers?.baseBodyUrl ?? STANDARD_PRESET_BASE_BODY_URL,
    generatedOverlayUrl: pet.visualLayers?.generatedOverlayUrl,
  };
}
