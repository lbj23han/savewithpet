import { STANDARD_CHARACTER_TEMPLATE_ID, STANDARD_WEARABLE_PROFILE } from "../domain/petWearableAnchors";
import type { Category, PetPreset, ShopItem } from "../types/app";

export const petPresets: PetPreset[] = [
  {
    id: "akkigae",
    name: "아끼개",
    trait: "예산을 지키며 차근차근 아끼는 절약 친구예요",
    emoji: "🐶",
    imageUrl: "/assets/pets/akkigae.svg",
    species: "dog",
    featured: true,
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    wearableAnchors: STANDARD_WEARABLE_PROFILE,
  },
  {
    id: "ttoosseunyang",
    name: "또쓰냥",
    trait: "또 쓰려는 순간을 귀엽게 잡아주는 지출 감시자예요",
    emoji: "🐱",
    imageUrl: "/assets/pets/ttoosseunyang.svg",
    species: "cat",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    wearableAnchors: STANDARD_WEARABLE_PROFILE,
  },
  {
    id: "kangchongmu",
    name: "깡총무",
    trait: "총무처럼 깡총깡총 예산을 챙겨주는 기록 친구예요",
    emoji: "🐰",
    imageUrl: "/assets/pets/kangchongmu.svg",
    species: "rabbit",
    templateId: STANDARD_CHARACTER_TEMPLATE_ID,
    wearableAnchors: STANDARD_WEARABLE_PROFILE,
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
  { id: "hat", name: "신사 모자", icon: "hat", price: 800 },
  { id: "scarf", name: "미니 하트 펜던트", icon: "pendant", price: 450 },
  { id: "crown", name: "황금 왕관", icon: "crown", price: 2500, requiredLevel: 12, unlockLabel: "Lv.12 해금" },
  { id: "sunglasses", name: "선글라스", icon: "sunglasses", price: 600, requiredLevel: 5, unlockLabel: "Lv.5 해금" },
  { id: "ribbon", name: "핑크 리본", icon: "ribbon", price: 300 },
  { id: "wings", name: "저축 날개", icon: "wings", price: 1200 },
];

export const initialCategoryBudgets: Record<string, number> = {
  food: 350_000,
  cafe: 120_000,
  transport: 120_000,
  shopping: 250_000,
  mart: 250_000,
  home: 500_000,
};
