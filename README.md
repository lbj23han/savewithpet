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
- AI 캐릭터 생성은 결제 연동 후 생성 1회당 500원 프리미엄 상품으로 운영한다.
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

## Folder Structure

```text
savewithpet/
  docs/
    character-asset-prompts.md            캐릭터/아이템 생성 프롬프트 기록
    standard-v1-character-generation.md   standard-v1 캐릭터 생성 방향

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
- `src/domain/shop.ts`: 아이템 구매 상태, 프리미엄 상자 정책
- `src/lib/persistence.ts`: localStorage 저장/마이그레이션
- `src/mocks/appData.ts`: 프리셋, 카테고리, 상점 아이템

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
- AI 캐릭터 생성은 생성 1회당 500원 결제 상품으로 운영 예정입니다.
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
- communityPosts
- rewardEvents

마이그레이션에서 특히 보존해야 할 pet 필드:

- `templateId`
- `visualLayers`
- `sourcePhotoUrl`

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
- [x] AI 캐릭터 생성 500원 상품 진입점 추가

### P0: 출시 필수

- [ ] 프리셋 3종 single PNG 출시용 최종본 확정: `akkigae`, `ttoosseunyang`, `kangchongmu`
- [ ] 전 아이템 적용 QA: 아끼개, 또쓰냥, 깡총무 x `canola-garden`, `cozy-cushion`, `heart-aura`, `coin-shower`, `sparkle-sticker`, `saving-sprout`
- [x] Supabase 초기 schema/query 준비: `supabase/initial-schema.sql`
- [ ] 상태 이펙트 QA: normal, happy, sweat, angry, small, large
- [x] 사진 기반 생성용 로컬 계약 단순화: `imageUrl`, `sourcePhotoUrl`, `templateId`
- [ ] 사진 기반 single PNG 생성 테스트
- [ ] 온보딩, 홈, 장부, 분석, 상점, 설정 핵심 루프 실기기 QA
- [ ] localStorage 마이그레이션과 fallback 점검
- [ ] 사진 기반 생성 과금/실패/재시도 정책 확정
- [x] 상점 탭 구조 변경: 옷장, 간식, 캐릭터 상점
- [x] 프리미엄 상자 10,000코인으로 변경 및 오픈 비활성화
- [ ] Toss WebView 실제 환경에서 build/deploy 확인

### P1: 출시 전 품질

- [ ] 상태 이펙트 SVG/CSS 퀄리티 개선: 하트, 땀, 분노, 반짝임
- [ ] 비접촉형 아이템 퀄리티 개선: 방석, 배경, 오라, 스티커, 새싹, 코인
- [ ] 판매용 배경 아이템 PNG 에셋 제작/교체
- [ ] AI 생성 중 로딩, 실패, 재시도, 결제 실패 UX 정리
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

- 온보딩: 프리셋 선택, 사진 업로드 진입점
- 홈: 캐릭터 상태, 오늘 요약, 기록 CTA
- 장부: 지출/수입/저축 기록, 카테고리, 메모, 수정/삭제
- 분석: 월간 소비 분석, 카테고리별 요약, 예산 상태
- 상점: 옷장/간식/캐릭터 상점, 비접촉형 꾸미기 아이템 구매, 프리미엄 상자 비활성 상태
- 설정: 예산/데이터 관리, 보유 캐릭터 전환
- 커뮤니티 MVP: 로컬 베스트 코디, 좋아요, 댓글
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
OPENAI_IMAGE_MAX_ATTEMPTS=2
```

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
