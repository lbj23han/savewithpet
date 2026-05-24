import styled, { keyframes } from "styled-components";

type LoginPageProps = {
  isRequesting: boolean;
  loginReady: boolean;
  onTossLogin: () => void;
};

export function LoginPage({ isRequesting, loginReady, onTossLogin }: LoginPageProps) {
  return (
    <Page>
      <Hero>
        <PetTrio>
          <PetImage src="/assets/pets/akkigae.png?v=2" alt="" />
          <PetImage src="/assets/pets/ttoosseunyang.png?v=2" alt="" />
          <PetImage src="/assets/pets/kangchongmu.png?v=2" alt="" />
        </PetTrio>
        <Title>냥비하지말개</Title>
        <Subtitle>
          소비를 기록하면 반려 캐릭터가 함께 자라요.
          <br />
          Toss 계정으로 시작해주세요.
        </Subtitle>
      </Hero>
      <Actions>
        <LoginButton disabled={!loginReady || isRequesting} onClick={onTossLogin}>
          {isRequesting ? (
            <>
              <Spinner aria-hidden="true" />
              연동 중...
            </>
          ) : loginReady ? (
            "Toss로 시작하기"
          ) : (
            "연동 준비 중"
          )}
        </LoginButton>
        <Helper>로그인 후 캐릭터를 골라 시작할 수 있어요.</Helper>
      </Actions>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100dvh;
  padding: 48px 24px 32px;
  background: linear-gradient(180deg, #fff5f9 0%, #ffe0ec 100%);
`;

const Hero = styled.section`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 24px;
  padding: 32px 0;
  text-align: center;
`;

const PetTrio = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
`;

const PetImage = styled.img`
  width: 88px;
  height: 88px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  animation: ${float} 3.2s ease-in-out infinite;

  &:nth-of-type(2) {
    width: 104px;
    height: 104px;
    animation-delay: 0.4s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.8s;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
`;

const Actions = styled.div`
  display: grid;
  gap: 12px;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 54px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;

  &:disabled {
    color: ${({ theme }) => theme.colors.muted};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

const Helper = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
`;

const spinnerRotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  animation: ${spinnerRotate} 700ms linear infinite;
`;
