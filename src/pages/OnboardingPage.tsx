import { Camera, Palette } from "lucide-react";
import styled from "styled-components";

import { ONBOARDING_COPY } from "../constants/copy";
import { petPresets } from "../mocks/appData";
import { PrimaryButton } from "../components/PrimaryButton";

type OnboardingPageProps = {
  onComplete: () => void;
};

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  return (
    <Page>
      <Handle />
      <Title>{ONBOARDING_COPY.title}</Title>
      <Description>{ONBOARDING_COPY.description}</Description>

      <PresetList>
        {petPresets.map((pet) => (
          <PresetButton key={pet.id} $featured={Boolean(pet.featured)} onClick={onComplete}>
            {pet.featured && <Badge>BEST</Badge>}
            <EmojiWrap>{pet.emoji}</EmojiWrap>
            <PetName>{pet.name}</PetName>
          </PresetButton>
        ))}
      </PresetList>

      <Actions>
        <GhostButton onClick={onComplete}>
          <Camera size={22} />
          {ONBOARDING_COPY.photoButton}
        </GhostButton>
        <PrimaryButton onClick={onComplete}>
          <Palette size={24} />
          {ONBOARDING_COPY.presetButton}
        </PrimaryButton>
        <LaterButton onClick={onComplete}>{ONBOARDING_COPY.laterButton}</LaterButton>
      </Actions>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding: 88px 22px 42px;
  background: linear-gradient(160deg, #fff8ef 0%, #ffe8d9 72%, #f5f0df 100%);
`;

const Handle = styled.div`
  width: 70px;
  height: 5px;
  margin: 0 auto 30px;
  background: #ffd0bf;
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.orangeDark};
  font-size: 31px;
  line-height: 1.24;
  font-weight: 900;
`;

const Description = styled.p`
  margin: ${({ theme }) => theme.spacing.xl} 0 60px;
  color: #8d7667;
  font-size: 17px;
  line-height: 1.5;
`;

const PresetList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: 86px;
`;

const PresetButton = styled.button<{ $featured: boolean }>`
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ $featured }) => ($featured ? "0 0 12px" : "18px 0 0")};
  color: ${({ $featured, theme }) => ($featured ? theme.colors.orangeDark : theme.colors.text)};
  background: transparent;
  font-weight: 800;
`;

const Badge = styled.span`
  position: absolute;
  top: -18px;
  right: 4px;
  padding: 6px 10px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
`;

const EmojiWrap = styled.span`
  display: grid;
  width: 84px;
  height: 84px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 44px;
`;

const PetName = styled.span`
  min-height: 44px;
  font-size: 16px;
  line-height: 1.35;
`;

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const GhostButton = styled(PrimaryButton)`
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.orange};
  box-shadow: none;
`;

const LaterButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;
  font-size: 16px;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 6px;
`;
