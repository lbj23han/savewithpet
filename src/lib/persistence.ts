import {
  initialCategoryBudgets,
  initialCommunityPosts,
  initialLedgerEntries,
  ledgerCategories,
  petPresets,
} from "../mocks/appData";
import type { PersistedAppState, UserPet } from "../types/app";

const STORAGE_KEY = "nyangbi-hajimalgae:v1";

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
  };
}

export const defaultAppState: PersistedAppState = {
  categories: ledgerCategories,
  categoryBudgets: initialCategoryBudgets,
  communityPosts: initialCommunityPosts,
  coins: 2840,
  entries: initialLedgerEntries,
  equippedItemId: "hat",
  hasCompletedOnboarding: false,
  monthlyBudget: 1_500_000,
  ownedItemIds: ["hat", "bag"],
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
      communityPosts: mergeCommunityPosts(parsed.communityPosts),
      pet: normalizePet(parsed.pet),
    };
  } catch {
    return defaultAppState;
  }
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

function mergeCommunityPosts(posts: unknown): PersistedAppState["communityPosts"] {
  if (!Array.isArray(posts)) return initialCommunityPosts;

  const byId = new Map(initialCommunityPosts.map((post) => [post.id, post]));
  posts.forEach((post) => {
    if (post && typeof post === "object" && "id" in post && typeof post.id === "string") {
      byId.set(post.id, post as PersistedAppState["communityPosts"][number]);
    }
  });

  return Array.from(byId.values()).sort((a, b) => b.likes - a.likes);
}

function normalizePet(pet: unknown): UserPet {
  if (!pet || typeof pet !== "object") return createDefaultPet();
  if (!("id" in pet) || typeof pet.id !== "string") return createDefaultPet();

  const preset = petPresets.find((item) => item.id === pet.id);
  if (preset) {
    return {
      id: preset.id,
      name: preset.name,
      trait: preset.trait,
      emoji: preset.emoji,
      imageUrl: preset.imageUrl,
      species: preset.species,
      source: "preset",
    };
  }

  if ("source" in pet && pet.source === "photo") {
    return {
      ...createDefaultPet(),
      ...(pet as UserPet),
      species: "custom",
      source: "photo",
    };
  }

  return createDefaultPet();
}
