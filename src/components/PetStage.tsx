import styled, { css, keyframes } from "styled-components";

import type { PetAnimation, PetExpression, ShopItemViewModel, UserPet } from "../types/app";

type PetStageProps = {
  animation?: PetAnimation;
  equippedItem?: ShopItemViewModel;
  expression?: PetExpression;
  pet: UserPet;
  size?: "home" | "compact";
};

export function PetStage({ animation = "idle", equippedItem, expression = "neutral", pet, size = "home" }: PetStageProps) {
  const baseBodyUrl = getBaseBodyUrl(pet.id);
  const imageUrl = baseBodyUrl ?? pet.imageUrl;
  const expressionUrl = baseBodyUrl ? getExpressionPartUrl(pet.id, expression) : null;

  return (
    <Stage $size={size}>
      <Character $animation={animation} $size={size}>
        {imageUrl ? <PetImage src={imageUrl} alt={pet.name} /> : <PetEmoji $size={size}>{pet.emoji}</PetEmoji>}
        {expressionUrl && <ExpressionLayer src={expressionUrl} alt="" aria-hidden="true" />}
        {equippedItem && (
          <ItemLayer $itemId={equippedItem.id} $petId={pet.id} aria-label={`착용 아이템 ${equippedItem.name}`}>
            {renderItemVisual(equippedItem.id, equippedItem.icon)}
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

const ItemLayer = styled.span<{ $itemId: string; $petId: string }>`
  position: absolute;
  display: grid;
  width: 34%;
  height: 34%;
  place-items: center;
  pointer-events: none;
  font-size: clamp(20px, 6vw, 34px);
  line-height: 1;
  text-shadow: 0 4px 14px rgba(58, 36, 44, 0.18);
  z-index: 2;

  ${({ $itemId, $petId }) => getItemPlacement($itemId, $petId)}
`;

const ItemGlyph = styled.span`
  display: block;
  animation: ${itemPop} 220ms ease-out;
`;

const NecklaceVisual = styled.span`
  position: relative;
  display: block;
  width: 58px;
  height: 38px;
  animation: ${itemPop} 220ms ease-out;

  &::before {
    position: absolute;
    top: 2px;
    left: 50%;
    width: 42px;
    height: 26px;
    border-right: 4px solid #de6d8d;
    border-bottom: 4px solid #de6d8d;
    border-left: 4px solid #de6d8d;
    border-radius: 0 0 32px 32px;
    content: "";
    transform: translateX(-50%);
  }

  &::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 13px;
    height: 13px;
    background: linear-gradient(135deg, #ff8aae, #c83c70);
    border-radius: 50% 50% 50% 0;
    box-shadow: 0 2px 8px rgba(200, 60, 112, 0.2);
    content: "";
    transform: translateX(-50%) rotate(-45deg);
  }
`;

const BagVisual = styled.span`
  position: relative;
  display: block;
  width: 40px;
  height: 48px;
  background: linear-gradient(160deg, #ff8f91 0%, #d75d70 100%);
  border: 3px solid rgba(116, 54, 64, 0.18);
  border-radius: 13px 13px 11px 11px;
  box-shadow: 0 7px 16px rgba(58, 36, 44, 0.14);
  animation: ${itemPop} 220ms ease-out;

  &::before {
    position: absolute;
    top: -10px;
    left: 50%;
    width: 21px;
    height: 15px;
    border: 4px solid #d75d70;
    border-bottom: 0;
    border-radius: 14px 14px 0 0;
    content: "";
    transform: translateX(-50%);
  }

  &::after {
    position: absolute;
    top: 16px;
    left: 50%;
    width: 18px;
    height: 4px;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 999px;
    content: "";
    transform: translateX(-50%);
  }
`;

function renderItemVisual(itemId: string, icon: string) {
  if (itemId === "scarf") return <NecklaceVisual />;
  if (itemId === "bag") return <BagVisual />;
  return <ItemGlyph>{icon}</ItemGlyph>;
}

function getExpressionPartUrl(petId: string, expression: PetExpression) {
  if (!["akkigae", "ttoosseunyang"].includes(petId)) return null;

  return `/assets/pet-parts/${petId}/${expression}.svg`;
}

function getBaseBodyUrl(petId: string) {
  if (!["akkigae", "ttoosseunyang"].includes(petId)) return null;

  return `/assets/pets/base-body/${petId}.png`;
}

function getItemPlacement(itemId: string, petId: string) {
  if (itemId === "hat") {
    return css`
      top: -6%;
      left: 50%;
      transform: translateX(-50%) rotate(-3deg) scale(0.92);
    `;
  }

  if (itemId === "crown") {
    return css`
      top: -1%;
      left: 50%;
      transform: translateX(-50%) rotate(-4deg);
    `;
  }

  if (itemId === "sunglasses") {
    return css`
      top: 31%;
      left: 51%;
      transform: translateX(-50%) scale(0.96);
    `;
  }

  if (itemId === "scarf") {
    return css`
      top: 49%;
      left: 51%;
      transform: translateX(-50%) scale(0.78);
    `;
  }

  if (itemId === "ribbon") {
    if (petId === "ttoosseunyang") {
      return css`
        top: 8%;
        right: 19%;
        transform: rotate(20deg) scale(0.78);
      `;
    }

    return css`
      top: 15%;
      right: 17%;
      transform: rotate(18deg) scale(0.82);
    `;
  }

  if (itemId === "bag") {
    return css`
      right: 5%;
      bottom: 31%;
      transform: rotate(8deg) scale(0.72);
      z-index: -1;
    `;
  }

  return css`
    top: 8%;
    right: 10%;
  `;
}
