import styled from "styled-components";

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  min-height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.orange};
  border-radius: ${({ theme }) => theme.radius.pill};
  box-shadow: ${({ theme }) => theme.shadow.button};
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
`;
