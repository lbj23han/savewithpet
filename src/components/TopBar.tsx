import { Bell, Coins, PawPrint } from "lucide-react";
import styled from "styled-components";

import { APP_TITLE } from "../constants/copy";

type TopBarProps = {
  coin?: number;
  showCoin?: boolean;
};

export function TopBar({ coin = 0, showCoin }: TopBarProps) {
  return (
    <Header>
      <Brand>
        <PawPrint size={22} fill="currentColor" />
        <span>{APP_TITLE}</span>
      </Brand>
      {showCoin ? (
        <CoinPill>
          <Coins size={16} />
          <span>{coin.toLocaleString("ko-KR")}</span>
        </CoinPill>
      ) : (
        <IconButton aria-label="알림">
          <Bell size={20} />
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
  height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.line};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.orange};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;

  span {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const IconButton = styled.button`
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;
`;

const CoinPill = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 7px 12px;
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 14px;
  font-weight: 600;
`;
