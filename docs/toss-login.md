# Toss Login Contract

Toss Login은 최종 Toss/AIT 연동 시 붙입니다. 현재는 Supabase anonymous auth로 로컬 상태를 저장하고, Toss 사용자 키를 받을 준비만 해둡니다.

## Env

```bash
VITE_TOSS_LOGIN_CLIENT_ID=
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

최종 연동에서는 `updown-brief`의 Toss Login 구현을 참고해서 SDK 호출부만 교체합니다.
