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

현재는 이미지 구상안을 기준으로 러프 UI와 화면 이동 구조를 잡아둔 상태입니다.

- 온보딩: 반려캐릭터 선택
- 홈: 캐릭터 상태, 오늘 요약, 기록 CTA
- 장부: 카테고리 선택, 지출 금액, 메모 입력
- 분석: 월간 소비 분석, 카테고리 비율, 목표 달성 현황
- 상점: 코스튬/아이템 구매 UI
- 설정: 기본 설정 placeholder

## Screen Plan

### Onboarding

- 반려캐릭터 선택
- 프리셋 캐릭터 선택
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
- 다이어리 아이템
- 배경 아이템
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
src/
  components/   reusable UI components
  constants/    labels, copy, navigation constants
  domain/       small domain rules and view model builders
  mocks/        mock data for MVP screens
  pages/        screen-level page components
  styles/       theme and global styles
  types/        shared TypeScript types
```

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

## Todo

### Next Priority

- [ ] 실기기/브라우저에서 전체 플로우 QA: 온보딩, 기록, 수정, 삭제, 분석, 구매, 착용, 초기화
- [x] 소비 패턴별 캐릭터 코멘트 규칙 작성
- [x] 빈 상태, 오류 상태, 저장 완료 피드백 정리
- [ ] 프리미엄 상자 정책 확정
- [ ] domain 로직 단위 테스트 추가
- [ ] Toss WebView back/home event 처리
- [ ] 앱 아이콘/브랜드 이미지 확정
- [ ] 커뮤니티 MVP 데이터 모델 설계
- [ ] 카테고리별 월 예산/한도 설정 검토

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
- [ ] 캐릭터 이미지 에셋 방향 확정
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
- [ ] 카테고리별 월 예산/한도 설정 설계

### Pet Growth

- [ ] 캐릭터 타입/성향 모델 구체화
- [x] 포만도/기분/성장 계산 규칙 정의
- [x] 레벨업 조건 정의
- [x] 소비 패턴별 캐릭터 코멘트 규칙 작성
- [x] 연속 기록 보상 정책 정의
- [ ] domain 테스트 추가

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
- [ ] 프리미엄 상자 정책 확정

### Community

- [ ] 베스트 코디 데이터 모델 설계
- [ ] 코디 자랑하기 화면 설계
- [ ] 경량 댓글 모델 설계
- [ ] 좋아요/응원 반응 모델 설계
- [ ] 커뮤니티 신고/숨김 정책 검토

### Data / Backend

- [x] 로컬 mock 데이터 구조 정리
- [x] localStorage 영속 상태 구현
- [ ] 실제 저장소 후보 결정
- [ ] 사용자 식별 방식 검토
- [ ] 지출 기록 API 설계
- [ ] 캐릭터 상태 저장 구조 설계
- [ ] 보상/상점 상태 저장 구조 설계

### Apps in Toss

- [ ] Apps in Toss 권한 요구사항 검토
- [ ] 배포용 brand icon 교체
- [ ] AIT build 산출물 검증
- [ ] Toss WebView에서 navigation/back event 정책 확정
- [ ] 실기기 QA 체크리스트 작성

### Quality

- [ ] domain 로직 단위 테스트 추가
- [ ] 주요 화면 smoke test 추가 검토
- [x] lint warning 0개 유지
- [ ] npm audit 결과 검토
- [ ] 접근성 label/aria 점검
- [ ] 텍스트 overflow 점검
