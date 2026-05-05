import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { addCommunityComment, createOutfitPost, likeCommunityPost } from "./domain/community";
import { calculateAppStats, createLedgerEntry } from "./domain/ledger";
import { createEntryReward } from "./domain/rewards";
import { createShopItemViewModels, openPremiumBox as resolvePremiumBox } from "./domain/shop";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    let removeBack: (() => void) | undefined;
    let removeHome: (() => void) | undefined;

    import("@apps-in-toss/web-framework")
      .then(({ graniteEvent }) => {
        removeBack = graniteEvent.addEventListener("backEvent", {
          onEvent: () => setPage((prev) => (prev === "home" ? "home" : "home")),
        });
        removeHome = graniteEvent.addEventListener("homeEvent", {
          onEvent: () => setPage("home"),
        });
      })
      .catch(() => undefined);

    return () => {
      removeBack?.();
      removeHome?.();
    };
  }, []);

  const addLedgerEntry = (draft: LedgerEntryDraft) => {
    const nextEntry = createLedgerEntry(draft);
    const reward = createEntryReward(draft, stats.streakDays);
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      entries: [nextEntry, ...prev.entries],
      rewardEvents: [reward, ...prev.rewardEvents].slice(0, 20),
    }));
    setToastMessage(`${reward.label} +${reward.coins}코인`);
    setPage("home");
  };

  const updateLedgerEntry = (entryId: string, draft: LedgerEntryDraft) => {
    setAppState((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.id === entryId ? { id: entryId, ...draft } : entry)),
    }));
    setToastMessage("기록을 수정했어요");
  };

  const deleteLedgerEntry = (entryId: string) => {
    setAppState((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== entryId),
    }));
    setToastMessage("기록을 삭제했어요");
  };

  const addCategory = (category: Category) => {
    setAppState((prev) => ({ ...prev, categories: [...prev.categories, category] }));
    setToastMessage("카테고리를 추가했어요");
  };

  const updateCategory = (categoryId: string, nextCategory: Pick<Category, "icon" | "label">) => {
    setAppState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId ? { ...category, ...nextCategory } : category,
      ),
    }));
    setToastMessage("카테고리를 수정했어요");
  };

  const deleteCategory = (categoryId: string) => {
    setAppState((prev) => ({
      ...prev,
      categoryBudgets: Object.fromEntries(Object.entries(prev.categoryBudgets).filter(([id]) => id !== categoryId)),
      categories: prev.categories.filter((category) => category.id !== categoryId),
      entries: prev.entries.map((entry) => (entry.categoryId === categoryId ? { ...entry, categoryId: "etc" } : entry)),
    }));
    setToastMessage("카테고리를 삭제했어요");
  };

  const buyOrEquipItem = (itemId: string) => {
    const item = shopItemViews.find((candidate) => candidate.id === itemId);
    if (!item || item.state === "locked") return;

    if (item.state === "owned" || item.state === "equipped") {
      setAppState((prev) => ({ ...prev, equippedItemId: item.id }));
      setToastMessage(`${item.name} 착용 완료`);
      return;
    }

    if (!item.canBuy) return;
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
      equippedItemId: item.id,
      ownedItemIds: [...prev.ownedItemIds, item.id],
    }));
    setToastMessage(`${item.name} 구매 완료`);
  };

  const openPremiumBox = () => {
    const result = resolvePremiumBox(shopItemViews, appState.coins);
    if (result.outcome !== "item" || !result.itemId) {
      setToastMessage(result.label);
      return;
    }
    const itemId = result.itemId;

    setAppState((prev) => ({
      ...prev,
      coins: prev.coins - result.coinsSpent,
      equippedItemId: itemId,
      ownedItemIds: prev.ownedItemIds.includes(itemId) ? prev.ownedItemIds : [...prev.ownedItemIds, itemId],
    }));
    setToastMessage(result.label);
  };

  const updateBudget = (budget: number) => {
    setAppState((prev) => ({ ...prev, monthlyBudget: budget }));
    setToastMessage("예산을 저장했어요");
  };

  const updateCategoryBudget = (categoryId: string, budget: number) => {
    setAppState((prev) => ({
      ...prev,
      categoryBudgets: { ...prev.categoryBudgets, [categoryId]: budget },
    }));
  };

  const shareOutfit = () => {
    const post = createOutfitPost({ equippedItem, pet: appState.pet });
    setAppState((prev) => ({
      ...prev,
      communityPosts: [post, ...prev.communityPosts].slice(0, 30),
    }));
    setToastMessage("코디 자랑을 저장했어요");
  };

  const likePost = (postId: string) => {
    setAppState((prev) => ({ ...prev, communityPosts: likeCommunityPost(prev.communityPosts, postId) }));
  };

  const addComment = (postId: string, message: string) => {
    setAppState((prev) => ({
      ...prev,
      communityPosts: addCommunityComment({ message, postId, posts: prev.communityPosts }),
    }));
    setToastMessage("댓글을 남겼어요");
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
    <AppShell
      activePage={activePage}
      coin={appState.coins}
      onNavigate={setPage}
      showCoin={activePage === "shop"}
      toastMessage={toastMessage}
    >
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
          onShareOutfit={shareOutfit}
          onRecord={() => setPage("ledger")}
        />
      )}
      {activePage === "ledger" && (
        <LedgerPage
          budget={appState.monthlyBudget}
          categories={appState.categories}
          categoryBudgets={appState.categoryBudgets}
          entries={appState.entries}
          onAddEntry={addLedgerEntry}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onDeleteEntry={deleteLedgerEntry}
          onUpdateCategory={updateCategory}
          onUpdateCategoryBudget={updateCategoryBudget}
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
          onPostComment={addComment}
          onPostLike={likePost}
          onShareOutfit={shareOutfit}
          posts={appState.communityPosts}
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
