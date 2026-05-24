# AI Character Generation Contract

사진 기반 AI 캐릭터 생성은 유료 기능입니다. 출시 전 돈이 드는 호출은 하지 않고, 아래 계약만 고정합니다.

## Price

- 2회 생성권: 550원
- 5회권: 1,100원
- 사용자 1명당 AI 생성 캐릭터 최대 보유 수: 5개
- 5개를 모두 보유 중이면 새 생성 전에 캐릭터 컬렉션에서 1개 삭제
- 생성 결과는 수정할 수 없고, 마음에 들지 않으면 컬렉션에서 삭제 후 생성권으로 다시 생성
- 결제 성공 후에만 생성 job 생성
- 실패/환불 정책은 결제 SDK 연결 시 확정

## Flow

```text
사용자 사진 선택
-> 사진 업로드: Supabase Storage `pet-photos/{userId}/...`
-> 결제 생성: purchases(product_type = ai_character, price_krw = 550)
   또는 5회권 purchases(product_type = ai_character_pack, price_krw = 1100)
-> 결제 성공 확인
-> 현재 AI 생성 캐릭터 보유 수 5개 미만 확인
-> 생성 후 수정 불가/삭제 후 재생성 안내 확인
-> ai_character_jobs row 생성
-> 사진 검수
-> OpenAI image generation
-> 결과 PNG 저장: Supabase Storage `pet-characters/{userId}/...`
-> pets row 생성(source = photo)
-> 캐릭터 컬렉션에 추가
```

## OpenAI Call Boundary

- 프론트엔드에서 `OPENAI_API_KEY`를 사용하지 않습니다.
- Vercel/AIT 서버 함수 또는 별도 backend에서만 OpenAI를 호출합니다.
- 현재 `api/ai-character.js`는 disabled stub입니다.
- `AI_CHARACTER_GENERATION_ENABLED=true`가 되기 전에는 OpenAI 호출이 발생하지 않습니다.

## Output

- PNG 1장
- 투명 배경
- 캐릭터는 앱에서 scale/effect로만 반응
- 모자/안경/목걸이 등 신체 부착 아이템을 고려하지 않음

## Required Env

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_IAP_AI_CHARACTER_SKU=
VITE_IAP_AI_CHARACTER_PACK_SKU=
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
AI_CHARACTER_GENERATION_ENABLED=false
```

## Payment Implementation

- Client: `src/lib/tossPayments.ts`
- Grant order: `api/iap/grant.js`
- Purchase rows are stored as `paid` after Apps in Toss IAP calls `processProductGrant`.
- The server grant API updates `profiles.ai_character_credits` after receiving `orderId` and `sku`.
- On successful grant, the client also increments local `aiCharacterCredits` so the UI reflects the purchase immediately.
