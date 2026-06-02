# 냥비하지말개

소비를 기록하면 반려 캐릭터가 함께 성장하는 Apps in Toss 미니앱입니다.

냥비하지말개는 가계부를 딱딱한 관리 도구가 아니라, 매일 짧게 확인하고 기록하게 만드는 습관형 서비스로 설계합니다. 사용자는 지출과 저축을 기록하고, 예산과 목표를 확인하며, 절약 성과에 따라 캐릭터 성장과 아이템 보상을 받습니다.

## Product Goal

- 소비 기록의 진입 장벽을 낮춘다.
- 절약, 예산 관리, 연속 기록을 캐릭터 성장과 연결한다.
- 캐릭터 꾸미기와 보상을 통해 재방문 동기를 만든다.
- Toss WebView 안에서 가볍고 안정적으로 동작하는 모바일 앱을 만든다.

## Current Direction

캐릭터 시스템은 서비스의 핵심 품질 요소입니다. 현재 방향은 다음과 같습니다.

- 프리셋/사진 기반 캐릭터는 고퀄 투명 PNG 1장을 앱에 연결한다.
- 표정 파츠, 눈 좌표, body frame 고정, 정밀 착용 아이템은 출시 범위에서 제외한다.
- 포만도, 기분, 성장 상태는 캐릭터 전체 scale과 하트/땀/분노/반짝임 이펙트로 표현한다.
- 상점 아이템은 모자/선글라스처럼 몸에 맞추는 물건이 아니라 방석, 배경, 오라, 스티커처럼 캐릭터와 충돌하지 않는 꾸미기 요소로 제한한다.
- AI 캐릭터 생성도 최종 산출물을 single PNG로 저장하는 방향을 우선한다.
- 상점은 `옷장`, `간식`, `캐릭터 상점` 3탭으로 운영한다.
- 기본 3종 캐릭터는 첫 선택 1종만 무료 제공하고, 나머지는 캐릭터 상점에서 200코인으로 구매한다.
- AI 캐릭터 생성은 결제 연동 후 2회 550원, 5회권 1,100원 프리미엄 상품으로 운영한다.
- 사용자 1명당 AI 생성 캐릭터는 최대 5개까지 보유할 수 있고, 추가 생성 전에는 컬렉션에서 1개를 삭제해야 한다.
- AI 생성 결과는 수정할 수 없고, 마음에 들지 않으면 컬렉션에서 삭제 후 생성권으로 다시 생성한다.
- 프리미엄 상자는 10,000코인 상품으로 두되, 기간 한정 판매 아이템 풀이 준비될 때까지 열 수 없게 막아둔다.

## Tech Stack

- Apps in Toss Web Framework
- React 18
- TypeScript
- Vite
- styled-components
- lucide-react
- Vitest

## Local Development

```bash
npm install
npm run dev
```

기본 개발 서버는 Granite 설정을 따릅니다. 포트가 이미 사용 중이면 별도 Vite 서버로 확인할 수 있습니다.

```bash
npm exec vite -- --host 0.0.0.0 --port 5173
```

검증 명령:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run check
npm run build
```

## Supabase

초기 DB는 `supabase/initial-schema.sql`을 Supabase SQL Editor에서 실행합니다.
이미 한 번 실행한 뒤 스키마가 바뀌었다면 같은 파일을 다시 실행해도 됩니다. `add column if not exists`, `create policy/drop policy` 형태로 재실행 가능하게 유지합니다.

로컬 연결값은 `.env.local`에 둡니다.

```bash
VITE_API_BASE=
VITE_AUTH_ENABLED=true
VITE_SUPABASE_URL=https://xiyrggeyckhmxpkesswj.supabase.co
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_AD_BANNER_UNIT_ID=ait.v2.live.40145900ff404573
VITE_AD_REWARD_UNIT_ID=ait.v2.live.cf2b6c321a3f4d33
VITE_TOSS_LOGIN_CLIENT_ID=
VITE_IAP_AI_CHARACTER_SKU=
VITE_IAP_AI_CHARACTER_PACK_SKU=
```

`VITE_SUPABASE_ANON_KEY`를 채우기 전에는 앱이 기존 localStorage 모드로 동작합니다. 값을 채우면 앱이 Supabase anonymous auth 세션을 만들고 `profiles`, `pets`, `ledger_entries`, `reward_events`, `user_owned_items` 등에 로컬 상태를 자동 저장합니다.

Supabase dashboard에서 Anonymous sign-ins를 활성화해야 자동 세션 생성이 동작합니다.

배포 환경에도 같은 값이 필요합니다.

- Vercel: Project Settings -> Environment Variables
- Apps in Toss/AIT: 배포 환경 변수 설정 위치에 동일하게 등록

서버 전용 AI 생성 값은 프론트에 노출하지 않습니다.

```bash
TOSS_DECRYPT_KEY=
TOSS_DECRYPT_AAD=TOSS
# Optional: OAuth code exchange 방식으로 Toss Login을 붙일 때만 사용
TOSS_LOGIN_CLIENT_SECRET=
TOSS_MTLS_CERT_BASE64=
TOSS_MTLS_KEY_BASE64=
MTLS_CERT_PATH=server/certs/savewithpet_public.crt
MTLS_KEY_PATH=server/certs/savewithpet_private.key
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
AI_CHARACTER_GENERATION_ENABLED=false
```

## Folder Structure

```text
savewithpet/
  docs/
    ai-character-generation.md            AI 캐릭터 생성/결제/검수 연결 계약
    ads-integration.md                    배너/리워드 광고 연결 계약
    character-asset-prompts.md            캐릭터/아이템 생성 프롬프트 기록
    standard-v1-character-generation.md   standard-v1 캐릭터 생성 방향
    toss-login.md                         Toss Login 최종 연동 계약

  public/
    assets/
      pets/
        *.png                             앱에 직접 연결되는 프리셋 캐릭터 PNG
        *.svg                             로컬/실험용 벡터 프리셋
        base-body/                        이전 base-body 실험 자산
        base-body-standard/               이전 standard-v1 실험 자산
      pet-parts/
        {petId}/{expression}.svg          이전 표정 파츠 실험 자산
    interaction-preview.html              PNG 캐릭터/상태 이펙트 로컬 미리보기
    landmark-editor.html                  이전 anchor 수동 보정용 로컬 도구

  reports/
    standard-v1-audit.md                  로컬 standard-v1 audit 기록
    standard-v1-png-generation-report.md  이전 AI base-body 생성 QA 보고서
    standard-v1-wearable-profile.json     이전 wearable anchor 기준값

  scripts/
    lib/png-frame-qa.mjs                  PNG alpha silhouette QA helper
    qa-character-assets.mjs               이전 pre-DB 캐릭터 자산/표정 QA
    generate-standard-pets.mjs            로컬 SVG standard-v1 생성기
    generate-standard-basebody-pngs.mjs   이전 AI full base-body PNG 생성 실험
    generate-cutscene.mjs                 컷신/이벤트 이미지 실험 도구

  supabase/
    initial-schema.sql                    초기 DB 테이블/RLS/상점 seed query

  src/
    components/                           공통 UI와 캐릭터 렌더링 컴포넌트
    constants/                            탭, 카피 등 상수
    domain/                               장부, 보상, 상점, 캐릭터 규칙
    lib/                                  저장/복원 등 앱 인프라
    mocks/                                로컬 MVP 데이터
    pages/                                화면 단위 컴포넌트
    styles/                               theme, global style
    types/                                공유 타입
