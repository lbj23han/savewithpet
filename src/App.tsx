import { useState } from "react";

import { AppShell } from "./components/AppShell";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HomePage } from "./pages/HomePage";
import { LedgerPage } from "./pages/LedgerPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopPage } from "./pages/ShopPage";
import type { AppPage } from "./types/app";

function App() {
  const [page, setPage] = useState<AppPage>("onboarding");
  const activePage = page === "onboarding" ? "home" : page;

  if (page === "onboarding") {
    return <OnboardingPage onComplete={() => setPage("home")} />;
  }

  return (
    <AppShell activePage={activePage} onNavigate={setPage} showCoin={activePage === "shop"}>
      {activePage === "home" && <HomePage onRecord={() => setPage("ledger")} />}
      {activePage === "ledger" && <LedgerPage />}
      {activePage === "analysis" && <AnalysisPage />}
      {activePage === "shop" && <ShopPage />}
      {activePage === "settings" && <SettingsPage />}
    </AppShell>
  );
}

export default App;
