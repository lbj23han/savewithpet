import { ledgerCategories } from "../mocks/appData";
import type { AppStats, Category, LedgerEntry, LedgerEntryDraft } from "../types/app";

export const MONTHLY_BUDGET = 1_500_000;

export function formatWon(value: number): string {
  return value.toLocaleString("ko-KR");
}

export function createLedgerEntryId(): string {
  return `entry-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function createLedgerEntry(draft: LedgerEntryDraft): LedgerEntry {
  return {
    id: createLedgerEntryId(),
    ...draft,
  };
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calculateAppStats(entries: LedgerEntry[], budget: number = MONTHLY_BUDGET): AppStats {
  const totalExpense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const totalSaving = entries
    .filter((entry) => entry.type === "saving" || entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const streakDays = countStreakDays(entries);
  const budgetUsage = Math.min(totalExpense / budget, 1);
  const level = Math.max(1, Math.floor(entries.length / 2) + 1);
  const growth = Math.min(100, 18 + entries.length * 9 + Math.floor(totalSaving / 2000));
  const mood = clamp(88 - Math.floor(budgetUsage * 42) + Math.min(streakDays * 3, 12));
  const fullness = clamp(62 + Math.min(entries.length * 4, 24) - Math.floor(budgetUsage * 18));

  return { totalExpense, totalSaving, streakDays, level, growth, mood, fullness };
}

export function getCurrentMonthLabel(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
}

export function getCurrentMonthPeriodLabel(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return `${year}.${month}.01 - ${year}.${month}.${lastDay}`;
}

export function getCategoryLabel(categoryId: string, categories: Category[] = ledgerCategories): string {
  return categories.find((category) => category.id === categoryId)?.label ?? "기타";
}

export function getCategoryIcon(categoryId: string, categories: Category[] = ledgerCategories): string {
  return categories.find((category) => category.id === categoryId)?.icon ?? "🧾";
}

export function getRelativeDate(offsetDays: number): string {
  const date = new Date(getTodayDate());
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function formatShortDate(dateValue: string): string {
  const date = new Date(dateValue);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function createCustomCategory({ icon, label }: { icon: string; label: string }): Category {
  const normalizedLabel = label.trim().slice(0, 12) || "새 카테고리";
  return {
    id: `custom-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    icon: icon.trim().slice(0, 4) || "⭐",
    isCustom: true,
    label: normalizedLabel,
  };
}

export function filterEntriesByPeriod(entries: LedgerEntry[], period: "today" | "week" | "month" | "all"): LedgerEntry[] {
  if (period === "all") return entries;

  const today = new Date(getTodayDate());
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (period === "today") return diffDays === 0;
    if (period === "week") return diffDays >= 0 && diffDays < 7;
    return entry.date.slice(0, 7) === getTodayDate().slice(0, 7);
  });
}

function countStreakDays(entries: LedgerEntry[]): number {
  const expenseDates = new Set(entries.filter((entry) => entry.type === "expense").map((entry) => entry.date));
  const cursor = new Date(getTodayDate());
  let streak = 0;

  while (expenseDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return Math.max(streak, entries.length > 0 ? 1 : 0);
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}
