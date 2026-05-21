import styled, { css, keyframes } from "styled-components";

import { PetItemArt } from "./PetItemArt";
import { getBaseCharacterUrl, getGeneratedOverlayUrl } from "../domain/petCharacterSet";
import { getPetItemLayer } from "../domain/petItems";
import type { AppStats, PetAnimation, PetExpression, ShopItemViewModel, UserPet } from "../types/app";

type PetStageProps = {
  animation?: PetAnimation;
  equippedItem?: ShopItemViewModel;
  expression?: PetExpression;
  pet: UserPet;
  size?: "home" | "compact";
  stats?: Pick<AppStats, "fullness" | "growth" | "mood">;
};

export function PetStage({ animation = "idle", equippedItem, expression = "neutral", pet, size = "home", stats }: PetStageProps) {
  const baseBodyUrl = getBaseCharacterUrl(pet);
  const generatedOverlayUrl = getGeneratedOverlayUrl(pet);
  const imageUrl = baseBodyUrl ?? pet.imageUrl;
  const characterState = getCharacterState(expression, stats);
  const itemLayer = equippedItem ? getPetItemLayer(equippedItem.id) : null;

  return (
    <Stage $size={size}>
      <Character $animation={animation} $scale={characterState.scale} $size={size}>
        {equippedItem && itemLayer === "backdrop" && (
          <BackItemLayer aria-label={`꾸미기 아이템 ${equippedItem.name}`}>
            <PetItemArt itemId={equippedItem.id} title={equippedItem.name} variant="stage" />
          </BackItemLayer>
        )}
        {imageUrl ? <PetImage src={imageUrl} alt={pet.name} /> : <PetEmoji $size={size}>{pet.emoji}</PetEmoji>}
        {generatedOverlayUrl && <GeneratedOverlayLayer src={generatedOverlayUrl} alt="" aria-hidden="true" />}
        <MoodEffect $mood={characterState.effect} aria-hidden="true" />
        {equippedItem && itemLayer === "foreground" && (
          <ItemLayer aria-label={`꾸미기 아이템 ${equippedItem.name}`}>
            <PetItemArt itemId={equippedItem.id} title={equippedItem.name} variant="stage" />
          </ItemLayer>
        )}
      </Character>
    </Stage>
  );
}

