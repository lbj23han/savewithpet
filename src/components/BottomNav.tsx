import styled from "styled-components";

import { NAV_ITEMS } from "../constants/navigation";
import type { AppPage } from "../types/app";

type BottomNavProps = {
  activePage: Exclude<AppPage, "onboarding">;
  onNavigate: (page: Exclude<AppPage, "onboarding">) => void;
};

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <NavWrap>
      <Nav>
        {NAV_ITEMS.map(({ page, label, Icon }) => {
          const isActive = activePage === page;
          return (
            <NavButton key={page} $active={isActive} onClick={() => onNavigate(page)}>
              <Icon size={23} strokeWidth={isActive ? 2.6 : 2.2} />
              <span>{label}</span>
            </NavButton>
          );
        })}
      </Nav>
    </NavWrap>
  );
}

const NavWrap = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  width: min(430px, 100vw);
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg} calc(12px + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -8px 24px rgba(70, 54, 38, 0.1);
  pointer-events: auto;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
  min-height: 64px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  color: ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.muted)};
  background: ${({ $active }) => ($active ? "#FFF2E7" : "transparent")};
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 12px;
  font-weight: 800;
`;
