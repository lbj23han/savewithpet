import { CheckCircle2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import {
  createCustomCategory,
  formatShortDate,
  formatWon,
  getCategoryIcon,
  getCategoryLabel,
  getCurrentMonthLabel,
  getRelativeDate,
  getTodayDate,
} from "../domain/ledger";
import type { Category, LedgerEntry, LedgerEntryDraft, LedgerEntryType } from "../types/app";

type LedgerPageProps = {
  budget: number;
  categories: Category[];
  categoryBudgets: Record<string, number>;
  entries: LedgerEntry[];
  onAddEntry: (entry: LedgerEntryDraft) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdateCategory: (categoryId: string, category: Pick<Category, "icon" | "label">) => void;
  onUpdateCategoryBudget: (categoryId: string, budget: number) => void;
  onUpdateBudget: (budget: number) => void;
  onUpdateEntry: (entryId: string, entry: LedgerEntryDraft) => void;
};

const entryTypes: Array<{ label: string; value: LedgerEntryType }> = [
  { label: "지출", value: "expense" },
  { label: "저축", value: "saving" },
  { label: "수입", value: "income" },
];

const quickDates = [
  { label: "오늘", value: getRelativeDate(0) },
  { label: "어제", value: getRelativeDate(-1) },
  { label: "그제", value: getRelativeDate(-2) },
  { label: formatShortDate(getRelativeDate(-3)), value: getRelativeDate(-3) },
  { label: formatShortDate(getRelativeDate(-4)), value: getRelativeDate(-4) },
];

const MONTHLY_BUDGET_MIN = 10_000;
const MONTHLY_BUDGET_MAX = 5_000_000;
const MONTHLY_BUDGET_STEP = 10_000;
type CategoryBudgetMode = "auto" | "manual" | "unset";

export function LedgerPage({
  budget,
  categories,
  categoryBudgets,
  entries,
  onAddCategory,
  onAddEntry,
  onDeleteCategory,
  onDeleteEntry,
  onUpdateCategory,
  onUpdateCategoryBudget,
  onUpdateBudget,
  onUpdateEntry,
}: LedgerPageProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("food");
  const [amount, setAmount] = useState("12500");
  const [budgetDraft, setBudgetDraft] = useState(String(budget));
  const [budgetMode, setBudgetMode] = useState<CategoryBudgetMode>("manual");
  const [categoryBudgetDrafts, setCategoryBudgetDrafts] = useState<Record<string, string>>({});
  const [categoryDraftIcon, setCategoryDraftIcon] = useState("⭐");
  const [categoryDraftLabel, setCategoryDraftLabel] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<LedgerEntryType>("expense");
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [isBudgetEditorOpen, setIsBudgetEditorOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const totalExpense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const currentMonthLabel = getCurrentMonthLabel();
  const numericAmount = Number(amount);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const selectedCategoryExpense = entries
    .filter((entry) => entry.type === "expense" && entry.categoryId === selectedCategoryId)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const selectedCategoryBudget = categoryBudgets[selectedCategoryId] ?? 0;
  const remainingBudget = Math.max(budget - totalExpense - (numericAmount || 0), 0);
  const budgetableCategories = categories.filter((category) => category.id !== "income" && category.id !== "saving");

  const submitEntry = () => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    const draft = {
      amount: numericAmount,
      categoryId: selectedCategoryId,
      date,
      memo: memo.trim() || selectedCategory?.label || "기록",
      type: entryType,
    };

    if (editingEntryId) {
      onUpdateEntry(editingEntryId, draft);
    } else {
      onAddEntry(draft);
    }

    resetForm();
  };

  const startEditing = (entry: LedgerEntry) => {
    setAmount(String(entry.amount));
    setDate(entry.date);
    setEditingEntryId(entry.id);
    setEntryType(entry.type);
    setMemo(entry.memo);
    setSelectedCategoryId(entry.categoryId);
  };

  const startCategoryEditing = (category: Category) => {
    setCategoryDraftIcon(category.icon);
    setCategoryDraftLabel(category.label);
    setEditingCategoryId(category.id);
  };

  const saveCategory = () => {
    const label = categoryDraftLabel.trim();
    if (!label) return;

    if (editingCategoryId) {
      onUpdateCategory(editingCategoryId, { icon: categoryDraftIcon.trim() || "⭐", label: label.slice(0, 12) });
    } else {
      onAddCategory(createCustomCategory({ icon: categoryDraftIcon, label }));
    }

    setCategoryDraftIcon("⭐");
    setCategoryDraftLabel("");
    setEditingCategoryId(null);
  };

  const resetForm = () => {
    setAmount("0");
    setDate(getTodayDate());
    setEditingEntryId(null);
    setEntryType("expense");
    setMemo("");
    setSelectedCategoryId("food");
  };

  const openBudgetEditor = () => {
    setBudgetDraft(String(budget));
    setBudgetMode("manual");
    setCategoryBudgetDrafts(
      Object.fromEntries(budgetableCategories.map((category) => [category.id, String(categoryBudgets[category.id] ?? "")])),
    );
    setIsBudgetEditorOpen(true);
  };

  const parseBudgetValue = (value: string | undefined) => Number((value ?? "").replace(/[^0-9]/g, "")) || 0;

  const balanceCategoryDrafts = (drafts: Record<string, string>, totalBudget: number) => {
    const categoryIds = budgetableCategories.map((category) => category.id);
    const currentTotal = categoryIds.reduce((sum, categoryId) => sum + parseBudgetValue(drafts[categoryId]), 0);

    if (categoryIds.length === 0) return {};
    if (currentTotal <= 0) {
      const base = Math.floor(totalBudget / categoryIds.length);
      let remainder = totalBudget - base * categoryIds.length;
      return Object.fromEntries(
        categoryIds.map((categoryId) => {
          const value = base + (remainder > 0 ? 1 : 0);
          remainder -= 1;
          return [categoryId, String(value)];
        }),
      );
    }

    let assigned = 0;
    const next = Object.fromEntries(
      categoryIds.map((categoryId, index) => {
        const isLast = index === categoryIds.length - 1;
        const value = isLast
          ? totalBudget - assigned
          : Math.floor((parseBudgetValue(drafts[categoryId]) / currentTotal) * totalBudget);
        assigned += value;
        return [categoryId, String(Math.max(0, value))];
      }),
    );

    return next;
  };

  const updateBudgetDraft = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    setBudgetDraft(sanitized);

    if (budgetMode === "manual") {
      setCategoryBudgetDrafts((prev) => balanceCategoryDrafts(prev, Number(sanitized) || MONTHLY_BUDGET_MIN));
    }
  };

  const updateCategoryBudgetDraft = (categoryId: string, value: string) => {
    const totalBudget = budgetDraftNumber;
    const targetValue = Math.min(totalBudget, parseBudgetValue(value));
    const otherCategories = budgetableCategories.filter((category) => category.id !== categoryId);
    const remainingBudget = Math.max(totalBudget - targetValue, 0);

    setCategoryBudgetDrafts((prev) => {
      const next = { ...prev, [categoryId]: String(targetValue) };
      const otherTotal = otherCategories.reduce((sum, category) => sum + parseBudgetValue(prev[category.id]), 0);

      if (otherCategories.length === 0) return next;

      if (otherTotal <= 0) {
        const base = Math.floor(remainingBudget / otherCategories.length);
        let remainder = remainingBudget - base * otherCategories.length;
        otherCategories.forEach((category) => {
          next[category.id] = String(base + (remainder > 0 ? 1 : 0));
          remainder -= 1;
        });
        return next;
      }

      let assigned = 0;
      otherCategories.forEach((category, index) => {
        const isLast = index === otherCategories.length - 1;
        const nextValue = isLast
          ? remainingBudget - assigned
          : Math.floor((parseBudgetValue(prev[category.id]) / otherTotal) * remainingBudget);
        assigned += nextValue;
        next[category.id] = String(Math.max(0, nextValue));
      });

      return next;
    });
  };

  const saveMonthlyBudget = () => {
    const parsed = Number(budgetDraft.replace(/[^0-9]/g, ""));
    if (parsed >= 10_000 && parsed <= 100_000_000) {
      onUpdateBudget(parsed);
      if (budgetMode === "auto") {
        const distributedBudget = Math.floor(parsed / Math.max(1, budgetableCategories.length) / MONTHLY_BUDGET_STEP) * MONTHLY_BUDGET_STEP;
        budgetableCategories.forEach((category) => onUpdateCategoryBudget(category.id, distributedBudget));
      }
      if (budgetMode === "manual") {
        const balancedDrafts = balanceCategoryDrafts(categoryBudgetDrafts, parsed);
        budgetableCategories.forEach((category) => {
          const categoryBudget = parseBudgetValue(balancedDrafts[category.id]);
          onUpdateCategoryBudget(category.id, categoryBudget);
        });
      }
      if (budgetMode === "unset") {
        budgetableCategories.forEach((category) => onUpdateCategoryBudget(category.id, 0));
      }
      setIsBudgetEditorOpen(false);
    }
  };

  const budgetDraftNumber = Number(budgetDraft.replace(/[^0-9]/g, "")) || MONTHLY_BUDGET_MIN;
  const sliderBudget = Math.min(MONTHLY_BUDGET_MAX, Math.max(MONTHLY_BUDGET_MIN, budgetDraftNumber));
  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / Math.max(budgetDraftNumber, 1)) * 100));
  const autoDistributedBudget =
    Math.floor(budgetDraftNumber / Math.max(1, budgetableCategories.length) / MONTHLY_BUDGET_STEP) * MONTHLY_BUDGET_STEP;

  return (
    <Page>
      <BudgetHero>
        <BudgetCopy>
          <BudgetLabel>{currentMonthLabel} 예산</BudgetLabel>
          <BudgetAmount>₩ {formatWon(budget)}</BudgetAmount>
          <BudgetHint>현재 지출 ₩ {formatWon(totalExpense)}</BudgetHint>
        </BudgetCopy>
        <BudgetAdjustButton onClick={openBudgetEditor}>
          <Pencil size={15} />
          예산 조정
        </BudgetAdjustButton>
      </BudgetHero>

      <CategoryHeader>
        <h2>카테고리</h2>
        <HeaderActions>
          <button onClick={() => setIsCategoryEditorOpen(true)}>
            <Pencil size={14} /> 편집
          </button>
          {editingEntryId && (
            <button onClick={resetForm}>
              <X size={14} /> 취소
            </button>
          )}
        </HeaderActions>
      </CategoryHeader>

      <TypeTabs>
        {entryTypes.map((type) => (
          <TypeButton key={type.value} $active={entryType === type.value} onClick={() => setEntryType(type.value)}>
            {type.label}
          </TypeButton>
        ))}
      </TypeTabs>

      <CategoryGrid>
        {categories.map((category) => (
          <CategoryButton key={category.id} $selected={selectedCategoryId === category.id} onClick={() => setSelectedCategoryId(category.id)}>
            <span>{category.icon}</span>
            <strong>{category.label}</strong>
          </CategoryButton>
        ))}
      </CategoryGrid>

      <CategoryBudgetCard>
        <div>
          <span>{selectedCategory?.icon} {selectedCategory?.label ?? "카테고리"} 예산</span>
          <strong>{selectedCategoryBudget > 0 ? `${formatWon(selectedCategoryBudget)}원` : "미설정"}</strong>
        </div>
        <BudgetBar>
          <BudgetFill $value={selectedCategoryBudget > 0 ? Math.min(100, Math.round((selectedCategoryExpense / selectedCategoryBudget) * 100)) : 0} />
        </BudgetBar>
        <CategoryBudgetMeta>
          <small>사용 ₩ {formatWon(selectedCategoryExpense)}</small>
          <button onClick={openBudgetEditor}>전체 예산에서 조정</button>
        </CategoryBudgetMeta>
      </CategoryBudgetCard>

      <AmountField>
        <AmountCopy>
          <AmountLabel>{getTypeLabel(entryType)} 금액</AmountLabel>
          <AmountHint>남은 예산 ₩ {formatWon(remainingBudget)}</AmountHint>
        </AmountCopy>
        <AmountInput
          aria-label={`${getTypeLabel(entryType)} 금액`}
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
        />
      </AmountField>

      <MemoInput placeholder="어디에 쓰셨나요? (선택)" value={memo} onChange={(event) => setMemo(event.target.value)} />

      <DateSection>
        <DateHeader>
          <span>날짜</span>
          <button onClick={() => setIsDatePickerOpen((prev) => !prev)}>{date}</button>
        </DateHeader>
        <DateChips>
          {quickDates.map((option) => (
            <DateChip key={option.value} $active={date === option.value} onClick={() => setDate(option.value)}>
              {option.label}
            </DateChip>
          ))}
        </DateChips>
        {isDatePickerOpen && <DateInput type="date" value={date} onChange={(event) => setDate(event.target.value)} />}
      </DateSection>
      <PrimaryButton disabled={!numericAmount} onClick={submitEntry}>
        <CheckCircle2 size={20} />
        {editingEntryId ? "수정하기" : "기록하기"}
      </PrimaryButton>

      <Advice>
        <Avatar>🐶</Avatar>
        <div>
          <strong>아끼개가 말해요</strong>
          <p>식비 지출이 많아지면 제 털이 조금 덜 보들보들해져요!</p>
        </div>
      </Advice>

      <RecentPanel>
        <h2>최근 기록</h2>
        {entries.length === 0 && (
          <EmptyState icon="📋" message="아직 기록이 없어요" sub="첫 번째 소비를 기록해볼까요?" />
        )}
        {entries.slice(0, 4).map((entry) => (
          <RecentItem key={entry.id}>
            <RecentCopy>
              <span>
                {getCategoryIcon(entry.categoryId, categories)} {entry.memo || getCategoryLabel(entry.categoryId, categories)}
              </span>
              <small>{entry.date} · {getTypeLabel(entry.type)}</small>
            </RecentCopy>
            <strong>{entry.type === "expense" ? "-" : "+"}₩ {formatWon(entry.amount)}</strong>
            <IconAction aria-label="기록 수정" onClick={() => startEditing(entry)}>
              <Pencil size={14} />
            </IconAction>
            <IconAction aria-label="기록 삭제" onClick={() => onDeleteEntry(entry.id)}>
              <Trash2 size={14} />
            </IconAction>
          </RecentItem>
        ))}
      </RecentPanel>

      {isBudgetEditorOpen && (
        <BudgetSheet>
          <SheetHeader>
            <div>
              <h2>월 예산 조정</h2>
              <span>총예산과 카테고리별 예산을 함께 설정하세요</span>
            </div>
            <button aria-label="예산 조정 닫기" onClick={() => setIsBudgetEditorOpen(false)}>
              <X size={20} />
            </button>
          </SheetHeader>
          <BudgetPreview>
            <span>{currentMonthLabel} 예산</span>
            <strong>₩ {formatWon(budgetDraftNumber)}</strong>
            <small>현재 지출 ₩ {formatWon(totalExpense)} · 사용률 {budgetUsagePercent}%</small>
          </BudgetPreview>
          <BudgetRange
            aria-label="월 예산 슬라이더"
            max={MONTHLY_BUDGET_MAX}
            min={MONTHLY_BUDGET_MIN}
            step={MONTHLY_BUDGET_STEP}
            type="range"
            value={sliderBudget}
            onChange={(event) => updateBudgetDraft(event.target.value)}
          />
          <BudgetInputRow>
            <span>직접 입력</span>
            <input
              inputMode="numeric"
              value={budgetDraftNumber.toLocaleString("ko-KR")}
              onChange={(event) => updateBudgetDraft(event.target.value.replace(/,/g, ""))}
            />
            <small>원</small>
          </BudgetInputRow>
          <BudgetQuickGrid>
            {[800_000, 1_000_000, 1_500_000, 2_000_000].map((preset) => (
              <button key={preset} onClick={() => updateBudgetDraft(String(preset))}>
                {(preset / 10_000).toLocaleString()}만
              </button>
            ))}
          </BudgetQuickGrid>
          <BudgetModePanel>
            <BudgetModeHeader>
              <strong>카테고리별 예산</strong>
              <span>
                {budgetMode === "auto"
                  ? `${budgetableCategories.length}개 카테고리에 ${formatWon(autoDistributedBudget)}원씩`
                  : budgetMode === "manual"
                    ? "총예산 안에서 한 항목을 바꾸면 나머지가 자동 조정"
                    : "카테고리 한도 없이 기록"}
              </span>
            </BudgetModeHeader>
            <BudgetModeTabs>
              {[
                { label: "자동분배", value: "auto" as const },
                { label: "직접입력", value: "manual" as const },
                { label: "미설정", value: "unset" as const },
              ].map((mode) => (
                <BudgetModeButton key={mode.value} $active={budgetMode === mode.value} onClick={() => setBudgetMode(mode.value)}>
                  {mode.label}
                </BudgetModeButton>
              ))}
            </BudgetModeTabs>
            {budgetMode === "manual" && (
              <CategoryBudgetDraftList>
                {budgetableCategories.slice(0, 10).map((category) => (
                  <CategoryBudgetDraftRow key={category.id}>
                    <span>{category.icon} {category.label}</span>
                    <input
                      inputMode="numeric"
                      placeholder="예산 없음"
                      value={
                        categoryBudgetDrafts[category.id]
                          ? Number(categoryBudgetDrafts[category.id].replace(/[^0-9]/g, "")).toLocaleString("ko-KR")
                          : ""
                      }
                      onChange={(event) =>
                        updateCategoryBudgetDraft(category.id, event.target.value.replace(/,/g, ""))
                      }
                    />
                  </CategoryBudgetDraftRow>
                ))}
              </CategoryBudgetDraftList>
            )}
          </BudgetModePanel>
          <BudgetSaveButton onClick={saveMonthlyBudget}>예산 저장</BudgetSaveButton>
        </BudgetSheet>
      )}

      {isCategoryEditorOpen && (
        <EditorSheet>
          <SheetHeader>
            <div>
              <h2>카테고리 편집</h2>
              <span>자주 쓰는 항목을 직접 추가하세요</span>
            </div>
            <button aria-label="카테고리 편집 닫기" onClick={() => setIsCategoryEditorOpen(false)}>
              <X size={20} />
            </button>
          </SheetHeader>

          <CategoryForm>
            <IconInput
              aria-label="카테고리 아이콘"
              maxLength={4}
              value={categoryDraftIcon}
              onChange={(event) => setCategoryDraftIcon(event.target.value)}
            />
            <NameInput
              placeholder="카테고리 이름"
              value={categoryDraftLabel}
              onChange={(event) => setCategoryDraftLabel(event.target.value)}
            />
            <SaveButton onClick={saveCategory}>
              {editingCategoryId ? <Save size={16} /> : <Plus size={16} />}
              {editingCategoryId ? "저장" : "추가"}
            </SaveButton>
          </CategoryForm>

          <EditorList>
            {categories.map((category) => (
              <EditorItem key={category.id}>
                <span>{category.icon}</span>
                <strong>{category.label}</strong>
                {category.isCustom ? (
                  <>
                    <IconAction aria-label="카테고리 수정" onClick={() => startCategoryEditing(category)}>
                      <Pencil size={14} />
                    </IconAction>
                    <IconAction aria-label="카테고리 삭제" onClick={() => onDeleteCategory(category.id)}>
                      <Trash2 size={14} />
                    </IconAction>
                  </>
                ) : (
                  <FixedBadge>기본</FixedBadge>
                )}
              </EditorItem>
            ))}
          </EditorList>
        </EditorSheet>
      )}
    </Page>
  );
}

