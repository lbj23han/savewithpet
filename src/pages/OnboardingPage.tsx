import { Camera, Palette } from "lucide-react";
import { useRef, useState } from "react";
import styled from "styled-components";

import { ONBOARDING_COPY } from "../constants/copy";
import { createPetFromPhoto, createPetFromPreset, createSkippedPet } from "../domain/avatarGenerator";
import { petPresets } from "../mocks/appData";
import { PrimaryButton } from "../components/PrimaryButton";
import type { UserPet } from "../types/app";

type OnboardingPageProps = {
  onComplete: (pet: UserPet) => void;
};

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<UserPet | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreview(createPetFromPhoto(file, reader.result));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Page>
      <Handle />
      <Title>{ONBOARDING_COPY.title}</Title>
      <Description>{ONBOARDING_COPY.description}</Description>

      {photoPreview && (
        <GeneratedPreview>
          <GeneratedImage src={photoPreview.imageUrl} alt="업로드한 반려동물" />
          <div>
            <strong>{photoPreview.name}</strong>
            <span>{photoPreview.trait}</span>
          </div>
          <button onClick={() => onComplete(photoPreview)}>이 캐릭터로 시작</button>
        </GeneratedPreview>
      )}

      <PresetList>
        {petPresets.map((pet) => (
          <PresetButton key={pet.id} $featured={Boolean(pet.featured)} onClick={() => onComplete(createPetFromPreset(pet))}>
            {pet.featured && <Badge>BEST</Badge>}
            <EmojiWrap>{pet.emoji}</EmojiWrap>
            <PetName>{pet.name}</PetName>
          </PresetButton>
        ))}
      </PresetList>

      <Actions>
        <HiddenFileInput ref={fileInputRef} accept="image/*" type="file" onChange={handlePhotoChange} />
        <GhostButton onClick={() => fileInputRef.current?.click()}>
          <Camera size={20} />
          {ONBOARDING_COPY.photoButton}
        </GhostButton>
        <PrimaryButton onClick={() => onComplete(createPetFromPreset(petPresets.find((pet) => pet.featured) ?? petPresets[0]))}>
          <Palette size={20} />
          {ONBOARDING_COPY.presetButton}
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
  margin: ${({ theme }) => theme.spacing.lg} 0 52px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
`;

const PresetList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: 72px;
`;

const GeneratedPreview = styled.section`
  display: grid;
  grid-template-columns: 66px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.80);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
  backdrop-filter: blur(8px);

  div {
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  strong {
    font-size: 16px;
    font-weight: 600;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 400;
  }

  button {
    grid-column: 1 / -1;
    min-height: 40px;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.orange};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 15px;
    font-weight: 600;
  }
`;

const GeneratedImage = styled.img`
  width: 66px;
  height: 66px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const PresetButton = styled.button<{ $featured: boolean }>`
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ $featured }) => ($featured ? "0 0 12px" : "18px 0 0")};
  color: ${({ $featured, theme }) => ($featured ? theme.colors.orange : theme.colors.text)};
  background: transparent;
  font-weight: 600;
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

const EmojiWrap = styled.span`
  display: grid;
  width: 80px;
  height: 80px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: 42px;
`;

const PetName = styled.span`
  min-height: 40px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
`;

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const GhostButton = styled(PrimaryButton)`
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.orange};
  box-shadow: none;
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
