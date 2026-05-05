import { LockKeyhole } from "lucide-react";
import styled from "styled-components";

import { SHOP_COPY } from "../constants/copy";
import type { ShopItemState, ShopItemViewModel } from "../types/app";

type ShopPageProps = {
  coins: number;
  items: ShopItemViewModel[];
  level: number;
  onItemAction: (itemId: string) => void;
  onOpenPremiumBox: () => void;
};

export function ShopPage({ coins, items, level, onItemAction, onOpenPremiumBox }: ShopPageProps) {
  return (
    <Page>
      <Hero>
        <h1>{SHOP_COPY.title}</h1>
        <p>Lv.{level} · 보유 코인 {coins.toLocaleString("ko-KR")}개</p>
      </Hero>

      <Tabs>
        {SHOP_COPY.tabs.map((tab, index) => (
          <Tab key={tab} $active={index === 0}>
            {tab}
          </Tab>
        ))}
      </Tabs>

      <ItemGrid>
        {items.map((item) => (
          <ItemCard key={item.id} $locked={item.state === "locked"} onClick={() => onItemAction(item.id)}>
            <IconCircle>{item.icon}</IconCircle>
            {item.state === "locked" && <LockKeyhole size={24} />}
            <h2>{item.name}</h2>
            <StateBadge $state={item.state}>{getStateLabel(item)}</StateBadge>
            <Price $disabled={item.state === "locked"}>🪙 {item.price.toLocaleString()}</Price>
          </ItemCard>
        ))}
      </ItemGrid>

      <PremiumBox>
        <div>
          <h2>{SHOP_COPY.premiumTitle}</h2>
          <p>{SHOP_COPY.premiumDescription}</p>
        </div>
        <button onClick={onOpenPremiumBox}>{SHOP_COPY.premiumButton}</button>
      </PremiumBox>
    </Page>
  );
}

function getStateLabel(item: ShopItemViewModel): string {
  if (item.state === "equipped") return "착용중";
  if (item.state === "owned") return "보유중";
  if (item.state === "locked") return item.unlockLabel ?? "잠김";
  if (!item.canBuy) return "코인 부족";
  return "구매가능";
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  padding: 24px ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: linear-gradient(135deg, #ffe0ec 0%, #ffcedd 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0;
    color: rgba(176, 48, 96, 0.65);
    font-size: 14px;
    font-weight: 400;
  }
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Tab = styled.button<{ $active: boolean }>`
  min-height: 42px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const ItemCard = styled.button<{ $locked: boolean }>`
  position: relative;
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ $locked, theme }) => ($locked ? theme.colors.surfaceWarm : theme.colors.surface)};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  > svg {
    position: absolute;
    top: 68px;
    color: ${({ theme }) => theme.colors.muted};
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }
`;

const IconCircle = styled.div`
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: 50%;
  font-size: 32px;
`;

const StateBadge = styled.span<{ $state: ShopItemState }>`
  padding: 4px 12px;
  color: ${({ $state, theme }) =>
    $state === "locked"
      ? theme.colors.muted
      : $state === "owned" || $state === "equipped"
        ? theme.colors.orangeDark
        : theme.colors.green};
  background: ${({ $state, theme }) =>
    $state === "locked" ? theme.colors.surfaceWarm : $state === "owned" || $state === "equipped" ? "#FFF1B5" : theme.colors.greenSoft};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 600;
`;

const Price = styled.strong<{ $disabled: boolean }>`
  color: ${({ $disabled, theme }) => ($disabled ? theme.colors.muted : theme.colors.orangeDark)};
  font-size: 15px;
  font-weight: 600;
`;

const PremiumBox = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.purple};
  background: ${({ theme }) => theme.colors.purpleSoft};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  p {
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.muted};
  }

  button {
    flex: 0 0 auto;
    padding: 10px 16px;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.purple};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
    font-weight: 600;
  }
`;