function getTypeLabel(type: LedgerEntryType): string {
  if (type === "saving") return "저축";
  if (type === "income") return "수입";
  return "지출";
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const BudgetHero = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 -${({ theme }) => theme.spacing.lg};
  padding: 26px 20px 32px;
  background: linear-gradient(160deg, #ffe8f2 0%, #fff5f9 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

const BudgetCopy = styled.div`
  display: grid;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BudgetLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  font-weight: 400;
`;

const BudgetAmount = styled.strong`
  color: ${({ theme }) => theme.colors.text};
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.8px;
`;

const BudgetHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 400;
`;

const BudgetAdjustButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: 42px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 13px;
  font-weight: 700;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.orange};
    background: transparent;
    font-size: 14px;
    font-weight: 500;
  }
`;

const HeaderActions = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TypeTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const TypeButton = styled.button<{ $active: boolean }>`
  min-height: 40px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 72px;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xs};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryButton = styled.button<{ $selected: boolean }>`
  display: grid;
  min-height: 78px;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.surfaceWarm : theme.colors.surface)};
  border: 1.5px solid ${({ $selected, theme }) => ($selected ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ $selected }) => ($selected ? "0 1px 6px rgba(232, 114, 140, 0.18)" : "none")};

  span {
    font-size: 24px;
  }

  strong {
    font-size: 11px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const CategoryBudgetCard = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 600;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
  }
