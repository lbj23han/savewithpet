import { ledgerCategories } from "../mocks/appData";
import type { Category, LedgerEntry } from "../types/app";
import { filterEntriesByPeriod, MONTHLY_BUDGET } from "./ledger";

const categoryColors = ["#C64C7B", "#7A5BA8", "#2B9A75", "#F28DB0", "#D6446F", "#678FD2", "#E6B247", "#8B8A86"];

export type AnalysisPeriod = "today" | "week" | "month" | "all";

export type CategoryAnalysis = {
  id: string;
  label: string;
  icon: string;
  amount: number;
  value: number;
  color: string;
};

export type AnalysisViewModel = {
  totalExpense: number;
  budget: number;
  achievementRate: number;
  topCategoryLabel: string;
  categories: CategoryAnalysis[];
  donutGradient: string;
  encouragement: string;
  period: AnalysisPeriod;
};

export function createAnalysisViewModel(
  entries: LedgerEntry[],
  period: AnalysisPeriod,
  categoriesInput: Category[] = ledgerCategories,
  budget: number = MONTHLY_BUDGET,
): AnalysisViewModel {
  const scopedEntries = filterEntriesByPeriod(entries, period);
  const expenses = scopedEntries.filter((entry) => entry.type === "expense");
  const totalExpense = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const categories = categoriesInput
    .map((category, index) => {
      const amount = expenses
        .filter((entry) => entry.categoryId === category.id)
        .reduce((sum, entry) => sum + entry.amount, 0);
      return {
        id: category.id,
        label: category.label,
        icon: category.icon,
        amount,
        value: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: categoryColors[index % categoryColors.length],
      };
    })
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const topCategoryLabel = categories[0]?.label ?? "없음";
  const donutGradient = buildDonutGradient(categories);

  const achievementRate = totalExpense > 0 ? Math.round((1 - totalExpense / budget) * 100) : 100;

  return {
    totalExpense,
    budget,
    achievementRate,
    topCategoryLabel,
    categories,
    donutGradient,
    encouragement: buildEncouragement(totalExpense, achievementRate, categories),
    period,
  };
}

function buildEncouragement(totalExpense: number, achievementRate: number, categories: CategoryAnalysis[]): string {
  if (totalExpense === 0) return "아직 기록이 없어요. 첫 소비를 기록해볼까요? 😊";
  if (achievementRate < 0) return `예산을 ${Math.abs(achievementRate)}% 초과했어요. 다음 기록부터 같이 조절해봐요.`;
  if (achievementRate >= 90) return "예산을 훌륭하게 지키고 있어요! 이 기세로 달려봐요 🏆";
  if (achievementRate >= 70) return "목표 달성이 눈앞이에요! 조금만 더 아껴봐요 💪";
  if (achievementRate >= 50) return "절반을 달성했어요. 남은 기간도 화이팅!";

  const topCategory = categories[0];
  if (topCategory && topCategory.value >= 40) {
    return `${topCategory.icon} ${topCategory.label} 지출이 많아요. 함께 점검해볼까요?`;
  }

  if (achievementRate > 0) return "지출이 늘고 있어요. 함께 돌아볼까요? 🌱";
  return "예산이 거의 다 찼어요. 다음 달엔 더 잘 할 수 있어요 💖";
}

function buildDonutGradient(categories: CategoryAnalysis[]): string {
  if (categories.length === 0) return "#EFE3D8 0 100%";

  let start = 0;
  return categories
    .map((category) => {
      const end = start + category.value;
      const stop = `${category.color} ${start}% ${Math.max(end, start + 1)}%`;
      start = end;
      return stop;
    })
    .join(", ");
}
