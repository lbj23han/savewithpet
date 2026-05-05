/* eslint-disable react-refresh/only-export-components */
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";

import config from "../granite.config";
import App from "./App";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";

function FallbackProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

async function bootstrap() {
  type ProviderType = React.ComponentType<{ children: ReactNode; brandPrimaryColor: string }>;
  let Provider: ProviderType = FallbackProvider;

  try {
    const { TDSMobileAITProvider } = await import("@toss/tds-mobile-ait");
    Provider = TDSMobileAITProvider as ProviderType;
  } catch {
    // Browser-only preview can run without the Apps in Toss provider.
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider brandPrimaryColor={config.brand.primaryColor}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </Provider>
    </StrictMode>,
  );
}

bootstrap();