`;

const CategoryBudgetMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  small {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 500;
  }

  button {
    min-height: 32px;
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.orangeDark};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: 12px;
    font-weight: 700;
  }
`;

const BudgetBar = styled.div`
  height: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const BudgetFill = styled.div<{ $value: number }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  background: ${({ theme }) => theme.colors.orange};
  border-radius: inherit;
`;

const AmountField = styled.section`
  display: grid;
  grid-template-columns: 1fr minmax(130px, 48%);
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const AmountCopy = styled.div`
  display: grid;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AmountLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  font-weight: 700;
`;

const AmountHint = styled.small`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 400;
`;

const AmountInput = styled.input`
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  outline: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};
  min-height: 48px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: right;

  &::placeholder {
    color: ${({ theme }) => theme.colors.line};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.orange};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const MemoInput = styled.input`
  width: 100%;
  min-height: 54px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1.5px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 16px;
  font-weight: 400;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.orange};
  }
`;

const DateSection = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const DateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 14px;
    font-weight: 400;
  }

  button {
    color: ${({ theme }) => theme.colors.text};
    background: transparent;
    font-size: 14px;
    font-weight: 600;
  }
`;

const DateChips = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DateChip = styled.button<{ $active: boolean }>`
  min-height: 36px;
  color: ${({ $active, theme }) => ($active ? theme.colors.surface : theme.colors.text)};
  background: ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.surfaceWarm)};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
