import { Bell, Coins, PawPrint } from "lucide-react";
import styled from "styled-components";

import { APP_TITLE } from "../constants/copy";

type TopBarProps = {
  showCoin?: boolean;
};

export function TopBar({ showCoin }: TopBarProps) {
  return (
    <Header>
      <Brand>
        <PawPrint size={24} fill="currentColor" />
        <span>{APP_TITLE}</span>
      </Brand>
      {showCoin ? (
        <CoinPill>
          <Coins size={18} />
          <span>2,840</span>
        </CoinPill>
      ) : (
        <IconButton aria-label="알림">
          <Bell size={22} />
        </IconButton>
      )}
    </Header>
  );
}

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 248, 240, 0.94);
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  backdrop-filter: blur(16px);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.orange};
  font-size: 20px;
  font-weight: 800;

  span {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const IconButton = styled.button`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;
`;

const CoinPill = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 9px 14px;
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-weight: 900;
  box-shadow: ${({ theme }) => theme.shadow.card};
`;
