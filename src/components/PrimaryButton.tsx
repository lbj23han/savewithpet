import styled from "styled-components";

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  min-height: 64px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.button};
  font-size: 21px;
  font-weight: 900;
`;