function getCharacterState(
  expression: PetExpression,
  stats?: Pick<AppStats, "fullness" | "growth" | "mood">,
): { effect: "angry" | "happy" | "neutral" | "sweat"; scale: number } {
  const fullness = stats?.fullness ?? 80;
  const growth = stats?.growth ?? 70;
  const mood = stats?.mood ?? 80;
  const growthScale = 0.78 + growth * 0.0034;
  const conditionBoost = mood > 80 && fullness > 70 ? 0.06 : 0;
  const conditionPenalty = Math.max(0, 65 - Math.min(mood, fullness)) * 0.004;
  const scale = clamp(growthScale + conditionBoost - conditionPenalty, 0.74, 1.18);

  if (expression === "sad" || expression === "sleepy" || fullness < 45) return { effect: "sweat", scale };
  if (mood < 42) return { effect: "angry", scale };
  if (expression === "happy" || expression === "wink" || mood > 82) return { effect: "happy", scale };

  return { effect: "neutral", scale };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const idle = keyframes`
  0%, 100% {
    translate: 0 0;
    rotate: -0.5deg;
  }

  50% {
    translate: 0 -7px;
    rotate: 0.5deg;
  }
`;

const pop = keyframes`
  0% {
    scale: 0.96;
  }

  45% {
    scale: 1.07;
    translate: 0 -6px;
  }

  100% {
    scale: 1;
  }
`;

const shake = keyframes`
  0%, 100% {
    translate: 0 0;
  }

  20% {
    translate: -6px 0;
    rotate: -2deg;
  }

  40% {
    translate: 6px 0;
    rotate: 2deg;
  }

  60% {
    translate: -4px 0;
    rotate: -1deg;
  }

  80% {
    translate: 4px 0;
    rotate: 1deg;
  }
`;

const sparkle = keyframes`
  0% {
    filter: brightness(1);
    scale: 1;
    translate: 0 0;
  }

  45% {
    filter: brightness(1.12);
    scale: 1.04;
    translate: 0 -8px;
  }

  100% {
    filter: brightness(1);
    scale: 1;
    translate: 0 0;
  }
`;

const itemPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.6) rotate(-8deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const CharacterItemLayer = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;

  svg {
    animation: ${itemPop} 220ms ease-out;
  }
`;

const Stage = styled.div<{ $size: "home" | "compact" }>`
  position: relative;
  display: grid;
  width: ${({ $size }) => ($size === "home" ? "210px" : "76px")};
  height: ${({ $size }) => ($size === "home" ? "210px" : "76px")};
  place-items: center;
  background: ${({ theme }) =>
    `radial-gradient(circle, ${theme.colors.surface} 0%, ${theme.colors.surfaceWarm} 72%, rgba(255,255,255,0) 73%)`};
  border-radius: 50%;
`;

const Character = styled.div<{ $animation: PetAnimation; $scale: number; $size: "home" | "compact" }>`
  position: relative;
  display: grid;
  width: ${({ $size }) => ($size === "home" ? "158px" : "64px")};
  height: ${({ $size }) => ($size === "home" ? "158px" : "64px")};
  place-items: center;
  scale: ${({ $scale }) => $scale};
  transform-origin: 50% 82%;

  ${({ $animation }) =>
    $animation === "idle" &&
    css`
      animation: ${idle} 3.2s ease-in-out infinite;
    `}

  ${({ $animation }) =>
    $animation === "pop" &&
    css`
      animation: ${pop} 620ms cubic-bezier(0.2, 0.9, 0.2, 1);
    `}

  ${({ $animation }) =>
    $animation === "shake" &&
    css`
      animation: ${shake} 520ms ease-in-out;
    `}

  ${({ $animation }) =>
    $animation === "sparkle" &&
    css`
      animation: ${sparkle} 780ms ease-in-out;
    `}
`;

const PetImage = styled.img`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const GeneratedOverlayLayer = styled.img`
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;

const MoodEffect = styled.span<{ $mood: "angry" | "happy" | "neutral" | "sweat" }>`
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;

  ${({ $mood }) =>
    $mood === "happy" &&
    css`
      &::before,
      &::after {
        position: absolute;
        color: #f16f97;
        content: "♥";
        filter: drop-shadow(0 5px 8px rgba(213, 76, 112, 0.18));
      }

      &::before {
        top: 10%;
        left: 16%;
        font-size: 28px;
        rotate: -12deg;
      }

      &::after {
        top: 3%;
        right: 16%;
        font-size: 20px;
        rotate: 16deg;
      }
    `}

  ${({ $mood }) =>
    $mood === "sweat" &&
    css`
      &::before,
      &::after {
        position: absolute;
        width: 24px;
        height: 34px;
        background: #54c4ee;
        border-radius: 70% 70% 74% 74%;
        content: "";
        filter: drop-shadow(0 3px 4px rgba(54, 151, 199, 0.16));
        transform: rotate(25deg);
      }

      &::before {
        top: 10%;
        right: 18%;
      }

      &::after {
        top: 28%;
        right: 7%;
        width: 17px;
        height: 25px;
        opacity: 0.82;
      }
    `}

  ${({ $mood }) =>
    $mood === "angry" &&
    css`
      &::before {
        position: absolute;
        top: 3%;
        right: 13%;
        color: #ff352e;
        content: "♨";
        filter: drop-shadow(0 3px 0 rgba(74, 16, 16, 0.18));
        font-size: 38px;
        font-weight: 900;
        rotate: 8deg;
      }
    `}
`;

const PetEmoji = styled.span<{ $size: "home" | "compact" }>`
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  font-size: ${({ $size }) => ($size === "home" ? "72px" : "34px")};
`;

const BackItemLayer = styled(CharacterItemLayer)`
  z-index: 1;
`;

const ItemLayer = styled(CharacterItemLayer)`
  z-index: 5;
`;