`;

const DateInput = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 500;
`;

const EditorSheet = styled.section`
  position: fixed;
  right: 50%;
  bottom: 80px;
  z-index: 40;
  display: grid;
  width: min(398px, calc(100vw - 32px));
  max-height: min(680px, calc(100vh - 132px));
  gap: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.xl};
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(16px);
  transform: translateX(50%);
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 400;
  }

  button {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    color: ${({ theme }) => theme.colors.muted};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border-radius: 50%;
  }
`;

const BudgetSheet = styled(EditorSheet)`
  max-height: min(760px, calc(100vh - 112px));
  overflow-y: auto;
`;

const BudgetPreview = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};

  span,
  small {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 500;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.6px;
  }
`;

const BudgetRange = styled.input`
  width: 100%;
  height: 24px;
  accent-color: ${({ theme }) => theme.colors.orange};
`;

const BudgetInputRow = styled.label`
  display: grid;
  grid-template-columns: 1fr minmax(150px, 58%) 20px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 600;

  input {
    min-width: 0;
    min-height: 46px;
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 18px;
    font-weight: 700;
    text-align: right;
  }
`;

const BudgetQuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  button {
    min-height: 38px;
    color: ${({ theme }) => theme.colors.orangeDark};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: 13px;
    font-weight: 700;
  }
`;

