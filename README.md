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

AI 이미지 생성은 앱 실행 중 매번 호출하는 기능이 아니라, 캐릭터와 컷신 후보 asset을 만드는 제작 파이프라인입니다. 현재까지의 실험 결론은 명확합니다. 캐릭터가 서비스의 핵심이므로, 검수되지 않은 생성 이미지를 앱에 바로 연결하지 않습니다.

### Current Status

현재 `public/assets/cutscenes` 산출물은 모두 삭제했습니다. 이전 실험에서 만든 컷신은 품질이 들쑥날쑥했고, 얼굴/코/입/손이 깨지는 결과가 반복되어 프로덕션 기준으로 사용할 수 없었습니다.

남겨둔 것은 `scripts/generate-cutscene.mjs` 하나입니다. 이 스크립트는 최종 asset 생성기가 아니라, 프롬프트 품질을 검증하기 위한 로컬 실험 도구입니다.

실패한 방식은 의도적으로 제거했습니다.

- 전체 이미지를 다시 그리는 방식: 캐릭터 정체성이 쉽게 무너짐
- 눈만 덮어씌우는 방식: 원본 눈 제거와 정렬이 불안정해서 얼굴이 더 망가짐
- 원본 얼굴 패치 복원/합성 방식: 이음새, 손/팔 중복, 배경 부자연스러움 발생
- 귀를 세우는 식의 큰 실루엣 변경: 의도 반영이 낮고 머리 윤곽이 깨짐
- 원형 글로우/무대 원/임의 배경 추가: 앱 UI와 충돌

따라서 다음 에이전트는 삭제된 합성/복원 스크립트를 되살리는 대신, 아래 파이프라인을 기준으로 다시 설계합니다.

### Production Direction

사용자 사진 기반 캐릭터도 프리셋과 같은 흐름으로 처리합니다.

```text
사용자 사진 또는 프리셋 원본
-> 대표 캐릭터 base.png 생성
-> 사용자가 base.png 승인
-> pet profile 저장: species, traits, anchors, faceBox, bodyBox
-> interaction set 후보 생성
-> 자동/수동 품질 검수
-> 통과한 이미지만 storage와 manifest에 저장
```

런타임에서는 AI를 호출하지 않습니다. 홈 화면, 탭 반응, 기록 완료 반응, 감정 변화는 검수된 PNG/파츠/CSS 모션/Rive/Spine/Live2D로 처리합니다. AI 호출은 최초 캐릭터 생성, 희귀 코디 이미지, 월간 리포트 대표 이미지처럼 사용자가 기다릴 수 있는 순간에 제한합니다.

장기적으로 안정적인 구조는 한 장짜리 AI 컷신을 계속 뽑는 방식이 아닙니다.

```text
base.png
+ eyes/*.png
+ mouth/*.png
+ paws/*.png
+ effects/*.png
+ backgrounds/*.png
+ CSS/Rive/Spine/Live2D animation
```

AI가 맡기 좋은 영역:

- 최초 대표 캐릭터 생성
- 배경 asset 생성
- 코스튬/아이템 후보 생성
- 이펙트 파츠 생성
- 컷신 후보 이미지 생성

AI에 맡기면 위험한 영역:

- 최종 얼굴 유지
- 코/입/눈 간격 보존
- 손/팔/꼬리의 일관성
- 다마고치식 반복 인터랙션 전체
- 매일 보여주는 홈 캐릭터 기본 상태

### Script Ownership

`scripts/generate-cutscene.mjs`는 OpenAI 이미지 edit 기반 실험 도구입니다. 직접 프롬프트를 사용자가 쓰는 방식이 아니라, 이벤트와 펫 정보를 넣으면 코드가 구조화된 프롬프트를 생성합니다.

지원 옵션:

```bash
npm run cutscene -- --pet ttoosseunyang --event wink --print-prompt
npm run cutscene -- --pet akkigae --event sad_eyes --species dog --print-prompt
npm run cutscene -- --pet custom-pet --image public/assets/pets/custom.png --species cat --traits "black tuxedo coat, green eyes, white socks" --event one_hand_wave --print-prompt
```

주요 옵션:

- `--pet`: 기준 캐릭터 id. 기본값은 `ttoosseunyang`
- `--image`: 기준 PNG 경로. 사용자 사진 기반 캐릭터 실험 시 사용
- `--event`: `wink`, `sad_eyes`, `one_hand_wave`, `record_complete`, `budget_over`, `level_up`, `feed_treat`, `daily_checkin`, `outfit_share`
- `--mode`: `variant` 또는 `scene`. 기본은 작은 상호작용이면 `variant`
- `--species`: `dog`, `cat`, `unknown`
- `--traits`: 사진에서 추출한 털색, 무늬, 눈색, 귀 모양, 꼬리 모양 등 보존할 특징
- `--mask`: 편집 가능 영역을 제한하는 마스크
- `--print-prompt`: 이미지를 생성하지 않고 최종 프롬프트만 출력

