import {
  initialCategoryBudgets,
  ledgerCategories,
  petPresets,
  shopItems,
} from "../mocks/appData";
import { INITIAL_INTIMACY } from "../domain/petCare";
import { STANDARD_CHARACTER_TEMPLATE_ID, getPresetVisualLayers } from "../domain/petCharacterSet";
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
  };
}

export const defaultAppState: PersistedAppState = {
  aiCharacterCredits: 0,
  categories: ledgerCategories,
  categoryBudgets: initialCategoryBudgets,
  communityPosts: [],
  coins: 0,
  entries: [],
  equippedItemId: null,
  freeSnackClaimedAt: [],
  hasCompletedOnboarding: false,
  intimacy: INITIAL_INTIMACY,
  lastFedAt: new Date().toISOString(),
  monthlyBudget: 1_500_000,
  ownedCustomPets: [],
  ownedItemIds: [],
  ownedPetIds: [],
  pet: createDefaultPet(),
  petLevels: {},
  rewardEvents: [],
  snackInventory: {},
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
      aiCharacterCredits: normalizePositiveInteger(parsed.aiCharacterCredits),
      communityPosts: normalizeCommunityPosts(parsed.communityPosts),
      equippedItemId: normalizeEquippedItemId(parsed.equippedItemId),
      freeSnackClaimedAt: normalizeDateList(parsed.freeSnackClaimedAt),
      intimacy: normalizeIntimacy(parsed.intimacy),
      lastFedAt: normalizeLastFedAt(parsed.lastFedAt),
      ownedCustomPets: normalizeOwnedCustomPets(parsed.ownedCustomPets, parsed.pet),
      ownedItemIds: normalizeOwnedItemIds(parsed.ownedItemIds),
      pet: normalizePet(parsed.pet),
      ownedPetIds: normalizeOwnedPetIds(parsed.ownedPetIds, parsed.pet),
      petLevels: normalizePetLevels(parsed.petLevels),
      snackInventory: normalizeSnackInventory(parsed.snackInventory),
    };
  } catch {
    return defaultAppState;
  }
}

function normalizePositiveInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function normalizeDateList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string => typeof item === "string" && !Number.isNaN(new Date(item).getTime()),
  );
}

function normalizeEquippedItemId(itemId: unknown): PersistedAppState["equippedItemId"] {
  if (typeof itemId !== "string") return null;

  return shopItems.some((item) => item.id === itemId && item.itemType !== "snack") ? itemId : null;
}

function normalizeOwnedItemIds(itemIds: unknown): PersistedAppState["ownedItemIds"] {
  if (!Array.isArray(itemIds)) return [];

  const validIds = new Set(shopItems.filter((item) => item.itemType !== "snack").map((item) => item.id));
  return itemIds.filter((itemId): itemId is string => typeof itemId === "string" && validIds.has(itemId));
}

function normalizeSnackInventory(inventory: unknown): PersistedAppState["snackInventory"] {
  if (!inventory || typeof inventory !== "object") return {};

  const snackIds = new Set(shopItems.filter((item) => item.itemType === "snack").map((item) => item.id));
  return Object.fromEntries(
    Object.entries(inventory)
      .filter(([itemId, count]) => snackIds.has(itemId) && typeof count === "number" && count > 0)
      .map(([itemId, count]) => [itemId, Math.floor(count as number)]),
  );
}

function normalizeIntimacy(intimacy: unknown): number {
  if (typeof intimacy !== "number" || !Number.isFinite(intimacy)) return INITIAL_INTIMACY;
  return Math.max(0, Math.min(100, Math.round(intimacy)));
}

function normalizeLastFedAt(lastFedAt: unknown): string | null {
  if (typeof lastFedAt !== "string") return defaultAppState.lastFedAt;

  return Number.isNaN(new Date(lastFedAt).getTime()) ? defaultAppState.lastFedAt : lastFedAt;
}

function normalizePetLevels(petLevels: unknown): PersistedAppState["petLevels"] {
  if (!petLevels || typeof petLevels !== "object") return {};
  return Object.fromEntries(
    Object.entries(petLevels)
      .filter(([, v]) => typeof v === "number" && Number.isFinite(v) && v >= 1)
      .map(([k, v]) => [k, Math.floor(v as number)]),
  );
}

function normalizeOwnedPetIds(petIds: unknown, pet: unknown): PersistedAppState["ownedPetIds"] {
  const validIds = new Set(petPresets.map((preset) => preset.id));
  const owned = new Set<string>();

  if (Array.isArray(petIds)) {
    petIds.forEach((petId) => {
      if (typeof petId === "string" && validIds.has(petId)) owned.add(petId);
    });
  }

  if (pet && typeof pet === "object" && "id" in pet && typeof pet.id === "string" && validIds.has(pet.id)) {
    owned.add(pet.id);
  }

  return Array.from(owned);
}

function normalizeOwnedCustomPets(pets: unknown, activePet: unknown): PersistedAppState["ownedCustomPets"] {
  const byId = new Map<string, UserPet>();

  if (Array.isArray(pets)) {
    pets.forEach((pet) => {
      const normalized = normalizePet(pet);
      if (normalized.source === "photo") byId.set(normalized.id, normalized);
    });
  }

  const normalizedActivePet = normalizePet(activePet);
  if (normalizedActivePet.source === "photo") byId.set(normalizedActivePet.id, normalizedActivePet);

  return Array.from(byId.values());
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
    };
  }

  if ("source" in pet && pet.source === "photo") {
    const photoPet = pet as UserPet;

    return {
      ...createDefaultPet(),
      ...photoPet,
      imageUrl: photoPet.imageUrl ?? photoPet.sourcePhotoUrl,
      species: "custom",
      source: "photo",
      sourcePhotoUrl: photoPet.sourcePhotoUrl ?? photoPet.imageUrl,
      templateId: photoPet.templateId ?? STANDARD_CHARACTER_TEMPLATE_ID,
      visualLayers: photoPet.visualLayers,
    };
  }

  return createDefaultPet();
}
