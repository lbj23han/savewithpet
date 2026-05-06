# 냥비하지말개

소비를 기록하면 반려캐릭터가 함께 성장하는 Apps in Toss 미니앱입니다.

냥비하지말개는 가계부를 딱딱한 관리 도구가 아니라, 매일 짧게 확인하고 기록하게 만드는 습관형 서비스로 설계합니다. 사용자는 지출을 기록하고, 예산과 목표를 확인하며, 절약 성과에 따라 캐릭터 성장과 보상을 받습니다.

## Project Goal

- 소비 기록의 진입 장벽을 낮춘다.
- 절약, 예산 관리, 연속 기록을 캐릭터 성장과 연결한다.
- Toss WebView 안에서 가볍고 빠르게 동작하는 모바일 전용 앱을 만든다.
- MVP 단계에서는 명확한 구조와 빠른 수정을 우선한다.

## Core Concept

사용자는 자신의 소비 습관을 함께 관리할 반려캐릭터를 선택합니다.

캐릭터는 사용자의 소비 기록과 절약 습관에 반응합니다.

- 기록을 꾸준히 하면 성장합니다.
- 예산을 지키면 기분과 포만도가 좋아집니다.
- 목표를 달성하면 코인이나 아이템 보상을 받습니다.
- 지출 패턴에 따라 짧은 코멘트와 피드백을 제공합니다.

## Naming

- 서비스명: `냥비하지말개`
- 패키지/앱 slug: `nyangbi-hajimalgae`
- 기존 작업 폴더명: `savewithpet`

## Current MVP Scope

현재는 이미지 구상안을 기준으로 로컬 MVP 기능과 화면 이동 구조를 잡아둔 상태입니다.

- 온보딩: 반려캐릭터 선택, 프리셋 2종, 사진 업로드 미리보기
- 홈: 캐릭터 상태, 오늘 요약, 기록 CTA
- 장부: 카테고리 선택, 지출 금액, 메모 입력
- 분석: 월간 소비 분석, 카테고리 비율, 목표 달성 현황
- 상점: 코스튬/아이템 구매, 프리미엄 상자, 베스트 코디 MVP
- 설정: 예산/데이터 관리, 캐릭터 상태 확인

## Screen Plan

### Onboarding

- 반려캐릭터 선택
- 프리셋 캐릭터 2종: `아끼개`, `또쓰냥`
- 추후 반려동물 사진 기반 캐릭터 생성 진입점

### Home

- 캐릭터 이름과 레벨
- 캐릭터 코멘트
- 포만도, 기분, 성장 지표
- 오늘 지출/저축/연속 기록 요약
- 장부 기록 CTA

### Ledger

- 월 예산 요약
- 카테고리 선택
- 지출 금액 입력
- 메모 입력
- 캐릭터 피드백

### Analysis

- 기간별 소비 요약
- 카테고리별 지출 비율
- 목표 달성률
- 절약 단계와 응원 메시지

### Shop

- 펫 코스튬
- 펫 간식
- 펫 배경
- 코인 기반 구매/해금 상태
- 프리미엄 상자 영역

## Tech Stack

- Apps in Toss Web Framework
- React 18
- TypeScript
- Vite
- styled-components
- lucide-react

## Project Structure

```text
public/
  assets/pets/ preset character PNGs
src/
  components/   reusable UI components
  constants/    labels, copy, navigation constants
  domain/       small domain rules and view model builders
  mocks/        mock data for MVP screens
  pages/        screen-level page components
  styles/       theme and global styles
  types/        shared TypeScript types
```

## Character Assets

현재 연결된 프리셋 캐릭터는 2종입니다.

- `아끼개`: `public/assets/pets/akkigae.png`
- `또쓰냥`: `public/assets/pets/ttoosseunyang.png`

캐릭터 표시는 `src/components/PetStage.tsx`를 기준으로 통일합니다.

- 홈 메인 캐릭터
- 설정 캐릭터 카드
- 커뮤니티 코디 게시물
- 옷장 장착 오버레이

현재 상점 아이템은 emoji 오버레이로 표시합니다. 추후 펫용 의상 PNG가 준비되면 `ShopItem`에 이미지 asset과 위치 메타데이터를 추가해 같은 `PetStage` 레이어에 얹습니다.

