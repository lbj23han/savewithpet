import type { ReactNode } from "react";
import styled from "styled-components";

import type { AppPage } from "../types/app";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

type AppShellProps = {
  activePage: Exclude<AppPage, "onboarding">;
  children: ReactNode;
  onNavigate: (page: Exclude<AppPage, "onboarding">) => void;
  coin?: number;
  showCoin?: boolean;
  toastMessage?: string | null;
};

export function AppShell({ activePage, children, onNavigate, coin, showCoin, toastMessage }: AppShellProps) {
  return (
    <Shell>
      <TopBar coin={coin} showCoin={showCoin} />
      <Content>{children}</Content>
      {toastMessage && <Toast role="status">{toastMessage}</Toast>}
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.line};
`;

const Content = styled.main`
  min-height: calc(100vh - 148px);
  padding: 0 ${({ theme }) => theme.spacing.lg} 104px;
`;

const Toast = styled.div`
  position: fixed;
  right: 50%;
  bottom: calc(92px + env(safe-area-inset-bottom));
  z-index: 50;
  width: min(360px, calc(100vw - 40px));
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.surface};
  background: rgba(28, 28, 30, 0.88);
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  transform: translateX(50%);
`;
