import { Calendar, PlusCircle, Shirt, Store, X } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import { EmptyState } from "../components/EmptyState";
import { Panel } from "../components/Panel";
import { PrimaryButton } from "../components/PrimaryButton";
import { formatWon } from "../domain/ledger";
import { createPetComment } from "../domain/petComment";
import { createPetStatuses, createPetStatusViewModels } from "../domain/petProgress";
import type { AppStats, Category, LedgerEntry, RewardEvent, ShopItemViewModel, UserPet } from "../types/app";

type HomePageProps = {
  categories: Category[];
  entries: LedgerEntry[];
  equippedItem?: ShopItemViewModel;
  monthlyBudget: number;
  onRecord: () => void;
  onEquipItem: (itemId: string) => void;
  onOpenShop: () => void;
  pet: UserPet;
  rewardEvents: RewardEvent[];
  stats: AppStats;
  wardrobeItems: ShopItemViewModel[];
};

export function HomePage({
  categories,
  entries,
  equippedItem,
  monthlyBudget,
  onEquipItem,
  onOpenShop,
  onRecord,
  pet,
  rewardEvents,
  stats,
  wardrobeItems,
}: HomePageProps) {
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const statusRows = createPetStatusViewModels(createPetStatuses(stats));
  const latestReward = rewardEvents[0];
  const petComment = createPetComment(stats, entries, categories, monthlyBudget);
  const summaryRows = [
    { label: "지출", value: formatWon(stats.totalExpense), tone: "red" as const },
    { label: "저축", value: formatWon(stats.totalSaving), tone: "green" as const },
    { label: "연속기록", value: `${stats.streakDays}일`, tone: "purple" as const },
  ];

  return (
    <Page>
      <Hero>
        <NameRow>
          <PetName>{pet.name}</PetName>
          <Level>Lv. {stats.level}</Level>
        </NameRow>
        <Speech>{petComment}</Speech>
        <PetPortrait>
          <PetFace>
            {pet.imageUrl ? <PetImage src={pet.imageUrl} alt={pet.name} /> : pet.emoji}
            {equippedItem && <EquippedItem aria-label={`착용 아이템 ${equippedItem.name}`}>{equippedItem.icon}</EquippedItem>}
          </PetFace>
          <WardrobeButton aria-label="옷장 열기" onClick={() => setIsWardrobeOpen(true)}>
            <Shirt size={20} />
          </WardrobeButton>
        </PetPortrait>
      </Hero>

      {latestReward && (
        <RewardNotice>
          <strong>+{latestReward.coins} 코인</strong>
          <span>{latestReward.label}</span>
        </RewardNotice>
      )}

      <StatusPanel>
        {statusRows.map((status) => (
          <StatusRow key={status.label}>
            <StatusLabel>{status.label}</StatusLabel>
            <Track>
              <Fill $value={status.value} $tone={status.tone} />
            </Track>
            <StatusValue $tone={status.tone}>{status.percentLabel}</StatusValue>
          </StatusRow>
        ))}
      </StatusPanel>

      <Panel>
        <SummaryHeader>
          <h2>오늘의 요약</h2>
          <Calendar size={20} />
        </SummaryHeader>
        <Metrics>
          {summaryRows.map((metric) => (
            <Metric key={metric.label} $tone={metric.tone}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </Metric>
          ))}
        </Metrics>
      </Panel>

      <PrimaryButton onClick={onRecord}>
        <PlusCircle size={20} />
        지금 기록하기
      </PrimaryButton>

      {isWardrobeOpen && (
        <WardrobeSheet>
          <SheetHeader>
            <div>
              <h2>내 옷장</h2>
              <span>아이템을 누르면 바로 착용해요</span>
            </div>
            <button aria-label="옷장 닫기" onClick={() => setIsWardrobeOpen(false)}>
              <X size={20} />
            </button>
          </SheetHeader>
          <WardrobeGrid>
            {wardrobeItems.length === 0 ? (
              <EmptyState icon="🛍️" message="보유한 아이템이 없어요" sub="상점에서 첫 아이템을 구매해보세요" />
            ) : (
              wardrobeItems.map((item) => (
                <WardrobeItem key={item.id} $active={item.state === "equipped"} onClick={() => onEquipItem(item.id)}>
                  <span>{item.icon}</span>
                  <strong>{item.name}</strong>
                </WardrobeItem>
              ))
            )}
          </WardrobeGrid>
          <ShopLink onClick={onOpenShop}>
            <Store size={18} />
            상점에서 더 보기
          </ShopLink>
        </WardrobeSheet>
      )}
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 4px 0 ${({ theme }) => theme.spacing.md};
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PetName = styled.strong`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
`;

const Level = styled.span`
  padding: 5px 14px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.orangeDark};
  font-size: 13px;
  font-weight: 600;
`;

const Speech = styled.div`
  position: relative;
  padding: 14px 20px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 16px;
  font-weight: 500;
  text-align: center;

  &::after {
    position: absolute;
    right: 50%;
    bottom: -12px;
    width: 22px;
    height: 22px;
    background: inherit;
    border-right: 1px solid ${({ theme }) => theme.colors.line};
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    content: "";
    transform: translateX(50%) rotate(45deg);
  }
`;

const PetPortrait = styled.div`
  position: relative;
  display: grid;
  width: 200px;
  height: 200px;
  place-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: radial-gradient(circle, #fff5f9 0%, #fde0ea 72%);
  border-radius: 50%;
`;

const PetFace = styled.div`
  position: relative;
  display: grid;
  width: 140px;
  height: 140px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 32px;
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 76px;
`;

const EquippedItem = styled.span`
  position: absolute;
  top: 8px;
  right: 12px;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 26px;
`;

const WardrobeButton = styled.button`
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const PetImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

const StatusPanel = styled(Panel)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const RewardNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};

  strong {
    font-weight: 700;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 14px;
    font-weight: 400;
  }
`;

const WardrobeSheet = styled.section`
  position: fixed;
  right: 50%;
  bottom: 80px;
  z-index: 30;
  display: grid;
  width: min(398px, calc(100vw - 32px));
  gap: ${({ theme }) => theme.spacing.lg};
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

const WardrobeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  > div {
    grid-column: 1 / -1;
  }
`;

const WardrobeItem = styled.button<{ $active: boolean }>`
  display: grid;
  min-height: 88px;
  place-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceWarm : theme.colors.surface)};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.lg};

  span {
    font-size: 30px;
  }

  strong {
    font-size: 11px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const ShopLink = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 44px;
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 600;
`;

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: 68px 1fr 44px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 500;
`;

const Track = styled.div`
  height: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const Fill = styled.div<{ $value: number; $tone: "orange" | "purple" | "green" }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  background: ${({ $tone, theme }) =>
    $tone === "orange" ? theme.colors.orange : $tone === "purple" ? theme.colors.purple : theme.colors.green};
  border-radius: inherit;
`;

const StatusValue = styled.strong<{ $tone: "orange" | "purple" | "green" }>`
  color: ${({ $tone, theme }) =>
    $tone === "orange" ? theme.colors.orangeDark : $tone === "purple" ? theme.colors.purple : theme.colors.green};
  font-size: 13px;
  font-weight: 600;
  text-align: right;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  svg {
    color: ${({ theme }) => theme.colors.line};
  }
`;

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const Metric = styled.div<{ $tone: "red" | "green" | "purple" }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  text-align: center;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.line};
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 400;
  }

  strong {
    color: ${({ $tone, theme }) =>
      $tone === "red" ? theme.colors.red : $tone === "green" ? theme.colors.green : theme.colors.purple};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
`;