정식 아이템 asset 방향:

- 아이템은 모두 투명 배경 PNG/WebP로 제작합니다.
- 캐릭터 전체 이미지와 분리된 파츠로 관리합니다.
- 아이템마다 `slot`, `imageUrl`, `anchor`, `scale`, `rotation`, `zIndex`를 둡니다.
- 아이템 카테고리별 기본 슬롯 좌표를 먼저 만듭니다.
- 캐릭터마다 같은 슬롯의 좌표가 달라질 수 있으므로 `petId`별 override를 허용합니다.
- 가방/날개처럼 몸 뒤에 붙는 아이템은 `zIndex: back`, 모자/안경/목도리는 `zIndex: front`로 렌더링합니다.
- 코디 자랑 이미지는 캐릭터, 배경, 아이템 레이어를 합성한 DOM 캡처 또는 서버 합성 결과로 저장합니다.

추천 제작 파이프라인:

1. 캐릭터별 기준점 생성: 정수리, 왼쪽 귀, 오른쪽 귀, 눈 중심, 목, 몸통, 등.
2. 아이템 카테고리별 기본 좌표 생성: 모자=head, 리본=ear, 목걸이=neck, 가방=back.
3. AI로 아이템 PNG를 만들 때 해당 슬롯에 맞는 크기/방향으로 생성합니다.
4. 생성 결과를 사람이 1차 승인하거나, 비전 모델로 기준점과 겹침 정도를 검사합니다.
5. 앱에는 최종 PNG와 좌표 JSON만 배포합니다.

앱 런타임에서 매번 AI를 호출해 착용 합성을 만들지는 않습니다. 속도, 비용, 일관성 문제가 크기 때문에 제작 단계에서 AI를 쓰고 앱에서는 정해진 좌표로 즉시 렌더링합니다.

예상 데이터 형태:

```ts
type WearableItemAsset = {
  anchor: { x: number; y: number };
  imageUrl: string;
  rotation: number;
  scale: number;
  slot: "head" | "face" | "neck" | "back" | "body";
  zIndex: "back" | "front";
};
```

예상 좌표 데이터:

```ts
type PetAnchorMap = {
  back: { x: number; y: number };
  head: { x: number; y: number };
  leftEar: { x: number; y: number };
  neck: { x: number; y: number };
  rightEar: { x: number; y: number };
};
```

현재 프리셋 PNG는 로컬에서 배경 체크무늬를 제거해 RGBA 투명 PNG로 변환했습니다.

아이템 착용은 1차로 `PetStage` 안의 위치별 레이어로 처리합니다.

- 모자/왕관: 머리 위
- 선글라스: 얼굴 중앙
- 목걸이: 목 주변
- 리본: 귀/머리 옆
- 배낭: 몸통 우측

정식 출시 전에는 emoji 아이템을 펫용 투명 PNG 파츠로 교체하는 것이 좋습니다.

캐릭터 인터랙션은 CSS animation 기반으로 먼저 처리합니다.

- `idle`: 기본 둥실 움직임
- `pop`: 옷장 아이템 장착 반응
- `sparkle`: 보상/코인 획득 반응
- `shake`: 주의/경고 반응용으로 예약

홈에서 캐릭터를 직접 누르는 동작은 캐릭터 변경 안내가 아니라 랜덤 인터랙션으로 사용합니다.

- 예: "간지러워요", "오늘도 잘하고 있어요" 같은 짧은 대사
- 캐릭터 표정/움직임: 웃기, 콕 찌르기 반응, 하트/반짝임
- 캐릭터 변경은 설정 탭의 별도 메뉴에서 처리합니다.

캐릭터는 단일 이미지 고정이 아니라 다마고치형 상태/반응 시스템으로 확장합니다.

- 상태: 기본, 배고픔, 기쁨, 졸림, 예산초과 걱정, 레벨업 기쁨
- 반응: 탭, 기록 완료, 예산 초과, 절약 성공, 간식 사용, 코스튬 착용
- 비주얼: 기본 캐릭터 1장 + 표정 파츠 + 소품 파츠 + CSS 모션을 우선 적용
- 고급형: 이벤트별 AI 생성 컷신 또는 저장 가능한 코디 이미지
- 목표: 매일 접속했을 때 캐릭터가 조금씩 다르게 보이게 만들기

