# Ads Integration Contract

광고는 광고 ID 발급 전까지 실제 SDK 호출을 하지 않습니다. 현재 코드는 배너/리워드 광고 unit id를 받을 준비만 해둡니다.

## Env

```bash
VITE_AD_BANNER_UNIT_ID=ait.v2.live.40145900ff404573
VITE_AD_REWARD_UNIT_ID=ait.v2.live.cf2b6c321a3f4d33
```

## Policy

- 배너 광고: 상점/분석 하단에 보상 없이 노출
- 리워드 광고: 시청 완료 시 100코인 지급
- 광고 실패/중단/취소 시 코인 지급 없음
- 하루 보상 횟수 제한은 서버 저장소 연결 후 확정

## Current Code

- `src/domain/adPolicy.ts`: 광고 unit id와 보상 정책
- `src/lib/adIntegration.ts`: Apps in Toss GoogleAdMob 리워드 광고 load/show 연결
- `src/components/AdBannerSlot.tsx`: TossAds 배너 슬롯 attach
- `src/pages/ShopPage.tsx`: 영상 광고 보상 CTA

리워드 광고는 `userEarnedReward` 이벤트가 발생한 경우에만 코인을 지급합니다.
