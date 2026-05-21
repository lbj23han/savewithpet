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
      <g transform={variant === "preview" ? "translate(0 40) scale(1)" : undefined}>{renderItemPaths(itemId)}</g>
    </ItemSvg>
  );
}

function renderItemPaths(itemId: string) {
  if (itemId === "canola-garden") return <CanolaGardenPaths />;
  if (itemId === "cozy-cushion") return <CozyCushionPaths />;
  if (itemId === "heart-aura") return <HeartAuraPaths />;
  if (itemId === "coin-shower") return <CoinShowerPaths />;
  if (itemId === "sparkle-sticker") return <SparkleStickerPaths />;
  if (itemId === "saving-sprout") return <SavingSproutPaths />;

  return <SparkleStickerPaths />;
}

function CanolaGardenPaths() {
  return (
    <g>
      <defs>
        <linearGradient id="canola-sky" x1="0" x2="0" y1="180" y2="1000" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dff6ff" />
          <stop offset="0.55" stopColor="#fff8dc" />
          <stop offset="1" stopColor="#e9f8d8" />
        </linearGradient>
        <linearGradient id="canola-field" x1="0" x2="0" y1="650" y2="1040" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff2a3" />
          <stop offset="1" stopColor="#bde88b" />
        </linearGradient>
      </defs>
      <circle cx="627" cy="610" r="496" fill="url(#canola-sky)" opacity="0.9" />
      <path d="M150 826C320 706 498 704 646 830C780 718 974 724 1102 822V1052H150Z" fill="url(#canola-field)" />
      <path d="M184 770C356 690 478 722 626 800C778 710 932 706 1078 782" fill="none" stroke="#8bd07c" strokeWidth="20" strokeLinecap="round" opacity="0.55" />
      <circle cx="914" cy="300" r="72" fill="#ffe27a" opacity="0.82" />
      <circle cx="880" cy="278" r="20" fill="#fff8c8" opacity="0.76" />
      {[
        [238, 778, 0.82],
        [326, 720, 0.76],
        [432, 790, 0.7],
        [790, 782, 0.82],
        [904, 718, 0.72],
        [1018, 790, 0.78],
        [192, 930, 0.62],
        [512, 910, 0.64],
        [726, 930, 0.66],
        [1058, 928, 0.6],
      ].map(([x, y, scale], index) => (
        <CanolaFlower key={index} x={x} y={y} scale={scale} />
      ))}
      <path d="M230 1000C416 940 834 940 1024 1000" fill="none" stroke="#f6d16b" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
    </g>
  );
}

function CozyCushionPaths() {
  return (
    <g>
      <ellipse cx="627" cy="930" rx="360" ry="108" fill="#ffe1eb" />
      <ellipse cx="627" cy="904" rx="328" ry="78" fill="#fff7fa" />
      <path d="M344 902C430 957 822 957 910 902" stroke="#f7b9c9" strokeWidth="18" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="494" cy="904" rx="34" ry="14" fill="#f4abc0" opacity="0.45" />
      <ellipse cx="760" cy="904" rx="34" ry="14" fill="#f4abc0" opacity="0.45" />
    </g>
  );
}

function HeartAuraPaths() {
  return (
    <g>
      <HeartShape x={330} y={760} scale={0.7} opacity={0.72} />
      <HeartShape x={914} y={760} scale={0.7} opacity={0.72} />
      <HeartShape x={442} y={905} scale={0.5} opacity={0.52} />
      <HeartShape x={812} y={905} scale={0.5} opacity={0.52} />
    </g>
  );
}

function CoinShowerPaths() {
  return (
    <g>
      {[
        { x: 627, y: 238, r: 0 },
        { x: 864, y: 372, r: 34 },
        { x: 958, y: 628, r: 78 },
        { x: 824, y: 860, r: 126 },
        { x: 430, y: 860, r: 214 },
        { x: 296, y: 628, r: 282 },
        { x: 390, y: 372, r: 326 },
      ].map((coin, index) => (
        <g key={index} transform={`translate(${coin.x} ${coin.y}) rotate(${coin.r})`}>
          <circle cx="0" cy="0" r="42" fill="#ffd35d" />
          <circle cx="0" cy="0" r="28" fill="#ffec9a" />
          <path d="M-10 12V-12H10" stroke="#d99422" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <path d="M627 184C858 184 1045 371 1045 602C1045 833 858 1020 627 1020C396 1020 209 833 209 602C209 371 396 184 627 184Z" fill="none" stroke="#ffeec1" strokeWidth="18" opacity="0.58" />
    </g>
  );
}

function SparkleStickerPaths() {
  return (
    <g>
      <path d="M365 290L395 362L470 390L395 418L365 490L335 418L260 390L335 362Z" fill="#ffd25e" />
      <path d="M920 360L940 408L990 426L940 444L920 492L900 444L850 426L900 408Z" fill="#f38ba8" />
      <path d="M850 710L878 776L948 802L878 828L850 894L822 828L752 802L822 776Z" fill="#bbdfd0" opacity="0.9" />
      <circle cx="294" cy="690" r="16" fill="#f3a0b5" opacity="0.72" />
      <circle cx="986" cy="612" r="14" fill="#ffd25e" opacity="0.8" />
    </g>
  );
}

function SavingSproutPaths() {
  return (
    <g>
      <ellipse cx="1012" cy="944" rx="104" ry="34" fill="#cdeedb" opacity="0.76" />
      <path d="M1012 925C1006 857 1016 797 1042 741" stroke="#42a978" strokeWidth="18" strokeLinecap="round" />
      <path d="M1030 777C1088 747 1132 761 1156 821C1096 847 1054 831 1030 777Z" fill="#79d69e" />
      <path d="M1014 829C960 787 912 793 876 847C930 881 978 871 1014 829Z" fill="#6bcf95" />
      <circle cx="1040" cy="711" r="48" fill="#ffd35d" />
      <path d="M1026 727V695H1054" stroke="#d99422" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function CanolaFlower({ scale, x, y }: { scale: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 24V92" stroke="#6bb56d" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="-24" cy="-4" rx="24" ry="18" fill="#ffd84f" transform="rotate(-32 -24 -4)" />
      <ellipse cx="24" cy="-4" rx="24" ry="18" fill="#ffd84f" transform="rotate(32 24 -4)" />
      <ellipse cx="-12" cy="-30" rx="22" ry="17" fill="#ffe875" transform="rotate(-68 -12 -30)" />
      <ellipse cx="12" cy="-30" rx="22" ry="17" fill="#ffe875" transform="rotate(68 12 -30)" />
      <circle cx="0" cy="-10" r="12" fill="#e8a827" />
    </g>
  );
}

function HeartShape({ opacity, scale, x, y }: { opacity: number; scale: number; x: number; y: number }) {
  return (
    <path
      d="M0 -28C-36 -64 -96 -35 -96 16C-96 66 -48 96 0 144C48 96 96 66 96 16C96 -35 36 -64 0 -28Z"
      fill="#f2769a"
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  );
}

const ItemSvg = styled.svg<{ $variant: "stage" | "preview" }>`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  ${({ $variant }) => $variant === "preview" && "filter: drop-shadow(0 5px 8px rgba(58, 36, 44, 0.12));"}
`;
