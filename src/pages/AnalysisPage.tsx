import styled from "styled-components";

import { Panel } from "../components/Panel";
import { ANALYSIS_COPY } from "../constants/copy";
import { analysisCategories, goalProgress } from "../mocks/appData";

export function AnalysisPage() {
  return (
    <Page>
      <Hero>
        <TitleRow>
          <div>
            <h1>{ANALYSIS_COPY.title}</h1>
            <span>{ANALYSIS_COPY.period}</span>
          </div>
          <CalendarBadge>▣</CalendarBadge>
        </TitleRow>
        <HeroMetrics>
          <Metric>
            <span>총지출</span>
            <strong>1,240k</strong>
          </Metric>
          <Metric>
            <span>목표</span>
            <strong>1,500k</strong>
          </Metric>
          <Metric>
            <span>달성률</span>
            <strong>82%</strong>
          </Metric>
        </HeroMetrics>
      </Hero>

      <Panel>
        <SectionTitle>
          <IconTile>🍕</IconTile>
          <h2>카테고리별 지출</h2>
        </SectionTitle>
        <Donut $colors={analysisCategories.map((category) => category.color)}>
          <span>{ANALYSIS_COPY.donutCenterLabel}</span>
          <strong>식비</strong>
        </Donut>
      </Panel>

      <Panel>
        <LegendList>
          {analysisCategories.map((category) => (
            <LegendItem key={category.label}>
              <Dot $color={category.color} />
              <span>{category.label}</span>
              <strong>{category.value}%</strong>
            </LegendItem>
          ))}
        </LegendList>
      </Panel>

      <Panel>
        <SectionTitle>
          <IconTile>🌱</IconTile>
          <h2>{ANALYSIS_COPY.goalTitle}</h2>
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

      <MessageCard>{ANALYSIS_COPY.encouragement}</MessageCard>
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.purple};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    font-size: 24px;
  }

  span {
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    font-weight: 700;
  }
`;

const CalendarBadge = styled.div`
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  background: rgba(255, 255, 255, 0.14);
  border-radius: ${({ theme }) => theme.radius.md};
`;

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Metric = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  text-align: center;

  & + & {
    border-left: 1px solid rgba(255, 255, 255, 0.16);
  }

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h2 {
    margin: 0;
    font-size: 21px;
  }
`;

const IconTile = styled.div`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  background: #fff2e7;
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Donut = styled.div<{ $colors: string[] }>`
  display: grid;
  width: 184px;
  height: 184px;
  place-items: center;
  margin: 0 auto;
  background: conic-gradient(
    ${({ $colors }) => `${$colors[0]} 0 40%, ${$colors[1]} 40% 65%, ${$colors[2]} 65% 85%, ${$colors[3]} 85% 100%`}
  );
  border-radius: 50%;

  &::before {
    position: absolute;
    width: 124px;
    height: 124px;
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
    color: #9a776b;
    font-size: 13px;
  }

  strong {
    align-self: start;
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 20px;
  }
`;

const LegendList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LegendItem = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
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
  }
`;

const Track = styled.div`
  height: 12px;
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
  min-height: 116px;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.surface};
  background: linear-gradient(180deg, rgba(41, 38, 34, 0.08), rgba(35, 31, 28, 0.52)), #d7c9a7;
  border-radius: ${({ theme }) => theme.radius.xl};
  font-weight: 900;
`;