## AI Character Pipeline

AI는 앱 실행 중 매번 캐릭터를 새로 만드는 용도가 아니라, 캐릭터 asset과 컷신을 생성/보강하는 제작 파이프라인으로 사용합니다.

필요한 환경 변수:

```bash
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=medium
OPENAI_IMAGE_BACKGROUND=transparent
OPENAI_CUTSCENE_STORAGE=local
OPENAI_CUTSCENE_OUTPUT_DIR=public/assets/cutscenes
```

로컬에서는 `.env.local`에 키를 넣습니다. `.env.local`은 git에 올리지 않습니다.

`.env.example`에 같은 항목을 둡니다.

구현 계획:

1. 서버 함수 추가: `POST /api/character/cutscene`
2. 입력값: `petId`, `petName`, `eventType`, `mood`, `equippedItemIds`, `backgroundId`
3. 생성 이벤트: `record_complete`, `budget_over`, `level_up`, `feed_treat`, `daily_checkin`, `outfit_share`
4. 서버에서 OpenAI 이미지 생성 호출
5. 결과 이미지를 storage에 저장하고 `cutsceneUrl` 반환
6. 앱은 결과 URL을 `CutsceneModal`로 2-3초 노출하고 캐시
7. 같은 이벤트/상태 조합은 재사용해서 비용을 줄임

기존 `public/assets/pets/*.png`는 기준 캐릭터입니다.

생성 방식은 두 갈래입니다.

1. 표정/상태 variant
   - 입력 이미지: `아끼개` 또는 `또쓰냥` 기본 PNG
   - 생성 방식: 이미지 edit
   - 결과: 같은 캐릭터의 `happy`, `worried`, `sleepy`, `proud`, `hungry` PNG
   - 앱 사용: 기본 캐릭터 이미지 대신 상태별 PNG를 교체하거나 표정 파츠로 얹음

2. 컷신
   - 입력 이미지: 기본 캐릭터 PNG + 착용 아이템/배경 정보
   - 생성 방식: 이미지 edit 또는 image-to-image 스타일 prompt
   - 결과: 레벨업, 예산초과, 연속출석, 간식 사용 같은 이벤트용 한 장면
   - 앱 사용: `CutsceneModal`에 2-3초 표시하고 저장/캐시

예시 컷신 요청:

```json
{
  "petId": "ttoosseunyang",
  "eventType": "budget_over",
  "mood": "worried",
  "equippedItemIds": ["ribbon"],
  "backgroundId": "basic_room"
}
```

로컬 실험:

```bash
npm run cutscene -- --pet ttoosseunyang --event budget_over
npm run cutscene -- --pet akkigae --event level_up --mood proud
```

이 스크립트는 직접 프롬프트를 입력받지 않습니다.

- `--pet`: 기준 캐릭터 PNG 선택
- `--event`: 컷신 이벤트 선택
- `--mood`: 선택 사항. 생략하면 이벤트별 기본 기분 사용
- 결과 저장: `public/assets/cutscenes`

즉, 사용자는 이벤트만 고르고 프롬프트는 코드 템플릿이 자동 생성합니다.

예시 프롬프트 방향:

```text
Use the provided pet character image as the identity reference.
Create a cute mobile game cutscene for event: budget_over.
Keep the same face shape, body proportion, pink-white palette, and soft rounded style.
The pet looks gently worried but still adorable.
No text in the image. Bright clean background. App-friendly composition.
```

컷신 생성 프롬프트는 “현재 펫의 정체성 유지”가 핵심입니다.

- 같은 얼굴/비율/색감 유지
- 배경은 앱 톤과 맞는 밝은 모바일 게임풍
- 텍스트는 이미지 안에 넣지 않음
- 투명 PNG가 필요한 파츠는 별도 item asset 파이프라인으로 생성

런타임 인터랙션은 AI 호출 없이 처리합니다.

- 탭 반응: CSS 모션 + 랜덤 대사
- 기록 완료: `sparkle` 모션 + 보상 텍스트
- 예산 초과: `shake` 모션 + 걱정 표정 파츠
- 간식 사용: `pop` 모션 + 하트 파티클

AI 호출은 사용자가 기다려도 되는 순간에만 사용합니다.

