# Ads Integration Contract

광고는 광고 ID 발급 전까지 실제 SDK 호출을 하지 않습니다. 현재 코드는 배너/리워드 광고 unit id를 받을 준비만 해둡니다.

## Env

```bash
VITE_AD_BANNER_UNIT_ID=
VITE_AD_REWARD_UNIT_ID=
```

## Policy

- 배너 광고: 상점/분석 하단에 보상 없이 노출
- 리워드 광고: 시청 완료 시 100코인 지급
- 광고 실패/중단/취소 시 코인 지급 없음
- 하루 보상 횟수 제한은 서버 저장소 연결 후 확정

## Current Code

- `src/domain/adPolicy.ts`: 광고 unit id와 보상 정책
- `src/lib/adIntegration.ts`: 광고 SDK 연결 전 disabled stub
- `src/components/AdBannerSlot.tsx`: 배너 unit id가 있을 때 노출되는 배너 슬롯
- `src/pages/ShopPage.tsx`: 영상 광고 보상 CTA

광고 SDK가 확정되면 `showRewardAd()` 내부에서 SDK 호출 후 completed 상태만 코인 지급으로 연결합니다.
