import { LockKeyhole } from "lucide-react";
import styled from "styled-components";

import { SHOP_COPY } from "../constants/copy";
import { shopItems } from "../mocks/appData";

export function ShopPage() {
  return (
    <Page>
      <Hero>
        <h1>{SHOP_COPY.title}</h1>
        <p>{SHOP_COPY.description}</p>
      </Hero>

      <Tabs>
        {SHOP_COPY.tabs.map((tab, index) => (
          <Tab key={tab} $active={index === 0}>
            {tab}
          </Tab>
        ))}
      </Tabs>

      <ItemGrid>
        {shopItems.map((item) => (
          <ItemCard key={item.id} $locked={item.state === "locked"}>
            <IconCircle>{item.icon}</IconCircle>
            {item.state === "locked" && <LockKeyhole size={28} />}
            <h2>{item.name}</h2>
            <StateBadge $state={item.state}>{item.unlockLabel ?? (item.state === "owned" ? "보유중" : "구매가능")}</StateBadge>
            <Price $disabled={item.state === "locked"}>🪙 {item.price.toLocaleString()}</Price>
          </ItemCard>
        ))}
      </ItemGrid>

      <PremiumBox>
        <div>
          <h2>{SHOP_COPY.premiumTitle}</h2>
          <p>{SHOP_COPY.premiumDescription}</p>
        </div>
        <button>{SHOP_COPY.premiumButton}</button>
      </PremiumBox>
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  padding: 28px ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.surface};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.orange}, ${({ theme }) => theme.colors.orangeDark});
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    font-size: 32px;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.84);
    font-weight: 700;
  }
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: ${({ theme }) => theme.spacing.xs};
  background: #ebe3d9;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Tab = styled.button<{ $active: boolean }>`
  min-height: 45px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.text)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: 900;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const ItemCard = styled.article<{ $locked: boolean }>`
  position: relative;
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 210px;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ $locked, theme }) => ($locked ? "#F1F1F1" : theme.colors.surface)};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  > svg {
    position: absolute;
    top: 70px;
    color: ${({ theme }) => theme.colors.surface};
  }

  h2 {
    margin: 0;
    font-size: 17px;
  }
`;

const IconCircle = styled.div`
  display: grid;
  width: 74px;
  height: 74px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: 50%;
  font-size: 34px;
`;

const StateBadge = styled.span<{ $state: "owned" | "available" | "locked" }>`
  padding: 5px 12px;
  color: ${({ $state, theme }) =>
    $state === "locked" ? theme.colors.muted : $state === "owned" ? theme.colors.orangeDark : theme.colors.green};
  background: ${({ $state, theme }) =>
    $state === "locked" ? "#DEDEDE" : $state === "owned" ? "#FFF1B5" : theme.colors.greenSoft};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 13px;
  font-weight: 900;
`;

const Price = styled.strong<{ $disabled: boolean }>`
  color: ${({ $disabled, theme }) => ($disabled ? theme.colors.muted : theme.colors.orangeDark)};
  font-size: 17px;
`;

const PremiumBox = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.purple};
  background: ${({ theme }) => theme.colors.purpleSoft};
  border-radius: ${({ theme }) => theme.radius.xl};

  h2,
  p {
    margin: 0;
  }

  p {
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-weight: 700;
  }

  button {
    flex: 0 0 auto;
    padding: 12px 16px;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.purple};
    border-radius: ${({ theme }) => theme.radius.md};
    font-weight: 900;
  }
`;
