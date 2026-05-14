import type { PetEyesAnchor, PetWearableAnchors, UserPet } from "../types/app";

export const STANDARD_CHARACTER_TEMPLATE_ID = "standard-v1" as const;

export const CHARACTER_TEMPLATE_VIEWBOX = 1254;
export const STANDARD_CHARACTER_PLACEHOLDER_IMAGE_URL = "/assets/pets/akkigae.svg";

export const STANDARD_WEARABLE_PROFILE: PetWearableAnchors = {
  back: { x: 627, y: 732, width: 610 },
  chest: { x: 638, y: 772, width: 150 },
  eyes: { x: 647, y: 506, width: 210, left: { x: 542, y: 506 }, right: { x: 752, y: 506 } },
  head: { x: 627, y: 356, width: 292 },
};

export const DEFAULT_WEARABLE_ANCHORS = STANDARD_WEARABLE_PROFILE;

export const PRESET_WEARABLE_ANCHORS: Record<string, PetWearableAnchors> = {
  akkigae: STANDARD_WEARABLE_PROFILE,
  kangchongmu: STANDARD_WEARABLE_PROFILE,
  ttoosseunyang: STANDARD_WEARABLE_PROFILE,
};

export const STANDARD_CHARACTER_TEMPLATE_CONTRACT = {
  canvas: {
    viewBox: CHARACTER_TEMPLATE_VIEWBOX,
  },
  lockedStructure: [
    "front-facing standing pose",
    "fixed body size and framing",
    "fixed face center, eye centers, head top, chest center, and back center",
    "visual traits may change color, ears, tail, nose color, markings, and fur texture only",
  ],
  wearableProfile: STANDARD_WEARABLE_PROFILE,
} as const;

// SVG 좌표계(0 0 1254 1254) 기준 선글라스 렌즈 중심 위치
const SVG_SUNGLASSES_LEFT_EYE = { x: 530, y: 560 };
const SVG_SUNGLASSES_RIGHT_EYE = { x: 764, y: 560 };
const SVG_SUNGLASSES_MID = { x: 647, y: 560 };
const SVG_SUNGLASSES_EYE_DIST = 234; // 두 렌즈 중심 간 거리

function getSunglassesTransform(eyes: PetEyesAnchor): string {
  const lx = eyes.left?.x ?? eyes.x - eyes.width * 0.31;
  const ly = eyes.left?.y ?? eyes.y;
  const rx = eyes.right?.x ?? eyes.x + eyes.width * 0.31;
  const ry = eyes.right?.y ?? eyes.y;

  const mx = (lx + rx) / 2;
  const my = (ly + ry) / 2;
  const dist = Math.sqrt((rx - lx) ** 2 + (ry - ly) ** 2);
  const s = dist / SVG_SUNGLASSES_EYE_DIST;
  const angle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

  return [
    `translate(${mx} ${my})`,
    `rotate(${angle})`,
    `scale(${s})`,
    `translate(${-SVG_SUNGLASSES_MID.x} ${-SVG_SUNGLASSES_MID.y})`,
  ].join(" ");
}

const ITEM_PLACEMENTS = {
  crown: {
    anchor: "head",
    fitWidth: 272,
    offset: { x: 0, y: -24 },
    reference: { x: 633, y: 397 },
    referenceWidth: 391,
    scale: 1,
  },
  hat: {
    anchor: "head",
    fitWidth: 292,
    offset: { x: 0, y: -22 },
    reference: { x: 632, y: 390 },
    referenceWidth: 360,
    scale: 1,
  },
  ribbon: {
    anchor: "head",
    fitWidth: 148,
    offset: { x: 108, y: 34 },
    reference: { x: 676, y: 376 },
    referenceWidth: 360,
    scale: 1,
  },
  scarf: {
    anchor: "chest",
    fitWidth: 82,
    offset: { x: 0, y: 0 },
    reference: { x: 638, y: 744 },
    referenceWidth: 113,
    scale: 1,
  },
  wings: {
    anchor: "back",
    fitWidth: 560,
    offset: { x: 0, y: 22 },
    reference: { x: 627, y: 700 },
    referenceWidth: 1100,
    scale: 1,
  },
} as const;

export function getPetWearableAnchors(pet: Pick<UserPet, "id" | "wearableAnchors">): PetWearableAnchors {
  return pet.wearableAnchors ?? PRESET_WEARABLE_ANCHORS[pet.id] ?? DEFAULT_WEARABLE_ANCHORS;
}

export function getItemAnchorTransform({
  anchors,
  itemId,
  variant,
}: {
  anchors?: PetWearableAnchors;
  itemId: string;
  variant: "stage" | "preview";
}): string | undefined {
  if (variant !== "stage" || !anchors) return undefined;

  if (itemId === "sunglasses") {
    return getSunglassesTransform(anchors.eyes);
  }

  const placement = ITEM_PLACEMENTS[itemId as keyof typeof ITEM_PLACEMENTS] ?? ITEM_PLACEMENTS.scarf;
  const target = anchors[placement.anchor];
  const targetWidth = target.width ?? placement.fitWidth;
  const fittedScale = placement.fitWidth / placement.referenceWidth;
  const anchorScale = targetWidth / placement.fitWidth;
  const scale = (target.scale ?? 1) * anchorScale * fittedScale * placement.scale;
  const x = target.x + placement.offset.x;
  const y = target.y + placement.offset.y;

  return [
    `translate(${x} ${y})`,
    `scale(${scale})`,
    `translate(${-placement.reference.x} ${-placement.reference.y})`,
  ].join(" ");
}

// 선글라스 SVG 기준점 (calibration 툴 공유용)
export const SUNGLASSES_SVG_REFS = {
  leftEye: SVG_SUNGLASSES_LEFT_EYE,
  rightEye: SVG_SUNGLASSES_RIGHT_EYE,
  mid: SVG_SUNGLASSES_MID,
  eyeDist: SVG_SUNGLASSES_EYE_DIST,
};
