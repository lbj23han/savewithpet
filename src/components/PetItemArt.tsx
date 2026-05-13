import styled from "styled-components";

type PetItemArtProps = {
  itemId: string;
  title?: string;
  variant?: "stage" | "preview";
};

export function PetItemArt({ itemId, title, variant = "preview" }: PetItemArtProps) {
  return (
    <ItemSvg
      $variant={variant}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : "presentation"}
      viewBox="0 0 1254 1254"
    >
      {title && <title>{title}</title>}
      {renderItemPaths(itemId)}
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
    <g>
      <path
        d="M496 664C525 733 588 771 637 771C686 771 749 733 778 664"
        fill="none"
        stroke="#dd6b8a"
        strokeLinecap="round"
        strokeWidth="34"
      />
      <path
        d="M556 681C577 719 613 742 637 742C662 742 697 719 718 681"
        fill="none"
        stroke="#ffb3c6"
        strokeLinecap="round"
        strokeWidth="12"
        opacity="0.82"
      />
      <path
        d="M638 777C606 745 554 771 554 815C554 857 596 883 638 924C681 883 723 857 723 815C723 771 670 745 638 777Z"
        fill="#f25f88"
      />
      <path d="M595 803C605 785 629 783 640 800" stroke="#ffd6df" strokeLinecap="round" strokeWidth="12" opacity="0.8" />
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
      <path d="M447 500C503 478 570 484 615 506L601 585C586 628 522 639 475 616C436 597 420 537 447 500Z" fill="#28252d" />
      <path d="M681 506C725 484 792 478 849 500C875 537 860 597 820 616C773 639 709 628 695 585L681 506Z" fill="#28252d" />
      <path d="M608 519C628 508 653 508 675 519" stroke="#28252d" strokeLinecap="round" strokeWidth="24" />
      <path d="M465 503C507 491 560 496 594 512" stroke="#69616c" strokeLinecap="round" strokeWidth="12" opacity="0.55" />
      <path d="M704 512C738 496 791 491 833 503" stroke="#69616c" strokeLinecap="round" strokeWidth="12" opacity="0.55" />
      <path d="M487 520C520 507 553 511 581 524" stroke="#ffffff" strokeLinecap="round" strokeWidth="12" opacity="0.22" />
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
    <g opacity="0.96">
      <path
        d="M323 419C219 435 139 503 117 598C95 692 143 768 241 779C326 789 413 737 476 660C431 650 389 627 358 593C324 554 310 497 323 419Z"
        fill="#f6fbff"
      />
      <path
        d="M931 419C1035 435 1115 503 1137 598C1159 692 1111 768 1013 779C928 789 841 737 778 660C823 650 865 627 896 593C930 554 944 497 931 419Z"
        fill="#f6fbff"
      />
      <path d="M165 605C244 612 339 593 430 527" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="28" opacity="0.82" />
      <path d="M181 699C258 698 357 656 463 580" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="24" opacity="0.78" />
      <path d="M1089 605C1010 612 915 593 824 527" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="28" opacity="0.82" />
      <path d="M1073 699C996 698 897 656 791 580" stroke="#c9e2f1" strokeLinecap="round" strokeWidth="24" opacity="0.78" />
      <path
        d="M318 432C219 451 145 514 126 598C107 684 150 752 241 763C321 773 409 724 468 653"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="20"
        opacity="0.72"
      />
      <path
        d="M936 432C1035 451 1109 514 1128 598C1147 684 1104 752 1013 763C933 773 845 724 786 653"
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
