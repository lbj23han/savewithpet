import type { Category, PetPreset, PetStatus, ShopItem, SummaryMetric } from "../types/app";

export const petPresets: PetPreset[] = [
  { id: "squirrel", name: "부지런한 다람이", trait: "작은 절약을 좋아해요", emoji: "🐿️" },
  { id: "owl", name: "현명한 올빼미", trait: "예산을 차분히 지켜봐요", emoji: "🦉", featured: true },
  { id: "cat", name: "꼼꼼한 냥이", trait: "영수증을 놓치지 않아요", emoji: "🐱" },
];

export const petStatuses: PetStatus[] = [
  { label: "포만도", value: 85, tone: "orange" },
  { label: "기분", value: 60, tone: "purple" },
  { label: "성장", value: 42, tone: "green" },
];

export const todaySummary: SummaryMetric[] = [
  { label: "지출", value: "12,400", tone: "red" },
  { label: "저축", value: "5,000", tone: "green" },
  { label: "연속기록", value: "7일", tone: "purple" },
];

export const ledgerCategories: Category[] = [
  { id: "food", label: "식비", icon: "🍽️", selected: true },
  { id: "cafe", label: "카페", icon: "☕" },
  { id: "transport", label: "교통", icon: "🚌" },
  { id: "shopping", label: "쇼핑", icon: "🛒" },
  { id: "medical", label: "의료", icon: "💊" },
  { id: "subscription", label: "구독", icon: "📱" },
  { id: "drink", label: "술", icon: "🍺" },
  { id: "add", label: "추가", icon: "➕" },
];

export const analysisCategories = [
  { label: "식비", value: 40, color: "#A43E12" },
  { label: "쇼핑", value: 25, color: "#704AA7" },
  { label: "카페", value: 20, color: "#0C8054" },
  { label: "교통", value: 15, color: "#FF8556" },
];

export const goalProgress = [
  { label: "생활비 절약", value: 92, color: "#5BC08D" },
  { label: "취미 활동", value: 45, color: "#B995EF" },
  { label: "자기 개발", value: 78, color: "#FF8556" },
];

export const shopItems: ShopItem[] = [
  { id: "hat", name: "신사 모자", icon: "🎩", price: 800, state: "owned" },
  { id: "scarf", name: "빨간 목도리", icon: "🧣", price: 450, state: "available" },
  { id: "crown", name: "황금 왕관", icon: "👑", price: 2500, state: "locked" },
  { id: "sunglasses", name: "선글라스", icon: "🕶️", price: 600, state: "locked", unlockLabel: "Lv.5 해금" },
  { id: "ribbon", name: "핑크 리본", icon: "🎀", price: 300, state: "available" },
  { id: "bag", name: "모험가 배낭", icon: "🎒", price: 1200, state: "owned" },
];
