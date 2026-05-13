import styled, { css, keyframes } from "styled-components";

import { PetItemArt } from "./PetItemArt";
import { getBaseCharacterUrl, getExpressionPartUrl } from "../domain/petCharacterSet";
import { isBackPetItem } from "../domain/petItems";
import type { PetAnimation, PetExpression, ShopItemViewModel, UserPet } from "../types/app";

type PetStageProps = {
  animation?: PetAnimation;
  equippedItem?: ShopItemViewModel;
  expression?: PetExpression;
  pet: UserPet;
  size?: "home" | "compact";
};

export function PetStage({ animation = "idle", equippedItem, expression = "neutral", pet, size = "home" }: PetStageProps) {
  const baseBodyUrl = getBaseCharacterUrl(pet.id);
  const imageUrl = baseBodyUrl ?? pet.imageUrl;
  const expressionUrl = baseBodyUrl ? getExpressionPartUrl(pet.id, expression) : null;

  return (
    <Stage $size={size}>
      <Character $animation={animation} $size={size}>
        {equippedItem && isBackPetItem(equippedItem.id) && (
          <BackItemLayer aria-label={`착용 아이템 ${equippedItem.name}`}>
            <PetItemArt itemId={equippedItem.id} title={equippedItem.name} variant="stage" />
          </BackItemLayer>
        )}
        {imageUrl ? <PetImage src={imageUrl} alt={pet.name} /> : <PetEmoji $size={size}>{pet.emoji}</PetEmoji>}
        {expressionUrl && <ExpressionLayer src={expressionUrl} alt="" aria-hidden="true" />}
        {equippedItem && !isBackPetItem(equippedItem.id) && (
          <ItemLayer aria-label={`착용 아이템 ${equippedItem.name}`}>
            <PetItemArt itemId={equippedItem.id} title={equippedItem.name} variant="stage" />
          </ItemLayer>
        )}
      </Character>
    </Stage>
  );
}

const idle = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-0.5deg);
  }

  50% {
    transform: translateY(-7px) rotate(0.5deg);
  }
`;

const pop = keyframes`
  0% {
    transform: scale(0.96);
  }

  45% {
    transform: scale(1.07) translateY(-6px);
  }

  100% {
    transform: scale(1);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-6px) rotate(-2deg);
  }

  40% {
    transform: translateX(6px) rotate(2deg);
  }

  60% {
    transform: translateX(-4px) rotate(-1deg);
  }

  80% {
    transform: translateX(4px) rotate(1deg);
  }
`;

const sparkle = keyframes`
  0% {
    filter: brightness(1);
    transform: translateY(0) scale(1);
  }

  45% {
    filter: brightness(1.12);
    transform: translateY(-8px) scale(1.04);
  }

  100% {
    filter: brightness(1);
    transform: translateY(0) scale(1);
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

const Character = styled.div<{ $animation: PetAnimation; $size: "home" | "compact" }>`
  position: relative;
  display: grid;
  width: ${({ $size }) => ($size === "home" ? "158px" : "64px")};
  height: ${({ $size }) => ($size === "home" ? "158px" : "64px")};
  place-items: center;
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
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const ExpressionLayer = styled.img`
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transform: translate(-2%, -2.5%);
  user-select: none;
  -webkit-user-drag: none;
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
  z-index: 0;
`;

const ItemLayer = styled(CharacterItemLayer)`
  z-index: 2;
`;