- 최초 캐릭터 생성
- 레벨업 컷신
- 특별 코디 저장
- 월간 리포트 대표 이미지
- 이벤트/희귀 배경 획득

## Customization Economy

코스튬과 배경은 무료 획득 아이템과 유료 희귀 아이템을 분리합니다.

무료 포인트 획득 후보:

- 출석 체크
- 연속 출석 보너스
- 1시간 간격 기록 보상
- 1시간 간격 광고 시청 보상
- 예산 달성/절약 목표 달성 보상

아이템 등급 후보:

- `free`: 무료 포인트로 구매 가능
- `ad_reward`: 광고/미션으로 획득 가능
- `premium`: 결제 재화 또는 패키지 전용
- `rare`: 기간 한정/희귀 상자/이벤트 전용

홈 배경도 캐릭터 커스터마이징의 일부로 봅니다.

- 기본 배경: 화이트/라이트 핑크 톤
- 무료 배경: 방, 책상, 저금통, 산책길 같은 일상 배경
- 유료/희귀 배경: 계절 테마, 야경, 프리미엄 룸, 이벤트 배경

앱 테마는 설정에서 선택 가능하게 확장합니다.

- Light Pink
- Clean White
- Mint
- Lavender
- Dark Comfort

## Development Rules

이 프로젝트는 `AGENTS.md`와 `CLAUDE.md`의 규칙을 따릅니다.

핵심 방향은 다음과 같습니다.

- 모바일 앱 화면만 최적화한다.
- page는 조립 위주로 유지한다.
- 반복 텍스트와 목데이터는 constants/mocks로 분리한다.
- 스타일은 styled-components와 theme token을 사용한다.
- 불필요한 추상화는 피한다.
- 도메인 규칙이 커질 때만 OOP를 선택적으로 사용한다.

## Domain Modeling Policy

초기부터 모든 것을 class로 감싸지 않습니다.

추천 흐름:

```text
plain data -> domain function/small domain object -> plain view model -> React component
```

OOP 도입 후보:

- 캐릭터 성장 규칙
- 레벨 계산
- 예산 평가
- 보상 정책
- 연속 기록 계산
- 아이템 해금 조건

현재 예시:

- `src/domain/petProgress.ts`

## Local Development

```bash
npm install
npm run dev
```

개발 서버:

```text
http://localhost:5174/
```

