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

- 프리셋/사진 기반 캐릭터 모두 `standard-v1` body frame을 기준으로 생성한다.
- AI가 생성하는 것은 자유형 캐릭터가 아니라, 고정된 프레임에 맞춘 full base-body PNG다.
- 아이템 착용은 캐릭터별 하드코딩이 아니라 공통 wearable anchor를 기준으로 렌더링한다.
- 생성 결과는 자동 QA와 수동 QA를 통과한 것만 앱에 연결한다.
- overlay 파츠만 따로 생성해 합성하는 방식은 현재 품질이 불안정해서 사용하지 않는다.

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
        *.png                             기존 프리셋 대표 이미지
        *.svg                             로컬/실험용 벡터 프리셋
        base-body/                        원본 기반 얼굴 없는 base-body 실험 자산
        base-body-standard/               현재 앱에 연결된 standard-v1 PNG 후보
      pet-parts/
        {petId}/{expression}.svg          표정 파츠
    interaction-preview.html              캐릭터/아이템/표정 로컬 미리보기
    landmark-editor.html                  anchor 수동 보정용 로컬 도구

  reports/
    standard-v1-audit.md                  로컬 standard-v1 audit 기록
    standard-v1-png-generation-report.md  AI base-body 생성 QA 보고서
    standard-v1-wearable-profile.json     wearable anchor 기준값

  scripts/
    lib/png-frame-qa.mjs                  PNG alpha silhouette QA helper
    qa-character-assets.mjs               pre-DB 캐릭터 자산/표정 QA
    generate-standard-pets.mjs            로컬 SVG standard-v1 생성기
    generate-standard-basebody-pngs.mjs   AI full base-body PNG 생성 + QA
    generate-cutscene.mjs                 컷신/이벤트 이미지 실험 도구

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
-> Shop에서 아이템 구매/착용
-> PetStage에서 캐릭터 + 표정 + 아이템 렌더링
```

핵심 파일:

- `src/App.tsx`: 앱 상태와 화면 전환
- `src/components/PetStage.tsx`: 캐릭터, 표정, 아이템 레이어 렌더링
- `src/components/PetItemArt.tsx`: SVG 아이템 아트
- `src/domain/petWearableAnchors.ts`: wearable anchor와 아이템 배치 규칙
- `src/domain/petCharacterSet.ts`: 프리셋 캐릭터 asset 경로와 표정 파츠 경로
- `src/domain/avatarGenerator.ts`: 프리셋/사진 기반 펫 생성
- `src/lib/persistence.ts`: localStorage 저장/마이그레이션
- `src/mocks/appData.ts`: 프리셋, 카테고리, 상점 아이템

## Character Asset Contract

현재 앱에 연결된 프리셋 캐릭터는 3종입니다.

| ID | Name | Current Base Body |
| --- | --- | --- |
| `akkigae` | 아끼개 | `public/assets/pets/base-body-standard/akkigae.png` |
| `ttoosseunyang` | 또쓰냥 | `public/assets/pets/base-body-standard/ttoosseunyang.png` |
| `kangchongmu` | 깡총무 | `public/assets/pets/base-body-standard/kangchongmu.png` |

표정 파츠:

```text
public/assets/pet-parts/{petId}/neutral.svg
public/assets/pet-parts/{petId}/happy.svg
public/assets/pet-parts/{petId}/sad.svg
public/assets/pet-parts/{petId}/wink.svg
public/assets/pet-parts/{petId}/surprised.svg
public/assets/pet-parts/{petId}/sleepy.svg
```

공통 좌표계:

- Canvas: `1024x1024` PNG 생성, 앱 내부 anchor는 `1254x1254` 기준값 사용
- Body frame: 정면, full-body, 중심축 고정
- Face anchor: 눈/표정 파츠가 같은 위치에 얹혀야 함
- Head anchor: 모자, 왕관, 리본 기준
- Chest anchor: 펜던트/몸통 아이템 기준
- Back anchor: 날개처럼 몸 뒤에 놓이는 아이템 기준

## AI Character Generation

실서비스 방향:

```text
사용자 사진 또는 프리셋 원본
-> standard-v1 full base-body PNG 생성
-> 자동 QA: 크기, 투명 PNG, 중심축, 실루엣 bounds
-> 실패 시 재생성
-> 수동 QA: 얼굴 위치, 손발, 귀/꼬리, 착용 테스트
-> 통과한 이미지만 앱/스토리지에 저장
```

현재 생성 스크립트:

```bash
npm run character:standard-png
```

생성 스크립트는 `scripts/generate-standard-basebody-pngs.mjs`에 있습니다.

DB 연동 전 캐릭터 준비 상태 점검:

```bash
npm run character:qa
```

이 명령은 다음 파일을 생성합니다.

```text
reports/pre-db-character-readiness.md
```

현재 자동 QA가 확인하는 것:

- PNG 크기
- alpha silhouette bounds
- 중심축 drift
- top/bottom framing
- 전체 width/height ratio

자동 QA가 아직 확인하지 못하는 것:

- 실제 눈/표정 anchor가 미적으로 맞는지
- 손/발/귀/꼬리가 서비스 톤에 맞는지
- 아이템 착용 시 자연스럽게 보이는지
- 캐릭터가 충분히 귀엽고 출시 품질인지

따라서 생성 보고서가 PASS여도 반드시 사람이 앱에서 확인해야 합니다.

보고서:

```text
reports/standard-v1-png-generation-report.md
reports/pre-db-character-readiness.md
```

## Wearable System

아이템은 `PetStage` 안에서 캐릭터와 분리된 레이어로 렌더링합니다.

```text
back item layer
-> base body image
-> expression part
-> front item layer
```

현재 아이템:

- `hat`: 신사 모자
- `crown`: 왕관
- `sunglasses`: 선글라스
- `ribbon`: 리본
- `scarf`: 미니 하트 펜던트
- `wings`: 저축 날개

중요 규칙:

- 선글라스는 양쪽 눈 anchor를 기준으로 중심, 크기, 회전을 계산한다.
- 모자/왕관/리본은 head anchor 기준으로 붙인다.
- 펜던트는 목걸이 줄처럼 크게 두르지 않고, 가슴 쪽 작은 장식으로만 사용한다.
- 날개는 front item이 아니라 back item으로 렌더링한다.
- 가방류는 현재 방향에서 제외한다.

## Data Persistence

현재는 localStorage 기반입니다.

저장되는 주요 데이터:

- categories
- categoryBudgets
- ledger entries
- coins
- owned/equipped item ids
- pet
- communityPosts
- rewardEvents

마이그레이션에서 특히 보존해야 할 pet 필드:

- `templateId`
- `wearableAnchors`
- `visualLayers`
- `sourcePhotoUrl`

## Release Priority

### P0: 출시 필수

- [ ] 프리셋 3종 base-body 출시용 최종본 확정
- [ ] 전 아이템 착용 QA: 아끼개, 또쓰냥, 깡총무 x 모든 아이템
- [x] AI 생성 캐릭터 QA 파이프라인 1차 확정: 자동 검사, 재생성, 보고서
- [x] 사진 기반 생성용 로컬 계약 고정: `sourcePhotoUrl`, `templateId`, `visualLayers`, `wearableAnchors`
- [ ] 온보딩, 홈, 장부, 분석, 상점, 설정 핵심 루프 실기기 QA
- [ ] localStorage 마이그레이션과 fallback 점검
- [ ] 사진 기반 생성 과금/실패/재시도 정책 확정
- [ ] Toss WebView 실제 환경에서 build/deploy 확인

### P1: 출시 전 품질

- [ ] 깡총무 base-body 재생성: 현재 report 기준 BEST_EFFORT
- [ ] 표정 6종의 위치와 크기 전수 QA
- [ ] 선글라스, 모자, 왕관, 리본, 펜던트, 날개 위치 최종 조정
- [ ] 아이템 SVG 퀄리티 개선: 캐릭터와 어울리는 3D/파스텔 톤
- [ ] AI 생성 중 로딩, 실패, 재시도, 결제 실패 UX 정리
- [ ] 코디 공유/커뮤니티 MVP 흐름 확인
- [ ] 이미지 용량 최적화와 캐시 정책 검토

### P2: 운영 준비

- [x] pre-DB 캐릭터 readiness 보고서 추가
- [ ] 자동 착용 스크린샷 QA 도구 추가
- [ ] `landmark-editor.html` 유지/삭제 결정
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
- 상점: 아이템 구매, 해금, 착용, 프리미엄 상자
- 설정: 예산/데이터 관리, 캐릭터 상태 확인
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
- 캐릭터 품질과 아이템 착용 품질은 출시 판단의 핵심입니다.
