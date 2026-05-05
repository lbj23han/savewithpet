import type { AppStats, Category, LedgerEntry } from "../types/app";
import { getCategoryLabel } from "./ledger";

export function createPetComment(
  stats: AppStats,
  entries: LedgerEntry[],
  categories: Category[],
  monthlyBudget: number,
): string {
  const expenses = entries.filter((e) => e.type === "expense");

  if (expenses.length === 0) {
    return "오늘 첫 기록을 남겨볼까요? 함께 시작해요!";
  }

  const spendingRate = stats.totalExpense / monthlyBudget;

  if (spendingRate >= 0.9) {
    return "이번 달 예산이 거의 다 찼어요. 남은 기간 조금만 더 아껴봐요!";
  }

  if (spendingRate >= 0.7) {
    return "예산을 70% 넘게 쓰셨어요. 슬슬 지출을 점검해볼 때예요 👀";
  }

  if (stats.streakDays >= 14) {
    return `${stats.streakDays}일 연속 기록 중! 정말 대단해요 🔥`;
  }

  if (stats.streakDays >= 7) {
    return `${stats.streakDays}일 연속 기록 중이에요. 이 기세로 쭉 가봐요!`;
  }

  if (stats.streakDays >= 3) {
    return `${stats.streakDays}일 연속으로 기록하고 있어요. 잘하고 있어요!`;
  }

  if (stats.totalSaving > 0) {
    return "저축도 함께 기록하다니, 아주 알뜰하네요 🌱";
  }

  const topCategoryId = getTopCategoryId(expenses);
  const topCount = topCategoryId ? getCount(expenses, topCategoryId) : 0;

  if (topCategoryId && topCount >= 3) {
    const label = getCategoryLabel(topCategoryId, categories);
    return `${label} 지출이 자주 보이네요. 한번 살펴볼까요?`;
  }

  const todayExpenses = expenses.filter((e) => e.date === getTodayDate());
  if (todayExpenses.length >= 3) {
    return "오늘 소비가 꽤 많았네요. 내일은 조금 아껴볼까요?";
  }

  const defaults = [
    "오늘도 꼼꼼하게 기록하고 있어요!",
    "소비를 기록하면 절약이 보여요 👀",
    "매일 조금씩, 나중에 크게 달라져요!",
    "오늘 마신 커피는 즐거웠나요? ☕",
    "작은 기록이 큰 절약을 만들어요!",
  ];

  return defaults[new Date().getDate() % defaults.length];
}

function getTopCategoryId(expenses: LedgerEntry[]): string | null {
  const counts = new Map<string, number>();
  expenses.forEach((e) => counts.set(e.categoryId, (counts.get(e.categoryId) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function getCount(expenses: LedgerEntry[], categoryId: string): number {
  return expenses.filter((e) => e.categoryId === categoryId).length;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
