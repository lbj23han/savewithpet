import { CheckCircle2, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

import { Panel } from "../components/Panel";
import { formatWon, getCurrentMonthLabel } from "../domain/ledger";
import type { TossLoginInfo } from "../lib/tossLogin";
import { petPresets } from "../mocks/appData";
import type { AppStats, LedgerEntry, UserPet } from "../types/app";

type SettingsPageProps = {
  aiCharacterCredits: number;
  coins: number;
  entries: LedgerEntry[];
  isAiCharacterGenerating: boolean;
  isTossLoginRequesting: boolean;
  monthlyBudget: number;
  ownedCustomPets: UserPet[];
  ownedPetIds: string[];
  pet: UserPet;
  petLevels: Record<string, number>;
  stats: AppStats;
  tossLoginInfo: TossLoginInfo | null;
  tossLoginReady: boolean;
  onDeleteCustomPet: (petId: string) => void;
  onResetData: () => void;
  onSelectPet: (petId: string) => void;
  onTossLogin: () => void;
  onUpdateCustomPetProfile: (petId: string, profile: { name: string; trait: string }) => void;
  onUpdateBudget: (budget: number) => void;
};

const BUDGET_PRESETS = [500_000, 800_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000];

export function SettingsPage({
  aiCharacterCredits,
  coins,
  entries,
  isAiCharacterGenerating,
  isTossLoginRequesting,
  monthlyBudget,
  ownedCustomPets,
  ownedPetIds,
  pet,
  petLevels,
  stats,
  tossLoginInfo,
  tossLoginReady,
  onDeleteCustomPet,
  onResetData,
  onSelectPet,
  onTossLogin,
  onUpdateCustomPetProfile,
  onUpdateBudget,
}: SettingsPageProps) {
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [resetPhrase, setResetPhrase] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [petNameInput, setPetNameInput] = useState(pet.name);
  const [petTraitInput, setPetTraitInput] = useState(pet.trait);
  const expenseEntries = entries.filter((e) => e.type === "expense");
  const selectedCustomPet = pet.source === "photo" ? pet : undefined;

  useEffect(() => {
    setPetNameInput(pet.name);
    setPetTraitInput(pet.trait);
  }, [pet.id, pet.name, pet.trait]);

  const handleBudgetSave = () => {
    const parsed = Number(budgetInput.replace(/,/g, "").replace(/[^0-9]/g, ""));
    if (parsed >= 10_000 && parsed <= 100_000_000) {
      onUpdateBudget(parsed);
    }
  };

  const formatLinkedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <Page>
      <PetCard>
        <PetAvatar>{pet.imageUrl ? <PetAvatarImage src={pet.imageUrl} alt={pet.name} /> : pet.emoji}</PetAvatar>
        <PetInfo>
          <PetName>{pet.name}</PetName>
          <PetTrait>{pet.trait}</PetTrait>
          <LevelBadge>Lv. {stats.level}</LevelBadge>
        </PetInfo>
      </PetCard>

      <Panel>
        <SectionLabel>Toss 계정 연동</SectionLabel>
        {tossLoginInfo ? (
          <TossLinkedRow>
            <CheckCircle2 size={18} />
            <TossLinkedInfo>
              <strong>
                {tossLoginInfo.displayName ? `${tossLoginInfo.displayName}님` : "Toss 계정 연동됨"}
              </strong>
              <span>연동일 {formatLinkedAt(tossLoginInfo.linkedAt)}</span>
            </TossLinkedInfo>
          </TossLinkedRow>
        ) : (
          <TossLoginDescription>
            Toss 계정과 연동하면 기록과 캐릭터를 다른 기기에서도 이어서 쓸 수 있어요.
          </TossLoginDescription>
        )}
        <TossLoginButton
          disabled={!tossLoginReady || isTossLoginRequesting}
          onClick={onTossLogin}
        >
          {isTossLoginRequesting
            ? "연동 중..."
            : tossLoginInfo
              ? "다시 연동"
              : tossLoginReady
                ? "Toss로 연동하기"
                : "연동 준비 중"}
        </TossLoginButton>
      </Panel>

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
          <StatItem>
            <StatValue>{aiCharacterCredits.toLocaleString()}</StatValue>
            <StatLabel>AI 생성권</StatLabel>
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
        <SectionLabel>캐릭터 컬렉션 · AI {ownedCustomPets.length}/5</SectionLabel>
        <OwnedPetGrid>
          {petPresets
            .filter((preset) => ownedPetIds.includes(preset.id))
            .map((preset) => (
              <OwnedPetButton key={preset.id} $active={pet.id === preset.id} onClick={() => onSelectPet(preset.id)}>
                <OwnedPetImage src={preset.imageUrl} alt={preset.name} />
                <PetNameRow>
                  <span>{preset.name}</span>
                  <PetLevelLabel>Lv.{petLevels[preset.id] ?? 1}</PetLevelLabel>
                </PetNameRow>
              </OwnedPetButton>
            ))}
          {ownedCustomPets.map((customPet) => (
            <OwnedCustomPetCard key={customPet.id}>
              <OwnedPetButton $active={pet.id === customPet.id} onClick={() => onSelectPet(customPet.id)}>
                {customPet.imageUrl ? <OwnedPetImage src={customPet.imageUrl} alt={customPet.name} /> : customPet.emoji}
                <PetNameRow>
                  <span>{customPet.name}</span>
                  <PetLevelLabel>Lv.{petLevels[customPet.id] ?? 1}</PetLevelLabel>
                </PetNameRow>
              </OwnedPetButton>
              <DeletePetButton aria-label={`${customPet.name} 삭제`} onClick={() => onDeleteCustomPet(customPet.id)}>
                <Trash2 size={14} />
              </DeletePetButton>
            </OwnedCustomPetCard>
          ))}
          {isAiCharacterGenerating && (
            <GeneratingPetCard aria-label="AI 캐릭터 생성 중">
              <GeneratingSpinner aria-hidden="true" />
              <GeneratingPetLabel>
                <strong>만드는 중...</strong>
                <span>약 30초</span>
              </GeneratingPetLabel>
            </GeneratingPetCard>
          )}
        </OwnedPetGrid>
        {selectedCustomPet && (
          <CustomPetEditor
            onSubmit={(event) => {
              event.preventDefault();
              onUpdateCustomPetProfile(selectedCustomPet.id, {
                name: petNameInput,
                trait: petTraitInput,
              });
            }}
          >
            <label htmlFor="custom-pet-name">이름</label>
            <CustomPetInput
              id="custom-pet-name"
              maxLength={12}
              value={petNameInput}
              onChange={(event) => setPetNameInput(event.target.value)}
            />
            <label htmlFor="custom-pet-trait">소개 문구</label>
            <CustomPetTextarea
              id="custom-pet-trait"
              maxLength={60}
              value={petTraitInput}
              onChange={(event) => setPetTraitInput(event.target.value)}
            />
            <SaveCustomPetButton type="submit">캐릭터 정보 저장</SaveCustomPetButton>
          </CustomPetEditor>
        )}
      </Panel>

      <Panel>
        <SectionLabel>앱 정보</SectionLabel>
        <InfoRow>
          <span>버전</span>
          <InfoValue>1.0.0</InfoValue>
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
            데이터 초기화
            <ChevronRight size={16} />
          </ResetButton>
        ) : (
          <ConfirmRow>
            <ConfirmMessage>
              모든 기록, 코인, 캐릭터 상태가 이 기기에서 초기화돼요. 계속하려면 아래에 <strong>초기화</strong>를 입력해주세요.
            </ConfirmMessage>
            <ResetConfirmInput
              aria-label="초기화 확인 문구"
              placeholder="초기화"
              value={resetPhrase}
              onChange={(event) => setResetPhrase(event.target.value)}
            />
            <ConfirmActions>
              <CancelBtn
                onClick={() => {
                  setResetPhrase("");
                  setShowResetConfirm(false);
                }}
              >
                취소
              </CancelBtn>
              <DeleteBtn disabled={resetPhrase.trim() !== "초기화"} onClick={onResetData}>
                데이터 초기화
              </DeleteBtn>
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

const PetAvatar = styled.div`
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

const PetAvatarImage = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
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

const TossLoginDescription = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  line-height: 1.5;
`;

const TossLinkedRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.greenSoft};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.green};
`;

const TossLinkedInfo = styled.div`
  display: grid;
  gap: 2px;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 500;
  }
