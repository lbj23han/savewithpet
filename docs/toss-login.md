# Toss Login Contract

Toss Login은 Apps in Toss `appLogin()` SDK + Vercel serverless 백엔드로 연동됩니다. 익명 Supabase 세션은 그대로 유지되고, Toss 사용자 키를 받아 동일 `profiles.id` row에 `toss_user_key`와 `toss_login_linked_at`를 채워 연동합니다.

## Architecture

```text
[Client]
  └ requestTossLogin()
      └ appLogin() → { authorizationCode, referrer }
      └ POST /api/auth/toss-login   (Authorization: Bearer <supabase access token>)
            { authorizationCode, referrer }

[Vercel API]
  └ /api/auth/toss-login
      ├ getUserFromRequest()  # Supabase access token → user.id
      ├ tossClient.generateToken()  # mTLS
      ├ tossClient.getMe()
      ├ decryptField(name)
      ├ profiles upsert { id, toss_user_key, display_name, toss_login_linked_at }
      └ tossClient.removeByAccessToken()  # access token 즉시 폐기
  └ /api/auth/toss-disconnect (GET/POST)  # Toss webhook: toss_user_key/linked_at NULL 처리
```

## Env

프론트:

```bash
VITE_AUTH_ENABLED=true
VITE_API_BASE=                       # Vercel 배포 URL
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

서버 (Vercel/AIT 환경 변수):

```bash
SUPABASE_SERVICE_ROLE_KEY=
TOSS_DECRYPT_KEY=                    # base64 AES-256 key (Toss 콘솔에서 이메일로 수신)
TOSS_DECRYPT_AAD=TOSS
# mTLS 인증서/키 — 다음 중 하나만 채우면 됨
TOSS_MTLS_CERT_BASE64=
TOSS_MTLS_KEY_BASE64=
# 또는 로컬 파일 경로
MTLS_CERT_PATH=server/certs/savewithpet_public.crt
MTLS_KEY_PATH=server/certs/savewithpet_private.key
```

`VITE_TOSS_LOGIN_CLIENT_ID`는 SDK 자체에서 자동 인식하므로 코드에서 직접 사용하지 않습니다. AIT 콘솔에서 클라이언트 ID와 mTLS 인증서를 발급받습니다.

## Files

- `src/lib/tossLogin.ts`: `getTossLoginReady()`, `requestTossLogin()`, `loadTossLoginInfo()`
- `src/App.tsx`: `tossLoginInfo` state, `handleTossLogin()`, 초기 로드 useEffect
- `src/pages/SettingsPage.tsx`: 상단 `Toss 계정 연동` 패널, linked 상태 표시
- `api/auth/toss-login.js`: 로그인 endpoint
- `api/auth/toss-disconnect.js`: 연동 해제 webhook
- `api/_toss-client.js`: mTLS https.request 래퍼 (generateToken/getMe/removeByAccessToken/refreshToken)
- `api/_toss-decrypt.js`: AES-256-GCM `decryptField()`
- `server/certs/savewithpet_public.crt`, `savewithpet_private.key`: 로컬용 mTLS 인증서
- `supabase/initial-schema.sql`: `profiles.toss_user_key`, `profiles.toss_login_linked_at` 컬럼

## Flow

1. 사용자가 설정 > `Toss로 연동하기` 버튼 클릭
2. `appLogin()`이 Toss 인증창을 띄움 → `authorizationCode`, `referrer` 수신
3. 프론트가 Supabase access token과 함께 `/api/auth/toss-login` POST
4. 백엔드가 mTLS로 Toss API 호출 → 사용자 정보 수신 → 복호화
5. `profiles` row에 `toss_user_key`/`display_name`/`toss_login_linked_at` 저장
6. 동일 toss_user_key를 다른 supabase user가 이미 가지고 있으면 HTTP 409 응답
7. 프론트는 응답을 받아 토스트로 결과 표시 + state 업데이트

## Constraints

- mTLS 인증서가 없으면 백엔드는 HTTP 500 `missing_mtls_credential` 반환
- Toss API 응답이 실패하면 HTTP 401 + `toss_generate_token_failed` 또는 `toss_get_me_failed`
- 동일 Toss 계정이 다른 supabase user에 이미 연결돼 있으면 HTTP 409 `toss_user_already_linked`
- 브라우저(앱 외부) 환경에서는 `appLogin()`이 실패 → `unsupported_environment`로 처리
- AIT 콘솔의 webhook URL은 `https://<vercel-domain>/api/auth/toss-disconnect` 로 설정