검증:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run check
npm run build
```

## GitHub

Repository:

```text
https://github.com/lbj23han/savewithpet
```

Default branch:

```text
main
```

## Product Notes

냥비하지말개는 단순 가계부보다 "반려캐릭터와 함께 소비 습관을 기르는 앱"에 가깝습니다.

따라서 화면 톤은 너무 금융 앱처럼 차갑게 만들기보다, 다음 균형을 유지합니다.

- 입력은 빠르고 단순하게
- 피드백은 짧고 귀엽게
- 분석은 한눈에 읽히게
- 보상은 과하지 않게
- UI는 Toss WebView 안에서 안정적으로

## Community Direction

서버 연동 전까지는 로컬 기능을 먼저 완성합니다.

추후에는 보유 아이템과 펫 코디를 중심으로 가벼운 커뮤니티를 붙입니다.

- 베스트 코디: 인기 코디를 모아보는 영역
- 자랑하기: 내 펫 상태와 착용 아이템을 공유하는 흐름
- 가벼운 댓글: 짧은 응원/반응 중심 댓글
- 코디 보상: 공유/반응 기반 코인 또는 배지 보상

커뮤니티 기능은 핵심 장부 기록 경험을 해치지 않도록 별도 탭 또는 상점 하위 흐름으로 시작합니다.

## Service Readiness

서버와 실제 이미지 생성/브랜드 asset 연결 전까지 로컬에서 처리 가능한 기능은 MVP 수준으로 구현되어 있습니다.

- 장부 기록: 추가, 수정, 삭제, 타입, 날짜, 카테고리, 커스텀 카테고리
- 예산 관리: 월 예산, 카테고리별 월 예산, 예산 대비 분석
- 캐릭터 성장: 레벨, 포만도, 기분, 성장, 소비 패턴 코멘트
- 보상/상점: 코인 지급, 구매, 착용, 프리미엄 상자
- 옷장: 보유 아이템 확인, 착용, 캐릭터 표시 반영, 코디 자랑 저장
- 커뮤니티 MVP: 베스트 코디 로컬 데이터, 캐릭터 이미지 표시, 좋아요, 경량 댓글
- 품질: 타입체크, 린트, 도메인 단위 테스트, AIT build

실서비스 전 외부 연결 필요 항목:

- 펫용 의상/장식 PNG asset 연결
- 사진 기반 캐릭터 생성 API 또는 이미지 생성 API 연결
- 사용자 식별 및 서버 저장소 연결
- 커뮤니티 게시글/댓글 API 연결
- 코디 자랑용 DOM/image capture 저장 연결
- 배포용 앱 아이콘/브랜드 이미지 확정
- Toss WebView 실기기 QA

현재 `npm audit --omit=dev --audit-level=critical`은 앱인토스/Granite 내부 transitive dependency의 `fastify`, `@fastify/middie` 계열 취약점을 보고합니다. `npm audit fix --force`는 `@apps-in-toss/web-framework`의 breaking 변경을 제안하므로 적용하지 않습니다. 앱인토스 패키지 업데이트가 나오면 공식 버전으로 재점검합니다.

## Todo

### Next Priority

- [ ] 실기기/브라우저에서 전체 플로우 QA: 온보딩, 기록, 수정, 삭제, 분석, 구매, 착용, 초기화
- [x] 프리셋 캐릭터 2종 이미지 연결
- [x] 캐릭터 표시 공통 컴포넌트 정리
- [x] 옷장 장착/보상 획득 캐릭터 반응 애니메이션 추가
- [x] 소비 패턴별 캐릭터 코멘트 규칙 작성
- [x] 빈 상태, 오류 상태, 저장 완료 피드백 정리
- [x] 프리미엄 상자 정책 확정
- [x] domain 로직 단위 테스트 추가
- [x] Toss WebView back/home event 처리
- [ ] 앱 아이콘/브랜드 이미지 확정
- [x] 커뮤니티 MVP 데이터 모델 설계
- [x] 카테고리별 월 예산/한도 설정 검토

### Foundation

- [x] Apps in Toss 프로젝트 세팅
- [x] GitHub repository 연결
- [x] 기본 탭 구조 구성
- [x] AGENTS.md / CLAUDE.md 규칙 복제
- [x] 선택적 OOP/domain 규칙 추가
- [x] README를 지속적으로 최신 상태로 유지
- [x] `main.tsx` Fast Refresh lint warning 정리
- [x] localStorage 기반 앱 상태 저장
- [ ] 앱 아이콘/브랜드 이미지 확정

### UX / UI

- [x] 온보딩 러프 UI
- [x] 홈 러프 UI
- [x] 장부 입력 러프 UI
- [x] 분석 러프 UI
- [x] 상점 러프 UI
- [x] 뉴트럴 바탕에 절제된 로즈 포인트 톤으로 테마 교체
- [x] 홈 캐릭터 우측 하단 옷장 버튼 추가
- [x] 보유 아이템 옷장 sheet 추가
- [ ] 모바일 실기기 기준 화면 높이/간격 점검
- [ ] 하단 탭 safe-area 세부 조정
- [x] 공통 카드/섹션 컴포넌트 추가 정리
- [x] 캐릭터 이미지 에셋 방향 확정
- [ ] 펫용 의상 PNG 레이어 좌표 규칙 확정
- [ ] 코디 자랑 이미지 캡처 UI 연결
- [ ] 홈 배경 커스터마이징 모델/화면 추가
- [ ] 설정에서 앱 색상 테마 선택 기능 추가
- [x] 기본 입력/구매 피드백 상태 연결
- [x] 빈 상태, 로딩 상태, 오류 상태 설계

### Ledger

- [x] 지출 금액 입력 인터랙션 구현
- [x] 카테고리 선택 상태 구현
- [x] 메모 입력 상태 구현
- [x] 기록 저장 mock flow 구현
- [x] 수입/저축 기록 타입 추가
- [x] 기록 수정/삭제 구현
- [x] 날짜 선택 구현
- [x] 실서비스형 기본 카테고리 세트 확장
- [x] 커스텀 카테고리 추가/수정/삭제 구현
- [x] 모바일 친화 날짜 quick chip 구현
- [x] 카테고리별 월 예산/한도 설정 설계

### Pet Growth / Character

- [x] 프리셋 캐릭터 `아끼개`, `또쓰냥` 모델링
- [x] 프리셋 캐릭터 PNG asset 연결
- [x] 프리셋 캐릭터 배경 체크무늬 제거 및 투명 PNG 변환
- [x] 기존 저장 데이터의 구 프리셋을 기본 캐릭터로 보정
- [x] 캐릭터 기본 idle animation 추가
- [x] 장착/보상 반응 animation 추가
- [x] 아이템별 기본 착용 위치 레이어 추가
- [ ] 홈 캐릭터 탭 랜덤 인터랙션 추가
- [ ] 캐릭터 반응별 대사/애니메이션 매핑
- [ ] 펫용 아이템 투명 PNG 파츠 제작 및 연결
- [ ] 아이템 slot/anchor/scale/rotation/zIndex 메타데이터 모델 추가
- [ ] 캐릭터별 아이템 좌표 override 설계
- [ ] AI 컷신 생성 서버 함수 추가
- [ ] `CutsceneModal` 추가
- [ ] 컷신 URL 캐시/재사용 정책 추가
- [ ] 사진 기반 AI 캐릭터 생성 API 연결
- [ ] 최초 1회 광고 시청 후 생성 가능 정책 연결
- [ ] 재생성/수정 결제 또는 출석 포인트 정책 연결
- [ ] 캐릭터 결과 이미지 저장소 연결

### Growth Rules

- [ ] 캐릭터 타입/성향 모델 구체화
- [x] 포만도/기분/성장 계산 규칙 정의
- [x] 레벨업 조건 정의
- [x] 소비 패턴별 캐릭터 코멘트 규칙 작성
- [x] 연속 기록 보상 정책 정의
- [x] domain 테스트 추가

### Analysis

- [x] 월간 예산 대비 지출 계산
- [x] 카테고리별 합계/비율 계산
- [x] 목표 달성률 계산
- [x] 분석 문구 생성 규칙 추가
- [x] 기간 선택 UI 설계

### Shop / Reward

- [x] 코인 획득 규칙 정의
- [x] 아이템 구매 상태 모델링
- [x] 아이템 해금 조건 구현
- [x] 보유 아이템 장착 플로우 설계
- [x] 홈 화면 펫 착용 아이템 반영
- [x] 착용 중 아이템 재선택 시 해제
- [x] 프리미엄 상자 정책 확정
- [ ] 무료 포인트 획득 정책 분리: 출석, 연속 출석, 시간 간격 기록, 광고 보상
- [ ] 유료 희귀 아이템 등급/가격 정책 분리
- [ ] 코스튬/배경 아이템 카탈로그 타입 확장
- [ ] 광고 보상 쿨다운/일일 제한 정책 설계

### Community

- [x] 베스트 코디 데이터 모델 설계
- [x] 코디 자랑하기 화면 설계
- [x] 경량 댓글 모델 설계
- [x] 좋아요/응원 반응 모델 설계
- [ ] 커뮤니티 신고/숨김 정책 검토

### Data / Backend

- [x] 로컬 mock 데이터 구조 정리
- [x] localStorage 영속 상태 구현
- [ ] 실제 저장소 후보 결정
- [ ] 사용자 식별 방식 검토
- [ ] 지출 기록 API 설계
- [ ] 캐릭터 상태 저장 구조 설계
- [ ] 보상/상점 상태 저장 구조 설계
- [ ] 포인트/유료재화/광고보상 이력 저장 구조 설계
- [ ] 사용자별 테마/배경/코스튬 설정 저장 구조 설계

### Apps in Toss

- [ ] Apps in Toss 권한 요구사항 검토
- [ ] 배포용 brand icon 교체
- [x] AIT build 산출물 검증
- [x] Toss WebView에서 navigation/back event 정책 확정
- [ ] 실기기 QA 체크리스트 작성

### Quality

- [x] domain 로직 단위 테스트 추가
- [ ] 주요 화면 smoke test 추가 검토
- [x] lint warning 0개 유지
- [x] npm audit 결과 검토
- [x] 접근성 label/aria 점검
- [x] 텍스트 overflow 점검
