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
  wearableAnchors?: PetWearableAnchors;
};

export type CharacterTemplateId = "standard-v1";

export type PetVisualLayers = {
  baseBodyUrl: string;
  generatedOverlayUrl?: string;
};

export type PetWearableAnchor = {
  scale?: number;
  width?: number;
  x: number;
  y: number;
};

export type PetEyesAnchor = {
  scale?: number;
  width: number;
  x: number;
  y: number;
  left?: { x: number; y: number };
  right?: { x: number; y: number };
};

export type PetWearableAnchors = {
  back: PetWearableAnchor;
  chest: PetWearableAnchor;
  eyes: PetEyesAnchor;
  head: PetWearableAnchor;
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
  wearableAnchors?: PetWearableAnchors;
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

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number;
  requiredLevel?: number;
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
  outcome: "item" | "coins" | "sold_out" | "not_enough_coins";
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
  coins: number;
  entries: LedgerEntry[];
  equippedItemId: string | null;
  hasCompletedOnboarding: boolean;
  monthlyBudget: number;
  ownedItemIds: string[];
  pet: UserPet;
  rewardEvents: RewardEvent[];
};
