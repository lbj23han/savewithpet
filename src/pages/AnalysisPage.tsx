import styled from "styled-components";
import { useState } from "react";

import { AdBannerSlot } from "../components/AdBannerSlot";
import { Panel } from "../components/Panel";
import { type AnalysisPeriod, createAnalysisViewModel } from "../domain/analysis";
import { formatWon, getCurrentMonthPeriodLabel } from "../domain/ledger";
import type { Category, LedgerEntry } from "../types/app";

type AnalysisPageProps = {
  budget: number;
  categories: Category[];
  entries: LedgerEntry[];
};

export function AnalysisPage({ budget, categories, entries }: AnalysisPageProps) {
  const [period, setPeriod] = useState<AnalysisPeriod>("month");
  const analysis = createAnalysisViewModel(entries, period, categories, budget);
  const goalProgress = createGoalProgress(analysis);

  return (
    <Page>
      <Hero>
        <TitleRow>
          <div>
            <h1>소비 분석</h1>
            <span>{getCurrentMonthPeriodLabel()}</span>
          </div>
          <CalendarBadge>▣</CalendarBadge>
        </TitleRow>
        <HeroMetrics>
          <Metric>
            <span>총지출</span>
            <strong>{Math.round(analysis.totalExpense / 1000)}k</strong>
          </Metric>
          <Metric>
            <span>목표</span>
            <strong>{Math.round(analysis.budget / 1000)}k</strong>
          </Metric>
          <Metric>
            <span>{analysis.achievementRate < 0 ? "초과율" : "달성률"}</span>
            <strong>{analysis.achievementRate < 0 ? `-${Math.abs(analysis.achievementRate)}%` : `${analysis.achievementRate}%`}</strong>
          </Metric>
        </HeroMetrics>
      </Hero>

      <PeriodTabs>
        {periodOptions.map((option) => (
          <PeriodButton key={option.value} $active={period === option.value} onClick={() => setPeriod(option.value)}>
            {option.label}
          </PeriodButton>
        ))}
      </PeriodTabs>

      <Panel>
        <SectionTitle>
          <IconTile>🍕</IconTile>
          <h2>카테고리별 지출</h2>
        </SectionTitle>
        <Donut $gradient={analysis.donutGradient}>
          <span>가장 많이 쓴</span>
          <strong>{analysis.topCategoryLabel}</strong>
        </Donut>
      </Panel>

      <Panel>
        <LegendList>
          {analysis.categories.length > 0 ? (
            analysis.categories.map((category) => (
              <LegendItem key={category.id}>
                <Dot $color={category.color} />
                <span>{category.icon} {category.label}</span>
                <strong>{formatWon(category.amount)}원 · {category.value}%</strong>
              </LegendItem>
            ))
          ) : (
            <EmptyState>아직 분석할 지출 기록이 없어요.</EmptyState>
          )}
        </LegendList>
      </Panel>

      <Panel>
        <SectionTitle>
          <IconTile>🌱</IconTile>
          <h2>목표 달성 현황</h2>
        </SectionTitle>
        <ProgressList>
          {goalProgress.map((goal) => (
            <ProgressItem key={goal.label}>
              <div>
                <span>{goal.label}</span>
                <strong>{goal.value}%</strong>
              </div>
              <Track>
                <Fill $color={goal.color} $value={goal.value} />
              </Track>
            </ProgressItem>
          ))}
        </ProgressList>
      </Panel>

      <MessageCard>{analysis.encouragement}</MessageCard>

      <AdBannerSlot placement="analysis" />
    </Page>
  );
}

function createGoalProgress(analysis: ReturnType<typeof createAnalysisViewModel>) {
  const budgetKeeping = analysis.totalExpense === 0 ? 0 : Math.max(0, Math.min(100, analysis.achievementRate));
  const recordHabit = Math.min(100, analysis.entryCount * 20);
  const categoryBalance = analysis.categories.length === 0 ? 0 : Math.min(100, analysis.categories.length * 34);

  return [
    { label: "예산 지키기", value: budgetKeeping, color: "#5BC08D" },
    { label: "기록 습관", value: recordHabit, color: "#B995EF" },
    { label: "소비 파악", value: categoryBalance, color: "#E8728C" },
  ];
}

const periodOptions: Array<{ label: string; value: AnalysisPeriod }> = [
  { label: "오늘", value: "today" },
  { label: "7일", value: "week" },
  { label: "이번 달", value: "month" },
  { label: "전체", value: "all" },
];

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
  background: linear-gradient(135deg, #ffe8f2 0%, #fff5f9 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: 0 2px 16px rgba(232, 114, 140, 0.10);
`;

const PeriodTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 4px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const PeriodButton = styled.button<{ $active: boolean }>`
  min-height: 38px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.4px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 400;
  }
`;

const CalendarBadge = styled.div`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  background: rgba(232, 114, 140, 0.10);
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.orange};
`;

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(232, 114, 140, 0.07);
  border: 1px solid rgba(232, 114, 140, 0.12);
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Metric = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  text-align: center;

  & + & {
    border-left: 1px solid rgba(232, 114, 140, 0.15);
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 400;
  }

  strong {
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.4px;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
`;

const IconTile = styled.div`
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 18px;
`;

const Donut = styled.div<{ $gradient: string }>`
  display: grid;
  width: 180px;
  height: 180px;
  place-items: center;
  margin: 0 auto;
  background: conic-gradient(${({ $gradient }) => $gradient});
  border-radius: 50%;

  &::before {
    position: absolute;
    width: 120px;
    height: 120px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 50%;
    content: "";
  }

  span,
  strong {
    position: relative;
    z-index: 1;
  }

  span {
    align-self: end;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 400;
  }

  strong {
    align-self: start;
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
`;

const LegendList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LegendItem = styled.div`
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};

  span {
    font-size: 14px;
    font-weight: 500;
  }

  strong {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.orangeDark};
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 400;
  text-align: center;
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
`;

const ProgressList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProgressItem = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};

  div {
    display: flex;
    justify-content: space-between;

    span {
      font-size: 14px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text};
    }

    strong {
      font-size: 14px;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.orangeDark};
    }
  }
`;

const Track = styled.div`
  height: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const Fill = styled.div<{ $color: string; $value: number }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  background: ${({ $color }) => $color};
  border-radius: inherit;
`;

const MessageCard = styled.div`
  min-height: 108px;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: linear-gradient(135deg, #ffe8f2 0%, #ffd0e4 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
`;
