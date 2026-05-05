import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { calculateAppStats, createLedgerEntry } from "./domain/ledger";
import { createEntryReward } from "./domain/rewards";
import { createShopItemViewModels } from "./domain/shop";
import { defaultAppState, loadAppState, saveAppState } from "./lib/persistence";
import { shopItems } from "./mocks/appData";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HomePage } from "./pages/HomePage";
import { LedgerPage } from "./pages/LedgerPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopPage } from "./pages/ShopPage";
import type { AppPage, Category, LedgerEntryDraft, PersistedAppState } from "./types/app";

function App() {
  const [appState, setAppState] = useState<PersistedAppState>(() => loadAppState());
  const [page, setPage] = useState<AppPage>(() => (loadAppState().hasCompletedOnboarding ? "home" : "onboarding"));
  const activePage = page === "onboarding" ? "home" : page;
  const stats = calculateAppStats(appState.entries, appState.monthlyBudget);
  const shopItemViews = createShopItemViewModels({
    items: shopItems,
    coins: appState.coins,
    level: stats.level,
    ownedItemIds: appState.ownedItemIds,
    equippedItemId: appState.equippedItemId,
  });
  const equippedItem = shopItemViews.find((item) => item.id === appState.equippedItemId);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const addLedgerEntry = (draft: LedgerEntryDraft) => {
    const nextEntry = createLedgerEntry(draft);
    const reward = createEntryReward(draft, stats.streakDays);
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      entries: [nextEntry, ...prev.entries],
      rewardEvents: [reward, ...prev.rewardEvents].slice(0, 20),
    }));
    setPage("home");
  };

  const updateLedgerEntry = (entryId: string, draft: LedgerEntryDraft) => {
    setAppState((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.id === entryId ? { id: entryId, ...draft } : entry)),
    }));
  };

  const deleteLedgerEntry = (entryId: string) => {
    setAppState((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== entryId),
    }));
  };

  const addCategory = (category: Category) => {
    setAppState((prev) => ({ ...prev, categories: [...prev.categories, category] }));
  };

  const updateCategory = (categoryId: string, nextCategory: Pick<Category, "icon" | "label">) => {
    setAppState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId ? { ...category, ...nextCategory } : category,
      ),
    }));
  };

  const deleteCategory = (categoryId: string) => {
    setAppState((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== categoryId),
      entries: prev.entries.map((entry) => (entry.categoryId === categoryId ? { ...entry, categoryId: "etc" } : entry)),
    }));
  };

  const buyOrEquipItem = (itemId: string) => {
    const item = shopItemViews.find((candidate) => candidate.id === itemId);
    if (!item || item.state === "locked") return;

    if (item.state === "owned" || item.state === "equipped") {
      setAppState((prev) => ({ ...prev, equippedItemId: item.id }));
      return;
    }

    if (!item.canBuy) return;
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
      equippedItemId: item.id,
      ownedItemIds: [...prev.ownedItemIds, item.id],
    }));
  };

  const openPremiumBox = () => {
    const rewardItem = shopItemViews.find((item) => item.state === "available" && item.price <= appState.coins);
    if (!rewardItem) return;
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins - rewardItem.price,
      equippedItemId: rewardItem.id,
      ownedItemIds: [...prev.ownedItemIds, rewardItem.id],
    }));
  };

  const updateBudget = (budget: number) => {
    setAppState((prev) => ({ ...prev, monthlyBudget: budget }));
  };

  const resetLocalData = () => {
    setAppState(defaultAppState);
    setPage("onboarding");
  };

  if (page === "onboarding") {
    return (
      <OnboardingPage
        onComplete={(nextPet) => {
          setAppState((prev) => ({ ...prev, hasCompletedOnboarding: true, pet: nextPet }));
          setPage("home");
        }}
      />
    );
  }

  return (
    <AppShell activePage={activePage} coin={appState.coins} onNavigate={setPage} showCoin={activePage === "shop"}>
      {activePage === "home" && (
        <HomePage
          categories={appState.categories}
          entries={appState.entries}
          equippedItem={equippedItem}
          monthlyBudget={appState.monthlyBudget}
          pet={appState.pet}
          rewardEvents={appState.rewardEvents}
          stats={stats}
          wardrobeItems={shopItemViews.filter((item) => item.state === "owned" || item.state === "equipped")}
          onEquipItem={buyOrEquipItem}
          onOpenShop={() => setPage("shop")}
          onRecord={() => setPage("ledger")}
        />
      )}
      {activePage === "ledger" && (
        <LedgerPage
          budget={appState.monthlyBudget}
          categories={appState.categories}
          entries={appState.entries}
          onAddEntry={addLedgerEntry}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onDeleteEntry={deleteLedgerEntry}
          onUpdateCategory={updateCategory}
          onUpdateEntry={updateLedgerEntry}
        />
      )}
      {activePage === "analysis" && (
        <AnalysisPage
          budget={appState.monthlyBudget}
          categories={appState.categories}
          entries={appState.entries}
        />
      )}
      {activePage === "shop" && (
        <ShopPage
          coins={appState.coins}
          items={shopItemViews}
          level={stats.level}
          onItemAction={buyOrEquipItem}
          onOpenPremiumBox={openPremiumBox}
        />
      )}
      {activePage === "settings" && (
        <SettingsPage
          coins={appState.coins}
          entries={appState.entries}
          monthlyBudget={appState.monthlyBudget}
          pet={appState.pet}
          stats={stats}
          onResetData={resetLocalData}
          onUpdateBudget={updateBudget}
        />
      )}
    </AppShell>
  );
}

export default App;
