import styled from "styled-components";

import { Panel } from "../components/Panel";

export function SettingsPage() {
  return (
    <Page>
      <Panel>
        <h1>설정</h1>
        <SettingRow>
          <span>알림</span>
          <strong>켜짐</strong>
        </SettingRow>
        <SettingRow>
          <span>캐릭터</span>
          <strong>장부</strong>
        </SettingRow>
        <SettingRow>
          <span>데이터</span>
          <strong>목업</strong>
        </SettingRow>
      </Panel>
    </Page>
  );
}

const Page = styled.div`
  padding-top: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xl};
    font-size: 24px;
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 800;
  }
`;
