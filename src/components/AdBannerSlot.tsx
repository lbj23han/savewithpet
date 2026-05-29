import styled from "styled-components";

import { getBannerAdUnitId } from "../lib/adIntegration";

type AdBannerSlotProps = {
  placement: "analysis" | "shop";
};

export function AdBannerSlot({ placement }: AdBannerSlotProps) {
  const unitId = getBannerAdUnitId();
  if (!unitId && !import.meta.env.DEV) return null;

  return (
    <Slot aria-label="배너 광고 영역" data-ad-placement={placement} data-ad-unit-id={unitId ?? "dev-banner"}>
      <AdLabel>AD</AdLabel>
      <AdText>{unitId ? "광고" : "배너 광고 연결 대기 중"}</AdText>
    </Slot>
  );
}

const Slot = styled.aside`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 58px;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px dashed ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const AdLabel = styled.span`
  padding: 3px 7px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 10px;
  font-weight: 800;
`;

const AdText = styled.span`
  font-size: 12px;
  font-weight: 700;
`;
