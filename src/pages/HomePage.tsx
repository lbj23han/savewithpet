import { Calendar, PlusCircle } from "lucide-react";
import styled from "styled-components";

import { Panel } from "../components/Panel";
import { PrimaryButton } from "../components/PrimaryButton";
import { HOME_COPY } from "../constants/copy";
import { createPetStatusViewModels } from "../domain/petProgress";
import { petStatuses, todaySummary } from "../mocks/appData";

type HomePageProps = {
  onRecord: () => void;
};

export function HomePage({ onRecord }: HomePageProps) {
  const statusRows = createPetStatusViewModels(petStatuses);

  return (
    <Page>
      <Hero>
        <NameRow>
          <PetName>{HOME_COPY.petName}</PetName>
          <Level>{HOME_COPY.level}</Level>
        </NameRow>
        <Speech>{HOME_COPY.message}</Speech>
        <PetPortrait>
          <PetFace>🐶</PetFace>
        </PetPortrait>
      </Hero>

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
          <h2>{HOME_COPY.summaryTitle}</h2>
          <Calendar size={23} />
        </SummaryHeader>
        <Metrics>
          {todaySummary.map((metric) => (
            <Metric key={metric.label} $tone={metric.tone}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </Metric>
          ))}
        </Metrics>
      </Panel>

      <PrimaryButton onClick={onRecord}>
        <PlusCircle size={25} />
        {HOME_COPY.recordButton}
      </PrimaryButton>
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
  font-size: 23px;
  font-weight: 900;
`;

const Level = styled.span`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.orangeDark};
  font-weight: 900;
`;

const Speech = styled.div`
  position: relative;
  padding: 16px 22px;
  color: ${({ theme }) => theme.colors.purple};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 20px;
  font-style: italic;
  font-weight: 900;
  text-align: center;

  &::after {
    position: absolute;
    right: 50%;
    bottom: -16px;
    width: 28px;
    height: 28px;
    background: inherit;
    content: "";
    transform: translateX(50%) rotate(45deg);
  }
`;

const PetPortrait = styled.div`
  display: grid;
  width: 220px;
  height: 220px;
  place-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: radial-gradient(circle, #fff4c8 0%, #d9d0ca 74%);
  border-radius: 50%;
`;

const PetFace = styled.div`
  display: grid;
  width: 150px;
  height: 150px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 32px;
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 82px;
`;

const StatusPanel = styled(Panel)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr 48px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusLabel = styled.span`
  color: #514942;
  font-size: 17px;
  font-weight: 900;
`;

const Track = styled.div`
  height: 16px;
  overflow: hidden;
  background: #f3f1ef;
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const Fill = styled.div<{ $value: number; $tone: "orange" | "purple" | "green" }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  background: ${({ $tone, theme }) =>
    $tone === "orange" ? theme.colors.orange : $tone === "purple" ? theme.colors.purpleSoft : theme.colors.green};
  border-radius: inherit;
`;

const StatusValue = styled.strong<{ $tone: "orange" | "purple" | "green" }>`
  color: ${({ $tone, theme }) =>
    $tone === "orange" ? theme.colors.orangeDark : $tone === "purple" ? theme.colors.purple : theme.colors.green};
  text-align: right;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h2 {
    margin: 0;
    font-size: 24px;
  }

  svg {
    color: #cfc8c2;
  }
`;

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const Metric = styled.div<{ $tone: "red" | "green" | "purple" }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  text-align: center;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.line};
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 900;
  }

  strong {
    color: ${({ $tone, theme }) =>
      $tone === "red" ? theme.colors.red : $tone === "green" ? theme.colors.green : theme.colors.purple};
    font-size: 20px;
  }
`;