```

## Main Runtime Flow

```text
Onboarding
-> Pet 선택 또는 사진 기반 생성 진입
-> Home에서 캐릭터 상태/요약 확인
-> Ledger에서 소비/저축/수입 기록
-> Rewards로 코인/성장 반영
-> Shop에서 옷장/간식/캐릭터 상점 확인
-> 옷장에서 배경/방석/오라/스티커형 꾸미기 구매/적용
-> 캐릭터 상점에서 기본 3종 추가 구매 또는 AI 캐릭터 생성 진입
-> PetStage에서 캐릭터 PNG + 상태 이펙트 + 비접촉형 아이템 렌더링
```

핵심 파일:

- `src/App.tsx`: 앱 상태와 화면 전환
- `src/components/PetStage.tsx`: 캐릭터 PNG, scale, 상태 이펙트, 꾸미기 레이어 렌더링
- `src/components/PetItemArt.tsx`: 방석/배경/오라/스티커형 SVG 아이템 아트
- `src/domain/petItems.ts`: 아이템을 backdrop/foreground 레이어로 분류
- `src/domain/petCharacterSet.ts`: 프리셋 캐릭터 PNG 경로
- `src/domain/avatarGenerator.ts`: 프리셋/사진 기반 펫 생성
- `src/domain/aiCharacterPolicy.ts`: AI 캐릭터 생성 가격/비활성 정책
- `src/domain/adPolicy.ts`: 배너/리워드 광고 unit id와 보상 정책
- `src/domain/petCare.ts`: 간식 급여, 친밀도 증가/감소 정책
- `src/domain/shop.ts`: 아이템 구매 상태, 프리미엄 상자 정책
- `src/lib/persistence.ts`: localStorage 저장/마이그레이션
- `src/lib/cloudPersistence.ts`: Supabase 자동 저장 동기화
- `src/lib/supabase.ts`: Supabase client/anonymous auth
- `src/lib/tossLogin.ts`: Toss Login client id/stub
- `src/lib/tossPayments.ts`: Apps in Toss IAP 결제 요청, 미지급 주문 복구
- `src/mocks/appData.ts`: 프리셋, 카테고리, 상점 아이템
- `api/iap/grant.js`: Apps in Toss IAP 주문 지급과 AI 생성권 충전

## Character Asset Contract

현재 앱에 연결된 프리셋 캐릭터는 3종입니다.

| ID | Name | Current PNG |
| --- | --- | --- |
| `akkigae` | 아끼개 | `public/assets/pets/akkigae.png` |
| `ttoosseunyang` | 또쓰냥 | `public/assets/pets/ttoosseunyang.png` |
| `kangchongmu` | 깡총무 | `public/assets/pets/kangchongmu.png` |

런타임 원칙:

```text
single character PNG
-> optional backdrop item
-> character image
-> mood/effect overlay
-> optional foreground item
```

상태 표현:

- 성장/재정/기분이 낮으면 캐릭터 전체 scale을 줄이고 땀/주의 이펙트를 띄운다.
- 성장/기분이 높으면 캐릭터 scale을 키우고 하트/반짝임 이펙트를 띄운다.
- 캐릭터 얼굴 자체를 바꾸거나 아이템을 몸에 정밀 부착하지 않는다.

## AI Character Generation

실서비스 방향:

```text
사용자 사진
-> 고퀄 투명 PNG 캐릭터 1장 생성
-> 앱에는 imageUrl로 직접 연결
-> 포만도/기분/성장은 scale과 이펙트로 표현
-> 몸에 맞추는 착용 아이템은 사용하지 않음
```

이전 base-body 생성 스크립트:

```bash
npm run character:standard-png
```

해당 스크립트는 이전 실험용입니다. 출시 방향은 single PNG 캐릭터 생성입니다.

이전 DB 연동 전 캐릭터 준비 상태 점검:

```bash
npm run character:qa
```

이 명령은 다음 파일을 생성합니다.

```text
reports/pre-db-character-readiness.md
```

이전 자동 QA가 확인하는 것:

- PNG 크기
- alpha silhouette bounds
- 중심축 drift
- top/bottom framing
- 전체 width/height ratio

현재 single PNG 방식에서 사람이 확인해야 하는 것:

- 손/발/귀/꼬리가 서비스 톤에 맞는지
- 상태 이펙트가 캐릭터를 가리지 않는지
- 배경/방석/오라 아이템이 캐릭터와 자연스럽게 보이는지
- 캐릭터가 충분히 귀엽고 출시 품질인지

따라서 생성 보고서가 PASS여도 반드시 사람이 앱에서 확인해야 합니다.

보고서:

```text
reports/standard-v1-png-generation-report.md
reports/pre-db-character-readiness.md
```

## Decoration System

아이템은 캐릭터 몸에 부착하지 않고 `PetStage` 안에서 캐릭터와 분리된 레이어로 렌더링합니다.

```text
backdrop item layer
-> character PNG
-> mood/effect overlay
-> foreground item layer
```

현재 아이템:

- `canola-garden`: 유채꽃 정원
- `cozy-cushion`: 포근 방석
- `heart-aura`: 하트 오라
- `coin-shower`: 코인 링
- `sparkle-sticker`: 반짝 스티커
- `saving-sprout`: 저축 새싹

중요 규칙:

- 캐릭터 머리/얼굴/몸에 정확히 맞춰야 하는 아이템은 출시 범위에서 제외한다.
- 방석, 배경, 오라, 스티커, 식물, 코인비처럼 캐릭터와 충돌하지 않는 아이템만 사용한다.
- 아이템은 `src/domain/petItems.ts`에서 `backdrop` 또는 `foreground`로만 분류한다.
- 캐릭터 상태 반응은 `PetStage`의 scale과 mood effect에서 처리한다.
- 실제 판매용 배경 아이템은 현재 SVG 예시가 아니라, 레퍼런스 스타일의 고퀄 PNG 배경 에셋으로 교체하는 것을 권장한다.

## Shop and Monetization

현재 상점 구조:

- `옷장`: 캐릭터와 직접 맞닿지 않는 배경/방석/오라/스티커/장식 아이템
- `간식`: 포만도 회복, 기분 상승 등 소비형 아이템 예정
- `캐릭터 상점`: 기본 3종 추가 구매, AI 캐릭터 생성 진입점

가격 정책:

- 첫 온보딩에서 고른 기본 캐릭터 1종은 무료입니다.
- 나머지 기본 캐릭터는 각 200코인으로 구매합니다.
- AI 캐릭터 생성은 2회 550원, 5회권 1,100원 결제 상품으로 운영 예정입니다.
- AI 생성 캐릭터는 사용자 1명당 최대 5개까지 보유할 수 있으며, 추가 생성 전에는 캐릭터 컬렉션에서 하나를 삭제해야 합니다.
- AI 생성 캐릭터는 생성 후 수정할 수 없으며, 결과가 마음에 들지 않으면 삭제 후 다시 생성해야 합니다.
- 프리미엄 상자는 10,000코인이며, 기간 한정 판매 상품 풀을 따로 만든 뒤 랜덤 보상으로 연결합니다.
- 프리미엄 상자는 현재 코드에서 비활성화되어 있습니다.

## Data Persistence

현재는 localStorage 기반입니다.

저장되는 주요 데이터:

- categories
- categoryBudgets
- ledger entries
- coins
- owned/equipped item ids
- ownedPetIds
- ownedCustomPets
- pet
- petLevels (캐릭터 ID별 독립 레벨)
- communityPosts
- rewardEvents

마이그레이션에서 특히 보존해야 할 pet 필드:

- `templateId`
- `visualLayers`
- `sourcePhotoUrl`

## Next Actions (출시 이후)

### 다음 릴리즈 TODO (2026-05-31 기준)

v1.0은 이미 출시된 상태입니다. 다음 배포는 새 기능을 크게 늘리기보다 결제, AI 생성, 광고, 서버 동기화가 실제 사용자 환경에서 흔들리지 않도록 운영 안정성을 먼저 올립니다.

#### P0: 운영 안정화

- [ ] Supabase SQL Editor에서 `supabase/initial-schema.sql` 재실행 후 `consume_ai_character_credit`, `refund_ai_character_credit`, `ai_character_jobs_user_client_id_idx`, `purchases_provider_order_id_idx` 생성 확인
- [ ] Vercel/AIT 환경변수 동기화 확인: `VITE_API_BASE`, `VITE_AUTH_ENABLED`, Supabase, Toss mTLS/decrypt, OpenAI, 광고 ID
- [ ] 실기기 Toss WebView에서 로그인 -> 온보딩 -> 홈 진입 smoke QA
- [ ] IAP 2회권/5회권 결제 -> `purchases.status = paid` -> `profiles.ai_character_credits` 증가 확인
- [ ] AI 생성 1회 사용 -> `ai_character_jobs.status = succeeded`, Storage URL, 홈 캐릭터 반영, 생성권 1회 감소 확인
- [ ] OpenAI/Storage 실패 시 생성권 환불 및 실패 job 기록 확인
- [ ] 리워드 광고는 `userEarnedReward` 이벤트에서만 100코인 지급되는지 확인
- [ ] 배너 광고가 상점/분석 하단에서 레이아웃 깨짐 없이 노출되는지 확인
- [ ] Vercel logs에서 `/api/ai-character`, `/api/iap/grant`, `/api/auth/toss-login` 오류율 확인

#### P1: v1.1 제품 개선

- [x] 리워드 광고 일일 제한/쿨타임 1차 보강: 30분 쿨타임, 하루 5회 제한, 상점 CTA 상태 표시
- [ ] 앱 재진입 시 진행 중인 AI 생성 job을 다시 보여주는 pending recovery UX 추가
- [x] 결제-생성권 reconcile용 운영 SQL 문서 추가: [docs/ops-reconciliation.md](docs/ops-reconciliation.md)
- [ ] 리워드 광고 보상 지급을 서버 RPC 기준으로 전환
- [ ] `우리 애 좀 보세요` 커뮤니티 게시글/댓글/좋아요를 Supabase API 기준으로 완전 전환
- [ ] 부적절 사진/생성 결과 필터링 정책과 신고/삭제 운영 플로우 정리
- [ ] Sentry 또는 Vercel 로그 기반 에러 모니터링 루틴 도입

#### P2: 콘텐츠/성장

- [ ] 간식/꾸미기 아이템 추가와 가격 밸런스 조정
- [ ] 캐릭터 레벨별 보상 또는 성장 연출 추가
- [ ] 배너 위치별 수익/이탈 영향 체크 후 배치 조정
- [ ] 앱 소개 이미지, 제출용 스크린샷, 운영 문서 최신화

### v1.1 작업 메모 — 결제/AI 생성 안정화

출시 후 첫 안정화 작업으로 결제-생성권-AI 생성 흐름을 서버 기준으로 보강했습니다.

- `api/ai-character.js`: Supabase access token을 확인한 뒤 AI 생성을 처리합니다.
- `api/ai-character.js`: 생성 시작 시 `ai_character_jobs` row를 만들고, 성공/실패 상태와 결과 이미지 URL을 기록합니다.
- `api/ai-character.js`: 생성권은 서버 RPC(`consume_ai_character_credit`)로 원자적으로 차감하고, OpenAI/Storage 실패 시 `refund_ai_character_credit`로 환불합니다.
- `api/ai-character.js`: 생성 결과는 `data:` URL 대신 Supabase Storage `pet-characters/{userId}/{jobId}.png`에 저장한 공개 URL로 반환합니다.
- `src/lib/aiCharacterGeneration.ts`: AI 생성 요청에 Supabase bearer token과 `clientGenerationId`를 함께 보냅니다.
- `src/App.tsx`: 생성 성공 후 서버가 반환한 `remainingCredits`를 UI에 반영합니다.
- `src/App.tsx`: IAP 복구/중복 지급 케이스 이후 Supabase의 `profiles.ai_character_credits`를 다시 읽어 로컬 표시를 보정합니다.
- AI 프롬프트는 원본 사진을 붙여 넣는 결과를 줄이도록 "사진은 정체성 참고용, 결과는 앱용 3D 캐릭터" 조건을 강화했습니다.
- 자동 소개 문구에서 `PNG` 같은 제작 용어가 나오지 않도록 더 자연스러운 문장으로 조정했습니다.
- 광고 UI 준비: 상점에 `영상 보고 코인 받기` CTA를 추가하고 리워드 보상을 100코인으로 조정했습니다.
- 광고 보상 제한: 리워드 광고는 30분 쿨타임, 하루 5회 제한을 앱에서 먼저 적용합니다.
- 광고 UI 준비: 배너 슬롯은 상점/분석 하단에 배치했고, `VITE_AD_BANNER_UNIT_ID`가 없으면 프로덕션에서는 숨깁니다.

운영 반영 확인:

- Supabase SQL Editor에서 `supabase/initial-schema.sql` 재실행
- `ai_character_jobs.client_id`, `ai_character_jobs_user_client_id_idx`, `consume_ai_character_credit`, `refund_ai_character_credit`, `purchases_provider_order_id_idx` 생성 확인
- `pet-characters` Storage bucket이 public이고 insert policy가 살아있는지 확인
- 실기기에서 생성권 1회 차감, OpenAI 실패 시 환불, 생성 성공 후 `profiles.ai_character_credits` 감소와 `ai_character_jobs.status = succeeded` 확인

**v1.0 출시 전 완료 기록** — 아래 내용은 출시 직전 작업 로그입니다. 현재 다음 우선순위는 위의 `다음 릴리즈 TODO`를 기준으로 봅니다.

이번 v1.0 작업 요약:

- 사진 기반 AI 캐릭터 생성 후 홈에서 default 캐릭터가 뜨던 버그 수정 (`createPetFromPhoto`의 `visualLayers.baseBodyUrl` 재바인딩 + `normalizePet` 마이그레이션)
- AI 생성 30초 동안 ShopPage / SettingsPage 양쪽에 진행 상태 placeholder 표시, 실패 시 `생성권은 차감되지 않았어요` 안내
- Toss Login 실연동 (`@apps-in-toss/web-framework`의 `appLogin()` + Vercel `/api/auth/toss-login` + mTLS 호출 + Supabase `profiles.toss_user_key` 업서트 + `/api/auth/toss-disconnect` webhook)
- 앱 진입 흐름을 **Toss 가입 게이트**로 통일: 부팅 시 `LoginPage`에서 `appLogin()`이 자동 호출 → 인증 화면 즉시 표시 → 성공 시 캐릭터 선택(or 홈)로 자동 라우팅. 캔슬/실패 시 인라인 메시지와 재시도 버튼 노출
- 버전 1.0.0, AIT `appName` 을 `savewithpet`으로 정렬, 미사용 copy 상수 제거

푸시 완료된 v1.0 커밋 (`main`):

```text
(latest) Trigger Toss Login automatically on LoginPage entry
8c361b3 Gate the app behind Toss Login before onboarding
2d7546b Rename AIT appName to savewithpet to match console registration
2af923e Bump version to 1.0.0 and remove unused copy constants
70d3f22 Wire Toss Login through Apps in Toss SDK and Vercel API
8dfbcee Fix AI character render bug and add generation progress UI
```

최신 AIT 아티팩트: `savewithpet.ait` (appName=`savewithpet`, version=`1.0.0`, deploymentId=`019e78eb-aa06-7b97-9b6c-e7ff24c0beea`).

### 0. Claude 인수인계: 현재 필수 수정 사항

2026-05-24 기준, 출시 전 마지막으로 확인해야 하는 blocking 항목입니다.

#### A. AI 캐릭터 생성 중 진행 상태 UI — [x] 완료 (2026-05-24)

코드 변경:

- `src/App.tsx`: `isAiCharacterGenerating` state를 `ShopPage`와 `SettingsPage` 양쪽에 prop으로 전달. 시작 토스트를 `AI 캐릭터를 만들고 있어요 (약 30초)` 로 변경. 실패 토스트는 `getAiCharacterGenerationErrorMessage()`에서 항상 `생성권은 차감되지 않았어요` 안내 포함.
- `src/pages/ShopPage.tsx`: 생성 중 카드 안에 dashed border + spinner + 안내 문구 표시. `사진 선택해서 생성` 버튼 disabled, label을 `생성 중...`으로 변경. file input도 disabled. 생성권 구매 버튼도 disabled.
- `src/pages/SettingsPage.tsx`: 캐릭터 컬렉션 그리드 마지막에 dashed placeholder card 추가 (spinner + `만드는 중...` + `약 30초`). 생성 완료 시 실제 컬렉션 카드로 자연스럽게 교체됨.

후속 확인 (실기기 QA):

- 생성 중 다른 탭으로 이동해도 다시 settings로 돌아오면 placeholder가 보이는지
- 생성 실패 시 토스트에 `생성권은 차감되지 않았어요` 문구가 보이는지

#### B. 생성 성공 후 홈에서 default character가 보이는 버그 — [x] 완료 (2026-05-24)

근본 원인:

- `createPetFromPhoto`가 `visualLayers.baseBodyUrl = getPresetVisualLayers(profile.presetId)` 로 프리셋 PNG URL을 세팅했음.
- `PetStage`의 `getBaseCharacterUrl(pet)`이 `visualLayers.baseBodyUrl`을 먼저 반환 → 생성된 `pet.imageUrl`이 가려졌음.
- 결과적으로 컬렉션 카드는 `customPet.imageUrl`을 직접 쓰니까 생성 이미지가 보였지만, 홈은 `PetStage`를 거쳐서 프리셋 PNG가 떴음.

수정 내용:

- `src/domain/avatarGenerator.ts`: `createPetFromPhoto`에서 `generated.imageUrl`이 있으면 `visualLayers = { baseBodyUrl: generated.imageUrl }` 로 일관되게 세팅. 없을 때만 프리셋 fallback 사용.
- `src/lib/persistence.ts`: `normalizePet`에서 `source === "photo"` 인 펫을 로드할 때 `visualLayers.baseBodyUrl`을 항상 `imageUrl`로 재바인딩. 이전 빌드에서 저장된 stale visualLayers 자동 마이그레이션.

완료 기준 충족 여부:

- [x] 생성 직후 홈 캐릭터 이미지 = 컬렉션 카드 이미지 (코드상 동일 URL 사용)
- [x] 앱 새로고침/localStorage 복원 후에도 동일 (normalizePet 마이그레이션)
- [ ] Supabase sync 이후 `pets.image_url`에 생성 결과 저장 — cloudPersistence 흐름은 그대로지만 실 환경 QA 필요

#### C. AI 생성 결과 문구 수정/편집

코드 상태 (확인됨):

- [x] `sanitizePetName` / `sanitizePetTrait`에서 `\bPNG\b` 정규식으로 제거 ([src/domain/avatarGenerator.ts](src/domain/avatarGenerator.ts))
- [x] SettingsPage 편집 UI 존재 ([src/pages/SettingsPage.tsx](src/pages/SettingsPage.tsx) line 159-185, `CustomPetEditor` 폼). 활성 pet이 photo일 때만 표시
- [x] `updateCustomPetProfile()`이 `ownedCustomPets`와 `appState.pet`을 동시에 업데이트 → 홈 PetStage가 즉시 반영
- [x] localStorage `appState` 저장 useEffect로 자동 영속화

남은 작업 (실기기 QA):

- 사진 기반 캐릭터 선택 → 설정에서 이름/소개 수정 → 홈으로 가서 이름 반영 확인
- 새로고침 후에도 수정 내용 유지 확인

#### D. AIT build/deploy 필수 체크리스트

로컬 검증 — 2026-05-24 기준 모두 통과:

```bash
npm run typecheck   # [x] 통과
npm run lint        # [x] 통과
npm run test:unit   # [x] 19 tests passed
npm run build       # [x] Vite + AIT artifact 생성 완료
```

배포 전 확인:

- Vercel 최신 배포에 `api/ai-character.js` CORS/OPTIONS 수정이 반영되어야 함.
- 로컬에서 Vercel API 테스트 시 `.env.local`:

```bash
VITE_API_BASE=https://savewithpet.vercel.app
```

- Vercel 환경 변수:

```bash
VITE_API_BASE=https://savewithpet.vercel.app
VITE_AUTH_ENABLED=true
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
AI_CHARACTER_GENERATION_ENABLED=true
```

참고:

- `VITE_IAP_AI_CHARACTER_SKU`, `VITE_IAP_AI_CHARACTER_PACK_SKU`는 updown-brief와 같은 구조로 갈 경우 필수 아님.
- 코드 기본값은 `ai_character`, `ai_character_pack`임.
- Toss 콘솔 상품 ID가 기본값과 다르면 그때만 env로 지정.

AIT 배포:

- Vercel 배포가 끝난 뒤 `/api/ai-character`가 살아있는지 먼저 확인한다.
- Apps in Toss/AIT 환경 변수도 Vercel과 같은 값으로 맞춘다.
- `npm run build`가 통과한 뒤 AIT 배포 명령(`npm run deploy`) 또는 콘솔 배포를 진행한다.
- Toss WebView에서 사진 선택, 생성 중 placeholder, 생성 결과 홈 반영까지 직접 확인한다.

### 1. 캐릭터 PNG 확정 (선행 조건)

아끼개/또쓰냥/깡총무 3종의 `public/assets/pets/*.png`를 출시 품질로 확정해야 그 다음 QA가 의미 있습니다.

- 배경 제거, 여백 균형, 해상도(권장 1024px), 파스텔 톤 통일 확인
- `public/interaction-preview.html`에서 3종 x 비접촉형 아이템 6개 착용이 자연스러운지 육안 검수
- 상태 이펙트(하트/땀/분노/반짝임)가 캐릭터 얼굴을 과하게 가리지 않는지 확인

### 2. 핵심 루프 실기기 QA

실기기(iPhone) + Toss WebView 환경에서 직접 돌려야 합니다. 에뮬레이터나 로컬 브라우저로는 대체 불가.

- 온보딩 → 홈 → 장부 기록 → 코인 획득 → 상점 → 설정 → 초기화 → 재온보딩
- 초기화 후 이전 캐릭터가 남지 않는지 확인 (방금 수정한 버그)
- 캐릭터별 Lv. 표시, 장부 기록 시 레벨 증가 확인
- localStorage 저장/복원, 앱 재시작 후 상태 유지 확인

### 3. Apps in Toss IAP 실결제 테스트

현재 결제 API는 연결됐지만 실 결제 테스트가 없습니다.

- `VITE_IAP_AI_CHARACTER_SKU`, `VITE_IAP_AI_CHARACTER_PACK_SKU` 실 값 세팅
- 2회 생성권(550원), 5회권(1,100원) 결제 완료 후 `aiCharacterCredits` 충전 확인
- 결제 실패/취소 시 토스트 메시지 동작 확인
- mTLS 인증서(`TOSS_MTLS_CERT_BASE64` / `TOSS_MTLS_KEY_BASE64`) 배포 환경에서 유효한지 확인

### 4. AI 캐릭터 생성 파이프라인 연결

`AI_CHARACTER_GENERATION_ENABLED=false` → `true` 로 전환하기 위한 조건:

- `api/ai-character.js` 에서 사진 → OpenAI 생성 → imageUrl 반환 흐름 실 테스트
- 생성 실패 시 재시도 정책, 과금 취소 처리 확정
- 생성된 이미지를 Supabase Storage 또는 외부 URL에 저장하는 구조 결정

### 4-B. Toss Login 실 환경 검증 (코드는 완료)

- Vercel/AIT 환경 변수에 `TOSS_DECRYPT_KEY`, `TOSS_DECRYPT_AAD`, `TOSS_MTLS_CERT_BASE64`, `TOSS_MTLS_KEY_BASE64`, `SUPABASE_SERVICE_ROLE_KEY` 세팅
- AIT 콘솔에서 클라이언트 ID 발급, mTLS 인증서 발급 받기
- AIT 콘솔의 연동 해제 webhook URL을 `https://<vercel-domain>/api/auth/toss-disconnect` 로 설정
- 실기기에서 설정 → "Toss로 연동하기" 동작 확인 → `profiles.toss_user_key` 채워지는지 확인
- 두 번째 기기에서 동일 Toss 계정으로 시도 → HTTP 409 처리 확인

### 5. Supabase 실 환경 검증

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 실 값으로 anonymous auth 세션 생성 확인
- `cloudPersistence.ts`의 자동 동기화(profiles/pets/ledger_entries 등) 실 DB 저장 확인
- `supabase/initial-schema.sql` 실행 후 RLS 정책이 앱에서 정상 동작하는지 확인

### 6. Toss WebView build/deploy 확인

- `npm run build` 후 AIT 배포 환경에서 실제 앱 진입 확인
- 배포 환경 변수(Vercel 또는 AIT) 전체 세팅 확인

---

## v1.1 Backlog (다음 버전 TODO)

v1.0 출시 후 정리할 후속 작업과 보류한 기능을 모아둡니다. 최신 우선순위는 위 `다음 릴리즈 TODO`가 기준이며, 아래는 세부 후보 목록입니다.

### Interaction polish

- [x] **메인 캐릭터 터치 시 하트/별/반짝임 랜덤 이펙트**
  - 현재 구현 위치: `src/pages/HomePage.tsx`
  - 후속 후보: 친밀도 보상 연결은 어뷰징 방지 cooldown(예: 15분당 1회) 정책 확정 후 별도 작업

### Quality / UX

- [ ] LoginPage 캔슬 시점 자동 재시도 정책 검토 (현재는 사용자가 "다시 시도" 직접 눌러야 함)
- [ ] AI 생성 실패/재시도/결제 실패 토스트 → 다이얼로그 또는 인라인 메시지로 격상
- [ ] 상태 이펙트(하트/땀/분노/반짝임) SVG 퀄리티 개선
- [ ] 배경/방석/오라 아이템 SVG → 고퀄 PNG 에셋 교체
- [ ] 이미지 용량 최적화 (현재 main chunk 942KB) + 캐시 정책

### Community / Social

- [ ] `우리 애 좀 보세요` 커뮤니티 게시글/댓글 Supabase API 연결
- [ ] 부적절 사진/생성 결과 필터링 정책 (광고법/이용약관 대응)

### Ops / 운영

- [ ] 자동 상태/꾸미기 스크린샷 QA 도구
- [ ] 에러 로깅/분석 도구 도입 (Sentry, GA 등)
- [ ] 환불/과금 정책 문서 보완
- [ ] `interaction-preview.html`을 QA 전용 체크리스트 화면으로 정리 또는 제거
- [ ] `landmark-editor.html` 유지/삭제 결정

---

## Release Priority

### Current Blocking Issues

이전 blocking issue였던 base-body frame과 wearable anchor 문제는 출시 범위에서 제거했습니다. 현재 방향은 single PNG 캐릭터 + 상태 이펙트 + 비접촉형 꾸미기입니다.

#### Issue 1: single PNG 캐릭터 품질 확정

- 증상: 캐릭터 정밀 착용 대신 PNG 1장을 쓰므로, PNG 자체의 완성도가 곧 서비스 품질입니다.
- 결정: `public/assets/pets/*.png`를 런타임 캐릭터로 사용합니다.
- 관련 파일:
  - `public/assets/pets/akkigae.png`
  - `public/assets/pets/ttoosseunyang.png`
  - `public/assets/pets/kangchongmu.png`
  - `src/domain/petCharacterSet.ts`
  - `src/domain/avatarGenerator.ts`

완료 기준:

- [ ] 프리셋 3종 PNG가 배경 제거/여백/해상도/톤 면에서 출시 품질
- [ ] 사진 기반 AI 생성도 최종 `imageUrl`에 PNG 1장을 저장하는 흐름으로 확정
- [ ] `public/interaction-preview.html`에서 3종 캐릭터 상태 이펙트가 자연스러움

#### Issue 2: 상태 이펙트/성장 scale 최종 튜닝

- 증상: 캐릭터 얼굴을 바꾸지 않으므로 상태 표현이 이펙트와 크기 변화에 달려 있습니다.
- 관련 파일:
  - `src/components/PetStage.tsx`
  - `public/interaction-preview.html`

해결 방향:

- [ ] 성장/기분/포만도 기준 scale 범위 검수: 대략 74%-118%
- [ ] 하트, 땀, 분노, 반짝임 이펙트가 캐릭터 얼굴을 과하게 가리지 않게 조정
- [ ] `shake`, `sparkle`, `pop`, `idle` 애니메이션이 Toss WebView에서 자연스럽게 동작

#### Issue 3: 상점 아이템을 비접촉형으로 유지

- 증상: 몸에 붙는 아이템은 캐릭터별/사진 생성별 오차가 큽니다.
- 결정: 배경, 방석, 오라, 스티커, 장식물 위주로만 운영합니다.
- 관련 파일:
  - `src/components/PetItemArt.tsx`
  - `src/domain/petItems.ts`
  - `src/mocks/appData.ts`

원칙:

- [ ] 모자, 안경, 목걸이, 날개처럼 신체 부착이 필요한 아이템은 추가하지 않음
- [ ] 신규 아이템은 `backdrop` 또는 `foreground` 중 하나로만 분류
- [ ] 캐릭터 PNG가 달라도 아이템이 어색하지 않아야 함

#### Issue 4: 사진 기반 생성 테스트 전 필수 조건

- 사진 기반 생성은 고퀄 투명 PNG 1장 생성이 목표입니다.
- 생성 결과를 캐릭터 파츠로 분해하거나 wearable anchor에 맞추지 않습니다.

사진 기반 생성 테스트 진입 조건:

- [ ] 프리셋 3종 x 상태 이펙트 수동 QA 완료
- [ ] 프리셋 3종 x 비접촉형 아이템 수동 QA 완료
- [ ] 생성 실패/재시도/과금 정책 확정
- [ ] 생성 결과 저장 구조: `imageUrl`, `sourcePhotoUrl`, `templateId` 보존
- [x] 기본 캐릭터 컬렉션 구조 추가: 첫 선택 무료, 나머지 200코인
- [x] AI 캐릭터 생성 2회 550원/5회권 1,100원 상품 정책 반영
- [x] AI 캐릭터 생성 후 수정 불가 안내 추가 (다이얼로그 + 온보딩)

### P0: 출시 필수

- [ ] 프리셋 3종 single PNG 출시용 최종본 확정: `akkigae`, `ttoosseunyang`, `kangchongmu`
- [ ] 전 아이템 적용 QA: 아끼개, 또쓰냥, 깡총무 x `canola-garden`, `cozy-cushion`, `heart-aura`, `coin-shower`, `sparkle-sticker`, `saving-sprout`
- [x] Supabase 초기 schema/query 준비: `supabase/initial-schema.sql`
- [ ] 상태 이펙트 QA: normal, happy, sweat, angry, small, large
- [x] 사진 기반 생성용 로컬 계약 단순화: `imageUrl`, `sourcePhotoUrl`, `templateId`
- [ ] 사진 기반 single PNG 생성 테스트 (`AI_CHARACTER_GENERATION_ENABLED=true` 후 검증)
- [ ] 온보딩, 홈, 장부, 분석, 상점, 설정 핵심 루프 실기기 QA
- [ ] Apps in Toss IAP 실결제 테스트: 2회권/5회권 결제 → 크레딧 충전 확인
- [ ] Supabase anonymous auth + cloudPersistence 실 환경 검증
- [ ] localStorage 마이그레이션과 fallback 점검
- [ ] 사진 기반 생성 과금/실패/재시도 정책 확정
- [x] 상점 탭 구조 변경: 옷장, 간식, 캐릭터 상점
- [x] 간식 3종, 홈 간식주기, 소모형 재고, 친밀도 기본/감소 정책 추가
- [x] 프리미엄 상자 10,000코인으로 변경 및 오픈 비활성화
- [x] 초기화 후 이전 프리셋 캐릭터 잔존 버그 수정 (`ownedPetIds` 온보딩 완료 시 교체)
- [x] 캐릭터별 독립 레벨 시스템: `petLevels` 저장, 장부 기록 시 +1, 설정 컬렉션에 `Lv.` 표시
- [ ] Toss WebView 실제 환경에서 build/deploy 확인

### P1: 출시 전 품질

- [ ] 상태 이펙트 SVG/CSS 퀄리티 개선: 하트, 땀, 분노, 반짝임
- [ ] 비접촉형 아이템 퀄리티 개선: 방석, 배경, 오라, 스티커, 새싹, 코인
- [ ] 판매용 배경 아이템 PNG 에셋 제작/교체
- [ ] AI 생성 중 로딩, 실패, 재시도, 결제 실패 UX 정리
- [x] 배너/리워드 광고 ID 및 Apps in Toss SDK 연결
- [x] Toss Login 실 연동: `appLogin()` SDK + `/api/auth/toss-login` + profiles 연결 ([docs/toss-login.md](docs/toss-login.md))
- [ ] 코디 공유/커뮤니티 MVP 흐름 확인
- [ ] 이미지 용량 최적화와 캐시 정책 검토

### P2: 운영 준비

- [x] pre-DB 캐릭터 readiness 보고서 추가
- [ ] 자동 상태/꾸미기 스크린샷 QA 도구 추가
- [ ] `landmark-editor.html` 유지/삭제 결정
- [ ] `interaction-preview.html`를 QA 전용 체크리스트 화면으로 정리
- [ ] 서버 저장소와 사용자 식별 연결
- [ ] 커뮤니티 게시글/댓글 API 연결
- [ ] 부적절 사진/생성물 필터 정책
- [ ] 개인정보 처리방침, 환불/과금 정책 문서화
- [ ] 앱 아이콘, 브랜드 이미지, 스토어/배포 메타데이터 확정
- [ ] 에러 로깅과 분석 도구 도입 검토

## Current MVP Features

- 온보딩: 프리셋 선택(첫 1종 무료), 사진 업로드 진입점
- 홈: 캐릭터 상태, 오늘 요약, 기록 CTA
- 장부: 지출/수입/저축 기록, 카테고리, 메모, 수정/삭제
- 분석: 월간 소비 분석, 카테고리별 요약, 예산 상태
- 상점: 옷장/간식/캐릭터 상점, 비접촉형 꾸미기 아이템 구매, AI 생성권 결제(2회 550원/5회 1,100원), 프리미엄 상자 비활성
- 광고: 리워드 광고 100코인 보상, 상점/분석 배너 슬롯
- 설정: 예산/데이터 관리, 캐릭터 컬렉션(이름 옆 `Lv.` 표시), 전환
- 캐릭터 레벨: 캐릭터별 독립 레벨, 장부 기록 시 현재 캐릭터 +1, 최대 Lv.99
- 커뮤니티 MVP: `우리 애 좀 보세요` 게시판, 좋아요, 댓글
- 품질: 타입체크, 린트, 도메인 단위 테스트, AIT build

## Environment

로컬 이미지 생성 실험은 `.env.local`을 사용합니다. `.env.local`은 git에 올리지 않습니다.

필요한 값:

```bash
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=low
OPENAI_IMAGE_BACKGROUND=transparent
OPENAI_IMAGE_MAX_ATTEMPTS=3
STANDARD_CANDIDATES_PER_ATTEMPT=3
```

생성 스크립트는 시도당 `STANDARD_CANDIDATES_PER_ATTEMPT`장을 병렬 생성해서 QA 점수가 가장 높은 후보를 선택합니다. 실패 시 어떤 region이 얼마나 drift 났는지 다음 시도 프롬프트에 자동 주입합니다.

## Repository

```text
https://github.com/lbj23han/savewithpet
```

Default branch:

```text
main
```

## Development Notes

- 이 프로젝트는 `AGENTS.md`와 `CLAUDE.md`의 규칙을 따릅니다.
- 모바일 화면과 Toss WebView 경험을 우선합니다.
- page 컴포넌트는 조립 위주로 유지하고, 도메인 규칙은 `src/domain`에 둡니다.
- 스타일은 styled-components와 theme token을 사용합니다.
- 새 추상화는 실제 중복이나 복잡도를 줄일 때만 추가합니다.
- 캐릭터 PNG 품질과 상태 이펙트/꾸미기 자연스러움은 출시 판단의 핵심입니다.
