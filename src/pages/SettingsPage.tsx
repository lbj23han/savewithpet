import { ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import { Panel } from "../components/Panel";
import { formatWon, getCurrentMonthLabel } from "../domain/ledger";
import type { AppStats, LedgerEntry, UserPet } from "../types/app";

type SettingsPageProps = {
  coins: number;
  entries: LedgerEntry[];
  monthlyBudget: number;
  pet: UserPet;
  stats: AppStats;
  onResetData: () => void;
  onUpdateBudget: (budget: number) => void;
};

const BUDGET_PRESETS = [500_000, 800_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000];

export function SettingsPage({ coins, entries, monthlyBudget, pet, stats, onResetData, onUpdateBudget }: SettingsPageProps) {
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const expenseEntries = entries.filter((e) => e.type === "expense");

  const handleBudgetSave = () => {
    const parsed = Number(budgetInput.replace(/,/g, "").replace(/[^0-9]/g, ""));
    if (parsed >= 10_000 && parsed <= 100_000_000) {
      onUpdateBudget(parsed);
    }
  };

  return (
    <Page>
      <PetCard>
        <PetEmoji>{pet.emoji}</PetEmoji>
        <PetInfo>
          <PetName>{pet.name}</PetName>
          <PetTrait>{pet.trait}</PetTrait>
          <LevelBadge>Lv. {stats.level}</LevelBadge>
        </PetInfo>
      </PetCard>

      <Panel>
        <SectionLabel>이번 달 현황</SectionLabel>
        <StatsGrid>
          <StatItem>
            <StatValue>{expenseEntries.length}</StatValue>
            <StatLabel>기록 수</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{formatWon(stats.totalExpense)}</StatValue>
            <StatLabel>총 지출</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.streakDays}일</StatValue>
            <StatLabel>연속 기록</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{coins.toLocaleString()}</StatValue>
            <StatLabel>보유 코인</StatLabel>
          </StatItem>
        </StatsGrid>
      </Panel>

      <Panel>
        <SectionLabel>{getCurrentMonthLabel()} 예산 설정</SectionLabel>
        <BudgetPresets>
          {BUDGET_PRESETS.map((preset) => (
            <PresetChip
              key={preset}
              $active={monthlyBudget === preset}
              onClick={() => {
                setBudgetInput(String(preset));
                onUpdateBudget(preset);
              }}
            >
              {(preset / 10_000).toLocaleString()}만
            </PresetChip>
          ))}
        </BudgetPresets>
        <BudgetRow>
          <BudgetInput
            inputMode="numeric"
            value={Number(budgetInput.replace(/[^0-9]/g, "")).toLocaleString("ko-KR")}
            onChange={(e) => setBudgetInput(e.target.value.replace(/,/g, ""))}
            onBlur={handleBudgetSave}
          />
          <BudgetUnit>원</BudgetUnit>
        </BudgetRow>
        <BudgetHint>10,000원 이상 1억원 이하로 설정할 수 있어요</BudgetHint>
      </Panel>

      <Panel>
        <SectionLabel>앱 정보</SectionLabel>
        <InfoRow>
          <span>버전</span>
          <InfoValue>MVP 0.1</InfoValue>
        </InfoRow>
        <InfoRow>
          <span>캐릭터 타입</span>
          <InfoValue>{pet.source === "photo" ? "사진 기반" : pet.source === "preset" ? "프리셋" : "기본"}</InfoValue>
        </InfoRow>
        <InfoRow>
          <span>전체 기록</span>
          <InfoValue>{entries.length}개</InfoValue>
        </InfoRow>
      </Panel>

      <DangerZone>
        {!showResetConfirm ? (
          <ResetButton onClick={() => setShowResetConfirm(true)}>
            <RotateCcw size={16} />
            로컬 데이터 초기화
            <ChevronRight size={16} />
          </ResetButton>
        ) : (
          <ConfirmRow>
            <ConfirmMessage>모든 기록이 삭제돼요. 계속할까요?</ConfirmMessage>
            <ConfirmActions>
              <CancelBtn onClick={() => setShowResetConfirm(false)}>취소</CancelBtn>
              <DeleteBtn onClick={onResetData}>초기화</DeleteBtn>
            </ConfirmActions>
          </ConfirmRow>
        )}
      </DangerZone>
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const PetCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, #ffe8f2 0%, #fff5f9 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
`;

const PetEmoji = styled.div`
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 40px;
`;

const PetInfo = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PetName = styled.strong`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
`;

const PetTrait = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 400;
`;

const LevelBadge = styled.span`
  align-self: start;
  padding: 3px 10px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.orangeDark};
  font-size: 12px;
  font-weight: 600;
`;

const SectionLabel = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  display: grid;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const StatValue = styled.strong`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 400;
`;

const BudgetPresets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PresetChip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  background: ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.surfaceWarm)};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $active, theme }) => ($active ? theme.colors.surface : theme.colors.text)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
`;

const BudgetRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1.5px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.orange};
  }
`;

const BudgetInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
`;

const BudgetUnit = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 16px;
  font-weight: 400;
`;

const BudgetHint = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 400;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 14px;
    font-weight: 400;
  }
`;

const InfoValue = styled.strong`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const DangerZone = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: ${({ theme }) => theme.colors.red};
  background: transparent;
  font-size: 15px;
  font-weight: 500;

  svg:first-child {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }

  svg:last-child {
    color: ${({ theme }) => theme.colors.muted};
    margin-left: auto;
  }
`;

const ConfirmRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ConfirmMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 500;
  text-align: center;
`;

const ConfirmActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CancelBtn = styled.button`
  min-height: 44px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 500;
`;

const DeleteBtn = styled.button`
  min-height: 44px;
  background: ${({ theme }) => theme.colors.red};
  border-radius: ${({ theme }) => theme.radius.md};
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;
