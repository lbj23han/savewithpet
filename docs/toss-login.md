# Toss Login Contract

Toss Login은 최종 Toss/AIT 연동 시 붙입니다. 현재는 Supabase anonymous auth로 로컬 상태를 저장하고, Toss 사용자 키를 받을 준비만 해둡니다.

## Env

```bash
VITE_AUTH_ENABLED=true
VITE_API_BASE=
VITE_TOSS_LOGIN_CLIENT_ID=
TOSS_DECRYPT_KEY=
TOSS_DECRYPT_AAD=TOSS
TOSS_MTLS_CERT_BASE64=
TOSS_MTLS_KEY_BASE64=
MTLS_CERT_PATH=server/certs/savewithpet_public.crt
MTLS_KEY_PATH=server/certs/savewithpet_private.key
# Optional: only for OAuth code exchange login.
TOSS_LOGIN_CLIENT_SECRET=
```

## Flow

```text
Toss Login SDK 호출
-> toss user key 수신
-> profiles.toss_user_key 저장
-> profiles.toss_login_linked_at 저장
-> 기존 anonymous profile과 연결
```

## Current Code

- `src/lib/tossLogin.ts`: client id 존재 여부와 disabled stub
- `supabase/initial-schema.sql`: `profiles.toss_user_key`, `profiles.toss_login_linked_at`

최종 연동에서는 `updown-brief`의 Toss 구현을 참고합니다. `updown-brief` 기준으로는
`TOSS_DECRYPT_KEY`, `TOSS_DECRYPT_AAD`, mTLS 인증서/키가 핵심이고,
`TOSS_LOGIN_CLIENT_SECRET`는 OAuth code exchange 방식으로 바꿀 때만 채웁니다.
