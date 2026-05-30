import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { getBannerAdUnitId } from "../lib/adIntegration";

type AdBannerSlotProps = {
  placement: "analysis" | "shop";
};

export function AdBannerSlot({ placement }: AdBannerSlotProps) {
  const unitId = getBannerAdUnitId();
  const slotRef = useRef<HTMLDivElement>(null);
  const [isAttached, setIsAttached] = useState(false);

  useEffect(() => {
    if (!unitId || !slotRef.current) return;

    let destroyed = false;
    let destroySlot: (() => void) | null = null;
    const target = slotRef.current;

    void import("@apps-in-toss/web-framework")
      .then(({ TossAds }) => {
        if (destroyed || !TossAds.initialize.isSupported()) return;

        const attach = () => {
          if (destroyed) return;
          const slot = TossAds.attachBanner(unitId, target, {
            callbacks: {
              onAdRendered: () => setIsAttached(true),
              onAdFailedToRender: () => setIsAttached(false),
              onNoFill: () => setIsAttached(false),
            },
            theme: "light",
            tone: "grey",
            variant: "card",
          });
          destroySlot = () => slot.destroy();
        };

        TossAds.initialize({
          callbacks: {
            onInitializationFailed: () => setIsAttached(false),
            onInitialized: attach,
          },
        });
      })
      .catch((error) => {
        console.info("banner_ad_attach_failed", error);
      });

    return () => {
      destroyed = true;
      destroySlot?.();
    };
  }, [unitId]);

  if (!unitId && !import.meta.env.DEV) return null;

  return (
    <Slot aria-label="배너 광고 영역" data-ad-placement={placement} data-ad-unit-id={unitId ?? "dev-banner"}>
      <AdHost ref={slotRef} />
      {!isAttached && (
        <Fallback>
          <AdLabel>AD</AdLabel>
          <AdText>{unitId ? "광고를 준비하고 있어요" : "배너 광고 연결 대기 중"}</AdText>
        </Fallback>
      )}
    </Slot>
  );
}

const Slot = styled.aside`
  position: relative;
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

const AdHost = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
`;

const Fallback = styled.div`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
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
