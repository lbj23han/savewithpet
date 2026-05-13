import styled from "styled-components";

import { getItemAnchorTransform } from "../domain/petWearableAnchors";
import type { PetWearableAnchors } from "../types/app";

type PetItemArtProps = {
  anchors?: PetWearableAnchors;
  itemId: string;
  title?: string;
  variant?: "stage" | "preview";
};

export function PetItemArt({ anchors, itemId, title, variant = "preview" }: PetItemArtProps) {
  const itemTransform = getItemAnchorTransform({ anchors, itemId, variant });

  return (
    <ItemSvg
      $variant={variant}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : "presentation"}
      viewBox="0 0 1254 1254"
    >
      {title && <title>{title}</title>}
      <g transform={itemTransform}>{renderItemPaths(itemId)}</g>
    </ItemSvg>
  );
}

function renderItemPaths(itemId: string) {
  if (itemId === "hat") return <HatPaths />;
  if (itemId === "scarf") return <NecklacePaths />;
  if (itemId === "crown") return <CrownPaths />;
  if (itemId === "sunglasses") return <SunglassesPaths />;
  if (itemId === "ribbon") return <RibbonPaths />;
  if (itemId === "wings") return <WingPaths />;

  return <SparkleCharmPaths />;
}

function HatPaths() {
  return (
    <g transform="translate(0 -20) rotate(-4 627 322)">
      <ellipse cx="632" cy="390" rx="226" ry="42" fill="#3a3134" opacity="0.22" />
      <path d="M475 283C492 216 538 176 622 176C707 176 756 218 776 283L795 364H454L475 283Z" fill="#4b4046" />
      <path d="M497 278C513 231 551 205 621 205C693 205 731 232 750 279L762 332H484L497 278Z" fill="#64575d" />
      <path d="M452 338C514 320 735 320 800 338C830 346 837 385 807 400C738 434 518 434 447 400C417 386 423 346 452 338Z" fill="#3a3134" />
      <path d="M484 335H763L753 376H493L484 335Z" fill="#ef8aa1" />
      <path d="M510 344C571 356 687 356 744 344" stroke="#ffd7df" strokeWidth="12" strokeLinecap="round" opacity="0.72" />
    </g>
  );
}

function NecklacePaths() {
  return (
    <g transform="translate(0 24)">
      <ellipse cx="638" cy="760" rx="54" ry="18" fill="#8d4a55" opacity="0.13" />
      <path
        d="M638 709C617 688 582 705 582 734C582 762 610 779 638 806C667 779 695 762 695 734C695 705 659 688 638 709Z"
        fill="#f25f88"
      />
      <path d="M609 729C616 716 632 715 640 726" stroke="#ffd6df" strokeLinecap="round" strokeWidth="9" opacity="0.85" />
      <circle cx="638" cy="703" r="12" fill="#cf4e72" />
      <path d="M638 691V666" stroke="#cf4e72" strokeLinecap="round" strokeWidth="10" />
    </g>
  );
}

function CrownPaths() {
  return (
    <g transform="translate(0 -28) rotate(-5 632 308)">
      <path d="M438 396L480 225L580 352L632 197L688 352L784 225L829 396H438Z" fill="#f5b83b" />
      <path d="M466 366H801L787 432H480L466 366Z" fill="#df8f24" />
      <path d="M480 225L580 352L632 197L688 352L784 225L800 289C716 326 549 326 464 289L480 225Z" fill="#ffd25e" />
      <circle cx="480" cy="224" r="30" fill="#ffcf57" />
      <circle cx="632" cy="197" r="32" fill="#ffcf57" />
      <circle cx="784" cy="224" r="30" fill="#ffcf57" />
      <ellipse cx="633" cy="397" rx="51" ry="22" fill="#fff3b0" opacity="0.55" />
    </g>
  );
}

function SunglassesPaths() {
  return (
    <g>
      <path d="M482 515C526 498 584 503 620 523L610 571C601 609 548 622 506 602C470 585 458 544 482 515Z" fill="#28252d" />
      <path d="M674 523C710 503 768 498 812 515C836 544 824 585 788 602C746 622 693 609 684 571L674 523Z" fill="#28252d" />
      <path d="M612 535C630 525 654 525 672 535" stroke="#28252d" strokeLinecap="round" strokeWidth="18" />
      <path d="M493 517C528 508 574 511 604 526" stroke="#6f6873" strokeLinecap="round" strokeWidth="9" opacity="0.5" />
      <path d="M690 526C720 511 766 508 801 517" stroke="#6f6873" strokeLinecap="round" strokeWidth="9" opacity="0.5" />
      <path d="M511 531C539 520 570 522 593 533" stroke="#ffffff" strokeLinecap="round" strokeWidth="8" opacity="0.2" />
    </g>
  );
}

function RibbonPaths() {
  return (
    <g transform="translate(120 -18) rotate(17 746 360)">
      <path d="M657 369C603 326 540 306 494 330C459 349 461 407 498 424C543 445 604 419 657 382V369Z" fill="#ef7094" />
      <path d="M694 369C748 326 811 306 857 330C892 349 890 407 853 424C808 445 747 419 694 382V369Z" fill="#ef7094" />
      <rect x="638" y="339" width="75" height="75" rx="22" fill="#d94e7c" />
      <path d="M514 347C557 342 602 357 641 377" stroke="#ffd0dc" strokeLinecap="round" strokeWidth="13" opacity="0.65" />
      <path d="M838 347C795 342 750 357 711 377" stroke="#ffd0dc" strokeLinecap="round" strokeWidth="13" opacity="0.65" />
    </g>
  );
}

function WingPaths() {
  return (
    <g opacity="0.82">
      <path
        d="M292 420C178 444 93 521 78 626C64 725 130 797 237 785C310 777 366 728 409 658C362 648 324 617 302 573C281 531 277 476 292 420Z"
        fill="#f6fbff"
      />
      <path
        d="M962 420C1076 444 1161 521 1176 626C1190 725 1124 797 1017 785C944 777 888 728 845 658C892 648 930 617 952 573C973 531 977 476 962 420Z"
        fill="#f6fbff"
      />
      <path d="M128 632C215 634 315 600 386 536" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="26" opacity="0.78" />
      <path d="M154 716C240 704 331 656 404 590" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="22" opacity="0.72" />
      <path d="M1126 632C1039 634 939 600 868 536" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="26" opacity="0.78" />
      <path d="M1100 716C1014 704 923 656 850 590" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="22" opacity="0.72" />
      <path
        d="M288 435C186 458 109 527 97 624C86 710 143 769 238 767C306 765 363 722 402 658"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="20"
        opacity="0.72"
      />
      <path
        d="M966 435C1068 458 1145 527 1157 624C1168 710 1111 769 1016 767C948 765 891 722 852 658"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="20"
        opacity="0.72"
      />
    </g>
  );
}

function SparkleCharmPaths() {
  return (
    <g>
      <path d="M628 278L665 520L909 559L665 598L628 840L591 598L347 559L591 520L628 278Z" fill="#ffcf57" />
      <path d="M849 274L867 391L984 409L867 427L849 544L831 427L714 409L831 391L849 274Z" fill="#f58aa6" />
    </g>
  );
}

const ItemSvg = styled.svg<{ $variant: "stage" | "preview" }>`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  ${({ $variant }) => $variant === "preview" && "filter: drop-shadow(0 5px 8px rgba(58, 36, 44, 0.12));"}
`;
