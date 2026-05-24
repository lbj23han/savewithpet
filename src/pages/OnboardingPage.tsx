import { Camera, Palette } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import { ONBOARDING_COPY } from "../constants/copy";
import { AI_CHARACTER_GENERATION_COUNT, AI_CHARACTER_GENERATION_PRICE_KRW } from "../domain/aiCharacterPolicy";
import { createPetFromPreset, createSkippedPet } from "../domain/avatarGenerator";
import { petPresets } from "../mocks/appData";
import { PrimaryButton } from "../components/PrimaryButton";
import type { PetPreset, UserPet } from "../types/app";

type OnboardingPageProps = {
  onComplete: (pet: UserPet) => void;
};

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const defaultPreset = petPresets.find((pet) => pet.featured) ?? petPresets[0];
  const [selectedPreset, setSelectedPreset] = useState<PetPreset>(defaultPreset);
  const [petName, setPetName] = useState(defaultPreset.name);

  const selectPreset = (preset: PetPreset) => {
    setSelectedPreset(preset);
    setPetName(preset.name);
  };

  const completeWithPreset = () => {
    const pet = createPetFromPreset(selectedPreset);
    onComplete({ ...pet, name: petName.trim().slice(0, 12) || selectedPreset.name });
  };

  return (
    <Page>
      <Handle />
      <Title>{ONBOARDING_COPY.title}</Title>
      <Description>{ONBOARDING_COPY.description}</Description>

      <PhotoInfo>
        <Camera size={20} />
        <div>
          <strong>내 반려동물 사진으로 캐릭터를 만들 수 있어요!</strong>
          <span>
            사진 기반 AI 캐릭터 생성은 시작 후 캐릭터 상점에서 {AI_CHARACTER_GENERATION_COUNT}회{" "}
            {AI_CHARACTER_GENERATION_PRICE_KRW.toLocaleString("ko-KR")}원 상품으로 이용할 수 있어요.
          </span>
        </div>
      </PhotoInfo>

      <PresetList>
        {petPresets.map((pet) => (
          <PresetButton
            key={pet.id}
            $featured={Boolean(pet.featured)}
            $selected={selectedPreset.id === pet.id}
            onClick={() => selectPreset(pet)}
          >
            {pet.featured && <Badge>BEST</Badge>}
            <ImageWrap>
              <PresetImage src={pet.imageUrl} alt={pet.name} />
            </ImageWrap>
            <PetName>{pet.name}</PetName>
            <PetTrait>{pet.trait}</PetTrait>
          </PresetButton>
        ))}
      </PresetList>

      <NamePanel>
        <label htmlFor="pet-name">이름을 지어주세요</label>
        <NameInput
          id="pet-name"
          maxLength={12}
          placeholder={selectedPreset.name}
          value={petName}
          onChange={(event) => setPetName(event.target.value)}
        />
      </NamePanel>

      <Actions>
        <PrimaryButton onClick={completeWithPreset}>
          <Palette size={20} />
          이 이름으로 시작하기
        </PrimaryButton>
        <LaterButton onClick={() => onComplete(createSkippedPet())}>{ONBOARDING_COPY.laterButton}</LaterButton>
      </Actions>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding: 80px 22px 40px;
  background: linear-gradient(160deg, #fff8fb 0%, #fff0f6 55%, #fde8f2 100%);
`;

const Handle = styled.div`
  width: 60px;
  height: 4px;
  margin: 0 auto 28px;
  background: ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 28px;
  font-weight: 700;
  line-height: 1.24;
  letter-spacing: -0.5px;

  em {
    color: ${({ theme }) => theme.colors.orange};
    font-style: normal;
  }
`;

const Description = styled.p`
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
`;

const PhotoInfo = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: 48px;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  svg {
    width: 36px;
    height: 36px;
    padding: 8px;
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border-radius: 50%;
  }

  div {
    display: grid;
    gap: 4px;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    line-height: 1.45;
  }
`;

const PresetList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: end;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: 72px;
`;

const PresetButton = styled.button<{ $featured: boolean; $selected: boolean }>`
  position: relative;
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 210px;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ $featured, theme }) => ($featured ? theme.colors.orange : theme.colors.text)};
  background: rgba(255, 255, 255, 0.72);
  border: 1.5px solid ${({ $selected, theme }) => ($selected ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-weight: 600;
`;

const NamePanel = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: -48px 0 ${({ theme }) => theme.spacing.xl};

  label {
    color: ${({ theme }) => theme.colors.text};
    font-size: 15px;
    font-weight: 700;
  }
`;

const NameInput = styled.input`
  width: 100%;
  min-height: 52px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
  background: rgba(255, 255, 255, 0.84);
  border: 1.5px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 18px;
  font-weight: 700;

  &:focus {
    border-color: ${({ theme }) => theme.colors.orange};
    outline: none;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -16px;
  right: 4px;
  padding: 5px 10px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 11px;
  font-weight: 700;
`;

const ImageWrap = styled.span`
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: 50%;
`;

const PresetImage = styled.img`
  width: 86px;
  height: 86px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const PetName = styled.span`
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
`;

const PetTrait = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  word-break: keep-all;
`;

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LaterButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;
  font-size: 15px;
  font-weight: 400;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 5px;
`;
