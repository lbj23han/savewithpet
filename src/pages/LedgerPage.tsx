import { CheckCircle2 } from "lucide-react";
import styled from "styled-components";

import { PrimaryButton } from "../components/PrimaryButton";
import { LEDGER_COPY } from "../constants/copy";
import { ledgerCategories } from "../mocks/appData";

export function LedgerPage() {
  return (
    <Page>
      <BudgetHero>
        <span>{LEDGER_COPY.month}</span>
        <strong>₩ 1,240,500</strong>
        <p>{LEDGER_COPY.budgetHint}</p>
      </BudgetHero>

      <CategoryHeader>
        <h2>카테고리</h2>
        <button>편집</button>
      </CategoryHeader>
      <CategoryGrid>
        {ledgerCategories.map((category) => (
          <CategoryButton key={category.id} $selected={Boolean(category.selected)}>
            <span>{category.icon}</span>
            <strong>{category.label}</strong>
          </CategoryButton>
        ))}
      </CategoryGrid>

      <AmountBox>
        <span>{LEDGER_COPY.amountLabel}</span>
        <strong>₩ 12,500</strong>
      </AmountBox>

      <MemoInput placeholder={LEDGER_COPY.memoPlaceholder} />
      <PrimaryButton>
        <CheckCircle2 size={24} />
        {LEDGER_COPY.submitButton}
      </PrimaryButton>

      <Advice>
        <Avatar>🐹</Avatar>
        <div>
          <strong>{LEDGER_COPY.petAdviceName}</strong>
          <p>{LEDGER_COPY.petAdvice}</p>
        </div>
      </Advice>
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const BudgetHero = styled.section`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.lg};
  padding: 42px 20px 74px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.purple};
  border-radius: 0 0 40px 40px;

  span {
    font-weight: 800;
  }

  strong {
    font-size: 38px;
    font-weight: 900;
  }

  p {
    margin: 0;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.14);
    border-radius: ${({ theme }) => theme.radius.pill};
    font-weight: 900;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 23px;
  }

  button {
    color: ${({ theme }) => theme.colors.orangeDark};
    background: transparent;
    font-weight: 900;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryButton = styled.button<{ $selected: boolean }>`
  display: grid;
  min-height: 94px;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.orange : "transparent")};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};

  span {
    font-size: 26px;
  }

  strong {
    font-size: 14px;
  }
`;

const AmountBox = styled.section`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  span {
    color: #9a776b;
    font-weight: 900;
  }

  strong {
    font-size: 30px;
    font-weight: 900;
  }
`;

const MemoInput = styled.input`
  width: 100%;
  min-height: 58px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 2px solid #dfc6b8;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 18px;
  font-weight: 800;

  &::placeholder {
    color: #c8b8ae;
  }
`;

const Advice = styled.section`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.greenSoft};
  border: 1px solid #6ee6a6;
  border-radius: ${({ theme }) => theme.radius.xl};

  strong {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #315346;
    line-height: 1.45;
    font-weight: 700;
  }
`;

const Avatar = styled.div`
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  font-size: 34px;
`;
