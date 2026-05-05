import type { Category, LedgerEntry, PetPreset, PetStatus, ShopItem, SummaryMetric } from "../types/app";

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
  { id: "hat", name: "신사 모자", icon: "🎩", price: 800 },
  { id: "scarf", name: "빨간 목도리", icon: "🧣", price: 450 },
  { id: "crown", name: "황금 왕관", icon: "👑", price: 2500, requiredLevel: 12, unlockLabel: "Lv.12 해금" },
  { id: "sunglasses", name: "선글라스", icon: "🕶️", price: 600, requiredLevel: 5, unlockLabel: "Lv.5 해금" },
  { id: "ribbon", name: "핑크 리본", icon: "🎀", price: 300 },
  { id: "bag", name: "모험가 배낭", icon: "🎒", price: 1200 },
];

export const initialLedgerEntries: LedgerEntry[] = [
  { id: "entry-1", categoryId: "food", amount: 12400, memo: "점심", date: "2026-05-04", type: "expense" },
  { id: "entry-2", categoryId: "cafe", amount: 5200, memo: "아메리카노", date: "2026-05-04", type: "expense" },
  { id: "entry-3", categoryId: "transport", amount: 1450, memo: "지하철", date: "2026-05-03", type: "expense" },
  { id: "entry-4", categoryId: "shopping", amount: 28000, memo: "생활용품", date: "2026-05-02", type: "expense" },
  { id: "entry-5", categoryId: "food", amount: 16900, memo: "저녁", date: "2026-05-01", type: "expense" },
  { id: "entry-6", categoryId: "saving", amount: 5000, memo: "절약 보상", date: "2026-05-04", type: "saving" },
  { id: "entry-7", categoryId: "income", amount: 32000, memo: "용돈", date: "2026-05-03", type: "income" },
];
