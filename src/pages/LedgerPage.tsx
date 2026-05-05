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
  entries: LedgerEntry[];
  onAddEntry: (entry: LedgerEntryDraft) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdateCategory: (categoryId: string, category: Pick<Category, "icon" | "label">) => void;
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

export function LedgerPage({
  budget,
  categories,
  entries,
  onAddCategory,
  onAddEntry,
  onDeleteCategory,
  onDeleteEntry,
  onUpdateCategory,
  onUpdateEntry,
}: LedgerPageProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("food");
  const [amount, setAmount] = useState("12500");
  const [categoryDraftIcon, setCategoryDraftIcon] = useState("⭐");
  const [categoryDraftLabel, setCategoryDraftLabel] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<LedgerEntryType>("expense");
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const totalExpense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const currentMonthLabel = getCurrentMonthLabel();
  const numericAmount = Number(amount);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

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
    setAmount("");
    setDate(getTodayDate());
    setEditingEntryId(null);
    setEntryType("expense");
    setMemo("");
    setSelectedCategoryId("food");
  };

  return (
    <Page>
      <BudgetHero>
        <BudgetLabel>{currentMonthLabel}</BudgetLabel>
        <BudgetAmount>₩ {formatWon(totalExpense)}</BudgetAmount>
        <BudgetHint>예산 {formatWon(budget)}원 중</BudgetHint>
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

      <AmountBox>
        <AmountLabel>지출 금액</AmountLabel>
        <AmountInput
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
        />
        <AmountHint>남은 예산 ₩ {formatWon(Math.max(budget - totalExpense - (numericAmount || 0), 0))}</AmountHint>
      </AmountBox>

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
      <MemoInput placeholder="어디에 쓰셨나요? (선택)" value={memo} onChange={(event) => setMemo(event.target.value)} />
      <PrimaryButton disabled={!numericAmount} onClick={submitEntry}>
        <CheckCircle2 size={20} />
        {editingEntryId ? "수정하기" : "기록하기"}
      </PrimaryButton>

      <Advice>
        <Avatar>🐹</Avatar>
        <div>
          <strong>토토리가 말해요</strong>
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
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.lg};
  padding: 36px 20px 60px;
  background: linear-gradient(160deg, #ffe8f2 0%, #fff5f9 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

const BudgetLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  font-weight: 400;
`;

const BudgetAmount = styled.strong`
  color: ${({ theme }) => theme.colors.text};
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -1px;
`;

const BudgetHint = styled.p`
  margin: 0;
  padding: 6px 16px;
  background: rgba(232, 114, 140, 0.10);
  border: 1px solid rgba(232, 114, 140, 0.15);
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.orangeDark};
  font-size: 13px;
  font-weight: 500;
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

const AmountBox = styled.section`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const AmountLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 400;
`;

const AmountHint = styled.small`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 400;
`;

const AmountInput = styled.input`
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: center;

  &::before {
    content: "₩";
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.line};
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
