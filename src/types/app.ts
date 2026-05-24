import type { LucideIcon } from "lucide-react";

export type AppPage = "onboarding" | "home" | "ledger" | "analysis" | "shop" | "settings";

export type NavItem = {
  page: Exclude<AppPage, "onboarding">;
  label: string;
  Icon: LucideIcon;
};

export type PetSpecies = "dog" | "cat" | "rabbit" | "custom";

export type PetPreset = {
  id: string;
  name: string;
  trait: string;
  emoji: string;
  imageUrl: string;
  species: Exclude<PetSpecies, "custom">;
  featured?: boolean;
  templateId?: CharacterTemplateId;
  visualLayers?: PetVisualLayers;
};

export type CharacterTemplateId = "single-png-v1";

export type PetVisualLayers = {
  baseBodyUrl: string;
  generatedOverlayUrl?: string;
};

export type UserPet = {
  id: string;
  name: string;
  trait: string;
  emoji: string;
  imageUrl?: string;
  species: PetSpecies;
  source: "preset" | "photo" | "skip";
  sourcePhotoUrl?: string;
  templateId?: CharacterTemplateId;
  visualLayers?: PetVisualLayers;
};

export type PetAnimation = "idle" | "pop" | "shake" | "sparkle";

export type PetExpression = "neutral" | "happy" | "sad" | "wink" | "surprised" | "sleepy";

export type PetStatus = {
  label: string;
  value: number;
  tone: "orange" | "purple" | "green";
};

export type SummaryMetric = {
  label: string;
  value: string;
  tone: "red" | "green" | "purple";
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  selected?: boolean;
};

export type LedgerEntry = {
  id: string;
  categoryId: string;
  amount: number;
  memo: string;
  date: string;
  type: LedgerEntryType;
};

export type LedgerEntryType = "expense" | "saving" | "income";

export type LedgerEntryDraft = {
  amount: number;
  categoryId: string;
  date: string;
  memo: string;
  type: LedgerEntryType;
};

export type ShopItemType = "wardrobe" | "snack";

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  itemType?: ShopItemType;
  price: number;
  requiredLevel?: number;
  intimacyBoost?: number;
  unlockLabel?: string;
};

export type ShopItemState = "owned" | "available" | "locked" | "equipped";

export type ShopItemViewModel = ShopItem & {
  state: ShopItemState;
  canBuy: boolean;
};

export type PremiumBoxResult = {
  itemId: string | null;
  label: string;
  coinsSpent: number;
  outcome: "item" | "coins" | "sold_out" | "not_enough_coins" | "unavailable";
};

export type AppStats = {
  totalExpense: number;
  totalSaving: number;
  streakDays: number;
  level: number;
  growth: number;
  mood: number;
  fullness: number;
};

export type RewardEvent = {
  id: string;
  label: string;
  coins: number;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  caption: string;
  equippedItemId: string | null;
  petEmoji: string;
  petImageUrl?: string;
  petName: string;
  likes: number;
  comments: CommunityComment[];
  createdAt: string;
};

export type PersistedAppState = {
  categories: Category[];
  categoryBudgets: Record<string, number>;
  communityPosts: CommunityPost[];
  aiCharacterCredits: number;
  coins: number;
  entries: LedgerEntry[];
  equippedItemId: string | null;
  freeSnackClaimedAt: string[];
  hasCompletedOnboarding: boolean;
  intimacy: number;
  lastFedAt: string | null;
  monthlyBudget: number;
  ownedCustomPets: UserPet[];
  ownedItemIds: string[];
  ownedPetIds: string[];
  pet: UserPet;
  petLevels: Record<string, number>;
  rewardEvents: RewardEvent[];
  snackInventory: Record<string, number>;
};
