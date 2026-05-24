import { STANDARD_CHARACTER_TEMPLATE_ID, getPresetVisualLayers } from "../domain/petCharacterSet";
import type { Category, PetPreset, ShopItem } from "../types/app";

export const petPresets: PetPreset[] = [
  {
    id: "akkigae",
    name: "아끼개",
    trait: "예산을 지키며 차근차근 아끼는 절약 친구예요",
    emoji: "🐶",
    imageUrl: "/assets/pets/akkigae.png?v=2",
    species: "dog",
    featured: true,
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    visualLayers: getPresetVisualLayers("akkigae"),
  },
  {
    id: "ttoosseunyang",
    name: "또쓰냥",
    trait: "또 쓰려는 순간을 잡아주는 지출 감시자예요",
    emoji: "🐱",
    imageUrl: "/assets/pets/ttoosseunyang.png?v=2",
    species: "cat",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    visualLayers: getPresetVisualLayers("ttoosseunyang"),
  },
  {
    id: "kangchongmu",
    name: "깡총무",
    trait: "총무처럼 깡총깡총 예산을 챙겨주는 기록 친구예요",
    emoji: "🐰",
    imageUrl: "/assets/pets/kangchongmu.png?v=1",
    species: "rabbit",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    visualLayers: getPresetVisualLayers("kangchongmu"),
  },
];

export const ledgerCategories: Category[] = [
  { id: "food", label: "식비", icon: "🍽️", selected: true },
  { id: "cafe", label: "카페", icon: "☕" },
  { id: "transport", label: "교통", icon: "🚌" },
  { id: "shopping", label: "쇼핑", icon: "🛒" },
  { id: "mart", label: "마트", icon: "🛍️" },
  { id: "home", label: "주거", icon: "🏠" },
  { id: "utility", label: "공과금", icon: "💡" },
  { id: "medical", label: "의료", icon: "💊" },
  { id: "insurance", label: "보험", icon: "🛡️" },
  { id: "education", label: "교육", icon: "📚" },
  { id: "culture", label: "문화", icon: "🎬" },
  { id: "beauty", label: "뷰티", icon: "💅" },
  { id: "subscription", label: "구독", icon: "📱" },
  { id: "drink", label: "술", icon: "🍺" },
  { id: "gift", label: "선물", icon: "🎁" },
  { id: "pet", label: "반려동물", icon: "🐾" },
  { id: "saving", label: "저축", icon: "🌱" },
  { id: "income", label: "수입", icon: "💰" },
  { id: "etc", label: "기타", icon: "🧾" },
];

export const shopItems: ShopItem[] = [
  { id: "canola-garden", name: "유채꽃 정원", icon: "canola-garden", itemType: "wardrobe", price: 1200 },
  { id: "cozy-cushion", name: "포근 방석", icon: "cushion", itemType: "wardrobe", price: 450 },
  { id: "heart-aura", name: "하트 오라", icon: "heart-aura", itemType: "wardrobe", price: 600 },
  {
    id: "coin-shower",
    name: "코인 링",
    icon: "coin-shower",
    itemType: "wardrobe",
    price: 1600,
    requiredLevel: 12,
    unlockLabel: "Lv.12 해금",
  },
  { id: "sparkle-sticker", name: "반짝 스티커", icon: "sparkle-sticker", itemType: "wardrobe", price: 300 },
  { id: "saving-sprout", name: "저축 새싹", icon: "saving-sprout", itemType: "wardrobe", price: 900 },
  { id: "carrot-snack", name: "아삭 당근", icon: "carrot-snack", itemType: "snack", price: 80, intimacyBoost: 6 },
  { id: "churu-snack", name: "말랑 츄르", icon: "churu-snack", itemType: "snack", price: 120, intimacyBoost: 9 },
  { id: "bone-snack", name: "튼튼 뼈다귀", icon: "bone-snack", itemType: "snack", price: 100, intimacyBoost: 8 },
];

export const initialCategoryBudgets: Record<string, number> = {
  food: 350_000,
  cafe: 120_000,
  transport: 120_000,
  shopping: 250_000,
  mart: 250_000,
  home: 500_000,
};
