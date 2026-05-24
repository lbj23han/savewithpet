export type TossLoginStatus =
  | { status: "linked"; tossUserKey: string }
  | { message: string; status: "unavailable" };

export function getTossLoginReady(): boolean {
  return Boolean(import.meta.env.VITE_TOSS_LOGIN_CLIENT_ID);
}

export async function requestTossLogin(): Promise<TossLoginStatus> {
  if (!getTossLoginReady()) {
    return {
      message: "Toss Login client id 설정 후 연동할 수 있어요",
      status: "unavailable",
    };
  }

  return {
    message: "Toss Login SDK 연결 후 사용자 키를 저장할 수 있어요",
    status: "unavailable",
  };
}
