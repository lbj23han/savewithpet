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
};

export function AppShell({ activePage, children, onNavigate, coin, showCoin }: AppShellProps) {
  return (
    <Shell>
      <TopBar coin={coin} showCoin={showCoin} />
      <Content>{children}</Content>
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