생성 결과는 `public/assets/cutscenes`에 저장되지만, 이 폴더의 이미지는 검수 전 후보입니다. 바로 앱에 연결하지 않습니다.

### Prompt Strategy

현재 가장 나았던 프롬프트 방향은 “작은 영역만 편집하고 나머지는 잠그는 계약형 프롬프트”입니다. 프롬프트는 아래 순서로 구성합니다.

```text
TASK
NON-NEGOTIABLE CONTRACT
PRIORITY ORDER
IDENTITY PROFILE
ALLOWED EDIT
LOCKED REGIONS
FACE PATCH PRESERVATION
FACIAL SAFETY RULES
STYLE AND OUTPUT RULES
QUALITY CHECK BEFORE FINAL IMAGE
```

핵심 우선순위:

1. 같은 캐릭터와 같은 종으로 보여야 함
2. 얼굴 패치, 특히 눈 간격, 코, 입, 볼, 얼굴 무늬를 보존해야 함
3. 실루엣, 몸 비율, 팔/다리/꼬리, 색상, 선 스타일을 보존해야 함
4. 허용된 작은 영역만 바꿔야 함
5. 감정 표현은 1-4번을 깨지 않는 선에서만 적용

성공 확률이 상대적으로 높은 이벤트:

- `wink`: 한쪽 눈만 단순한 감은 눈으로 변경
- `sad_eyes`: 눈꺼풀/눈썹 느낌만 아주 작게 변경
- `one_hand_wave`: 얼굴은 완전 고정하고 한쪽 앞발만 작게 변경
- `external_effects_only`: 캐릭터 본체는 잠그고 주변 투명 영역에 작은 효과만 추가

실패 확률이 높은 이벤트는 기본 지원에서 제외합니다. 귀를 세우거나 몸 전체 포즈를 크게 바꾸는 식의 요청은 얼굴과 실루엣이 깨질 가능성이 높습니다. 이런 동작은 AI 생성보다 리깅/파츠 애니메이션으로 처리합니다.

### Species Branching

사진 기반 캐릭터 생성 후에는 아래 정보를 `traits` 또는 서버의 `petProfile`에 저장합니다.

공통 보존값:

- 종, 품종 인상, 털색, 얼굴 무늬, 눈색, 코색, 귀 모양, 꼬리 모양, 체형, 대표 색상

강아지 보존값:

- 귀 부착점, 귀 처짐/섬, 주둥이 길이, 코 크기, 발 모양, 꼬리 실루엣

고양이 보존값:

- 삼각 귀, 수염 위치, 짧은 주둥이, 볼 라인, 꼬리 곡선, 눈 간격

사진 기반 캐릭터는 고유 무늬와 비대칭을 일반화하지 않습니다. 흰 양말, 점박이, 턱색, 콧등 무늬, 한쪽 귀색 같은 요소는 정체성으로 잠급니다.

### Quality Gate

생성 이미지는 아래 조건 중 하나라도 걸리면 폐기합니다.

- 얼굴이 원본과 달라짐
- 코나 입이 새로 그려진 느낌이 남
- 눈 간격, 눈 색, 눈 하이라이트가 달라짐
- 손/팔/다리/꼬리가 중복됨
- 종이 달라 보임
- 원형 글로우, 무대 원, 임의 배경, 그림자, UI, 텍스트가 생김
- 투명 배경이 아니라 체크무늬나 흰 배경이 그려짐
- 원본보다 더 복잡하거나 다른 화풍으로 바뀜

서버 도입 시 저장 구조 예시:

```text
users/{userId}/pets/{petId}/base.png
users/{userId}/pets/{petId}/scenes/idle.png
users/{userId}/pets/{petId}/scenes/happy.png
users/{userId}/pets/{petId}/scenes/worried.png
users/{userId}/pets/{petId}/scenes/proud.png
```

manifest 예시:

```json
{
  "petId": "pet_123",
  "baseImageUrl": ".../base.png",
  "scenes": {
    "record_complete": ".../happy.png",
    "budget_over": ".../worried.png",
    "level_up": ".../proud.png"
  }
}
```

### Environment

```bash
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=low
OPENAI_IMAGE_INPUT_FIDELITY=high
OPENAI_IMAGE_BACKGROUND=transparent
OPENAI_CUTSCENE_STORAGE=local
OPENAI_CUTSCENE_OUTPUT_DIR=public/assets/cutscenes
OPENAI_CUTSCENE_MODE=variant
```

로컬에서는 `.env.local`에 키를 넣습니다. `.env.local`은 git에 올리지 않습니다.

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
