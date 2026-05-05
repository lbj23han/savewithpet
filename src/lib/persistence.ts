import { initialLedgerEntries, ledgerCategories, petPresets } from "../mocks/appData";
import type { PersistedAppState } from "../types/app";

const STORAGE_KEY = "nyangbi-hajimalgae:v1";

export const defaultAppState: PersistedAppState = {
  categories: ledgerCategories,
  coins: 2840,
  entries: initialLedgerEntries,
  equippedItemId: "hat",
  hasCompletedOnboarding: false,
  monthlyBudget: 1_500_000,
  ownedItemIds: ["hat", "bag"],
  pet: {
    id: petPresets[1].id,
    name: petPresets[1].name,
    trait: petPresets[1].trait,
    emoji: petPresets[1].emoji,
    source: "preset",
  },
  rewardEvents: [],
};

export function loadAppState(): PersistedAppState {
  if (typeof window === "undefined") return defaultAppState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppState;

    return {
      ...defaultAppState,
      ...JSON.parse(raw),
      categories: mergeCategories(JSON.parse(raw).categories),
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
