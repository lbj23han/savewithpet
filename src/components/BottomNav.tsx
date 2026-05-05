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
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
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
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg} calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.90);
  border-top: 0.5px solid ${({ theme }) => theme.colors.line};
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  pointer-events: auto;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 0;
  min-height: 56px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  color: ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.muted)};
  background: transparent;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  letter-spacing: 0.1px;
`;