`;

const TossLoginButton = styled.button`
  width: 100%;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 700;

  &:disabled {
    color: ${({ theme }) => theme.colors.muted};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

const OwnedPetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OwnedCustomPetCard = styled.div`
  position: relative;
  display: grid;
`;

const settingsSpinnerRotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const GeneratingPetCard = styled.div`
  display: grid;
  justify-items: center;
  align-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: 104px;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px dashed ${({ theme }) => theme.colors.purple};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const GeneratingSpinner = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme }) => theme.colors.line};
  border-top-color: ${({ theme }) => theme.colors.purple};
  border-radius: 50%;
  animation: ${settingsSpinnerRotate} 700ms linear infinite;
`;

const GeneratingPetLabel = styled.div`
  display: grid;
  justify-items: center;
  gap: 2px;

  strong {
    color: ${({ theme }) => theme.colors.purple};
    font-size: 11px;
    font-weight: 800;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 10px;
    font-weight: 500;
  }
`;

const OwnedPetButton = styled.button<{ $active: boolean }>`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: 104px;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.text)};
  background: ${({ $active, theme }) => ($active ? "#FFF1B5" : theme.colors.surfaceWarm)};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.lg};

  span {
    font-size: 12px;
    font-weight: 700;
  }
`;

const PetNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PetLevelLabel = styled.span`
  font-size: 10px !important;
  font-weight: 500 !important;
  color: ${({ theme }) => theme.colors.muted};
`;

const DeletePetButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  color: ${({ theme }) => theme.colors.red};
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 50%;
`;

const OwnedPetImage = styled.img`
  width: 58px;
  height: 58px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const CustomPetEditor = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};

  label {
    color: ${({ theme }) => theme.colors.text};
    font-size: 12px;
    font-weight: 800;
  }
`;

const CustomPetInput = styled.input`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 700;
`;

const CustomPetTextarea = styled.textarea`
  min-height: 76px;
  resize: vertical;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: inherit;
  font-size: 14px;
  line-height: 1.45;
`;

const SaveCustomPetButton = styled.button`
  min-height: 44px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 800;
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

  strong {
    color: ${({ theme }) => theme.colors.red};
    font-weight: 800;
  }
`;

const ResetConfirmInput = styled.input`
  width: 100%;
  min-height: 46px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 700;
  text-align: center;

  &:focus {
    border-color: ${({ theme }) => theme.colors.red};
    outline: none;
  }
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

  &:disabled {
    opacity: 0.42;
  }
`;
