import styled from "styled-components";

type EmptyStateProps = {
  icon: string;
  message: string;
  sub?: string;
};

export function EmptyState({ icon, message, sub }: EmptyStateProps) {
  return (
    <Wrap>
      <Icon>{icon}</Icon>
      <Message>{message}</Message>
      {sub && <Sub>{sub}</Sub>}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
`;

const Icon = styled.div`
  font-size: 36px;
  opacity: 0.5;
`;

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 15px;
  font-weight: 500;
  text-align: center;
`;

const Sub = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 400;
  text-align: center;
  opacity: 0.7;
`;