const BudgetModePanel = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const BudgetModeHeader = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 15px;
    font-weight: 700;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 500;
  }
`;

const BudgetModeTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 3px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const BudgetModeButton = styled.button<{ $active: boolean }>`
  min-height: 36px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
`;

const CategoryBudgetDraftList = styled.div`
  display: grid;
  max-height: 220px;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.xs};
`;

const CategoryBudgetDraftRow = styled.label`
  display: grid;
  grid-template-columns: 1fr 118px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  span {
    min-width: 0;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text};
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  input {
    min-width: 0;
    min-height: 38px;
    padding: 0 ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: 13px;
    font-weight: 600;
    text-align: right;
  }
`;

const BudgetSaveButton = styled.button`
  min-height: 48px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 16px;
  font-weight: 700;
`;

const CategoryForm = styled.div`
  display: grid;
  grid-template-columns: 52px 1fr 76px;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconInput = styled.input`
  min-width: 0;
  min-height: 48px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 22px;
  text-align: center;
`;

const NameInput = styled.input`
  min-width: 0;
  min-height: 48px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 400;
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 600;
`;

const EditorList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.xs};
`;

const EditorItem = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};

  strong {
    font-size: 14px;
    font-weight: 500;
  }
`;

const FixedBadge = styled.span`
  grid-column: span 2;
  justify-self: end;
  padding: 4px 10px;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 11px;
  font-weight: 500;
`;

const Advice = styled.section`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.greenSoft};
  border: 1px solid rgba(43, 154, 117, 0.2);
  border-radius: ${({ theme }) => theme.radius.xl};

  strong {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #315346;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
  }
`;

const RecentPanel = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
`;

const RecentItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 32px 32px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};

  strong {
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }
`;

const RecentCopy = styled.div`
  display: grid;
  min-width: 0;
  gap: 2px;

  span {
    min-width: 0;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 11px;
    font-weight: 400;
  }
`;

const IconAction = styled.button`
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
`;

const Avatar = styled.div`
  display: grid;
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  font-size: 30px;
`;
