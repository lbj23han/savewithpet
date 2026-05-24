import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { addCommunityComment, createOutfitPost, likeCommunityPost } from "./domain/community";
import { createPetFromPreset } from "./domain/avatarGenerator";
import { AI_CHARACTER_GENERATION_PRICE_KRW, getAiCharacterDisabledMessage } from "./domain/aiCharacterPolicy";
import { calculateAppStats, createLedgerEntry } from "./domain/ledger";
import { calculateEffectiveIntimacy, feedPet } from "./domain/petCare";
import { createEntryReward } from "./domain/rewards";
import { createShopItemViewModels, openPremiumBox as resolvePremiumBox } from "./domain/shop";
import { saveAppStateToCloud } from "./lib/cloudPersistence";
import { defaultAppState, loadAppState, saveAppState } from "./lib/persistence";
import { petPresets, shopItems } from "./mocks/appData";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HomePage } from "./pages/HomePage";
import { LedgerPage } from "./pages/LedgerPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopPage } from "./pages/ShopPage";
import type { AppPage, Category, LedgerEntryDraft, PersistedAppState } from "./types/app";

const DEV_UNLOCKED_COINS = 999_999;
const DEV_UNLOCKED_LEVEL = 99;
const BASE_CHARACTER_PRICE = 200;

function App() {
  const [appState, setAppState] = useState<PersistedAppState>(() => loadAppState());
  const [page, setPage] = useState<AppPage>(() => (loadAppState().hasCompletedOnboarding ? "home" : "onboarding"));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const activePage = page === "onboarding" ? "home" : page;
  const stats = calculateAppStats(appState.entries, appState.monthlyBudget);
  const appCoins = import.meta.env.DEV ? DEV_UNLOCKED_COINS : appState.coins;
  const appStats = import.meta.env.DEV
    ? {
        ...stats,
        fullness: 100,
        growth: 100,
        level: DEV_UNLOCKED_LEVEL,
        mood: 100,
      }
    : stats;
  const snackItems = shopItems.filter((item) => item.itemType === "snack");
  const wardrobeCatalogItems = shopItems.filter((item) => item.itemType !== "snack");
  const ownedItemIds = import.meta.env.DEV ? wardrobeCatalogItems.map((item) => item.id) : appState.ownedItemIds;
  const effectiveIntimacy = calculateEffectiveIntimacy(appState.intimacy, appState.lastFedAt);
  const ownedPetIds = appState.ownedPetIds.includes(appState.pet.id)
    ? appState.ownedPetIds
    : [...appState.ownedPetIds, appState.pet.id];
  const shopItemViews = createShopItemViewModels({
    items: shopItems,
    coins: appCoins,
    level: appStats.level,
    ownedItemIds,
    equippedItemId: appState.equippedItemId,
  });
  const equippedItem = shopItemViews.find((item) => item.id === appState.equippedItemId);
  const characterShopItems = petPresets.map((preset) => {
    const owned = ownedPetIds.includes(preset.id);

    return {
      ...preset,
      active: appState.pet.id === preset.id,
      canBuy: !owned && appCoins >= BASE_CHARACTER_PRICE,
      owned,
      price: BASE_CHARACTER_PRICE,
    };
  });

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void saveAppStateToCloud(appState).then((result) => {
        if (result.status === "error") {
          console.warn("Supabase sync failed", result.error);
        }
      });
    }, 700);

    return () => window.clearTimeout(timer);
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
    const reward = createEntryReward(draft, appStats.streakDays);
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
    if (!confirmAction("이 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없어요.")) return;

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
    if (!confirmAction("이 카테고리를 삭제할까요? 연결된 기록은 기타 카테고리로 이동해요.")) return;

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
    if (!item || item.itemType === "snack" || item.state === "locked") return;

    if (item.state === "equipped") {
      setAppState((prev) => ({ ...prev, equippedItemId: null }));
      setToastMessage(`${item.name} 해제`);
      return;
    }

    if (item.state === "owned") {
      setAppState((prev) => ({ ...prev, equippedItemId: item.id }));
      setToastMessage(`${item.name} 적용 완료`);
      return;
    }

    if (!item.canBuy) return;
    if (!confirmAction(`${item.name}을 ${item.price.toLocaleString("ko-KR")}코인으로 구매하고 적용할까요?`)) return;

    setAppState((prev) => ({
      ...prev,
      coins: spendCoins(prev.coins, item.price),
      equippedItemId: item.id,
      ownedItemIds: [...prev.ownedItemIds, item.id],
    }));
    setToastMessage(`${item.name} 구매 완료`);
  };

  const buySnack = (itemId: string) => {
    const item = snackItems.find((candidate) => candidate.id === itemId);
    if (!item) return;

    if (appCoins < item.price) {
      setToastMessage("코인이 부족해요");
      return;
    }

    if (!confirmAction(`${item.name}을 ${item.price.toLocaleString("ko-KR")}코인으로 구매할까요?`)) return;

    setAppState((prev) => ({
      ...prev,
      coins: spendCoins(prev.coins, item.price),
      snackInventory: {
        ...prev.snackInventory,
        [item.id]: (prev.snackInventory[item.id] ?? 0) + 1,
      },
    }));
    setToastMessage(`${item.name} 1개 구매 완료`);
  };

  const giveSnack = (itemId: string) => {
    const item = snackItems.find((candidate) => candidate.id === itemId);
    const result = feedPet({
      inventory: appState.snackInventory,
      intimacy: appState.intimacy,
      lastFedAt: appState.lastFedAt,
      snack: item,
    });

    if (result.status !== "fed") {
      setToastMessage(result.message);
      return false;
    }

    setAppState((prev) => ({
      ...prev,
      intimacy: result.nextIntimacy,
      lastFedAt: result.nextLastFedAt,
      snackInventory: result.nextInventory,
    }));
    setToastMessage(`${item?.name ?? "간식"}을 줬어요 · 친밀도 ${result.nextIntimacy}%`);
    return true;
  };

  const openPremiumBox = () => {
    const result = resolvePremiumBox(shopItemViews.filter((item) => item.itemType !== "snack"), appCoins);
    if (result.outcome !== "item" || !result.itemId) {
      setToastMessage(result.label);
      return;
    }
    const itemId = result.itemId;

    setAppState((prev) => ({
      ...prev,
      coins: spendCoins(prev.coins, result.coinsSpent),
      equippedItemId: itemId,
      ownedItemIds: prev.ownedItemIds.includes(itemId) ? prev.ownedItemIds : [...prev.ownedItemIds, itemId],
    }));
    setToastMessage(result.label);
  };

  const buyOrSelectCharacter = (petId: string) => {
    const preset = petPresets.find((candidate) => candidate.id === petId);
    if (!preset) {
      const customPet = appState.ownedCustomPets.find((candidate) => candidate.id === petId);
      if (!customPet) return;

      setAppState((prev) => ({ ...prev, pet: customPet }));
      setToastMessage(`${customPet.name}로 변경했어요`);
      return;
    }

    const owned = ownedPetIds.includes(petId);
    if (owned) {
      setAppState((prev) => ({
        ...prev,
        ownedPetIds: prev.ownedPetIds.includes(petId) ? prev.ownedPetIds : [...prev.ownedPetIds, petId],
        pet: createPetFromPreset(preset),
      }));
      setToastMessage(`${preset.name}로 변경했어요`);
      return;
    }

    if (appCoins < BASE_CHARACTER_PRICE) {
      setToastMessage("코인이 부족해요");
      return;
    }

    if (!confirmAction(`${preset.name}을 ${BASE_CHARACTER_PRICE.toLocaleString("ko-KR")}코인으로 구매하고 바로 사용할까요?`)) {
      return;
    }

    setAppState((prev) => ({
      ...prev,
      coins: spendCoins(prev.coins, BASE_CHARACTER_PRICE),
      ownedPetIds: prev.ownedPetIds.includes(petId) ? prev.ownedPetIds : [...prev.ownedPetIds, petId],
      pet: createPetFromPreset(preset),
    }));
    setToastMessage(`${preset.name} 구매 완료`);
  };

  const openAiCharacterCreation = () => {
    if (!confirmAction(`AI 캐릭터 생성은 1회 ${AI_CHARACTER_GENERATION_PRICE_KRW.toLocaleString("ko-KR")}원 결제 상품으로 제공될 예정이에요. 결제 화면으로 이동할까요?`)) {
      return;
    }

    setToastMessage(getAiCharacterDisabledMessage());
  };

  const updateBudget = (budget: number) => {
    setAppState((prev) => ({ ...prev, monthlyBudget: budget }));
    setToastMessage("예산을 저장했어요");
  };

  const updatePetName = (name: string) => {
    const trimmed = name.trim().slice(0, 12);
    if (!trimmed) return;

    setAppState((prev) => ({ ...prev, pet: { ...prev.pet, name: trimmed } }));
    setToastMessage("이름을 저장했어요");
  };

  const updateCategoryBudget = (categoryId: string, budget: number) => {
    setAppState((prev) => ({
      ...prev,
      categoryBudgets: { ...prev.categoryBudgets, [categoryId]: budget },
    }));
  };

  const shareOutfit = () => {
    if (!confirmAction("현재 캐릭터 모습을 코디 자랑에 올릴까요?")) return;

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
          setAppState((prev) => ({
            ...prev,
            hasCompletedOnboarding: true,
            ownedCustomPets:
              nextPet.source === "photo" && !prev.ownedCustomPets.some((customPet) => customPet.id === nextPet.id)
                ? [...prev.ownedCustomPets, nextPet]
                : prev.ownedCustomPets,
            ownedPetIds:
              nextPet.source === "preset" && !prev.ownedPetIds.includes(nextPet.id)
                ? [...prev.ownedPetIds, nextPet.id]
                : prev.ownedPetIds,
            pet: nextPet,
          }));
          setPage("home");
        }}
      />
    );
  }

  return (
    <AppShell
      activePage={activePage}
      coin={appCoins}
      onNavigate={setPage}
      showCoin={activePage === "shop"}
      toastMessage={toastMessage}
    >
      {activePage === "home" && (
        <HomePage
          categories={appState.categories}
          entries={appState.entries}
          equippedItem={equippedItem}
          intimacy={effectiveIntimacy}
          monthlyBudget={appState.monthlyBudget}
          pet={appState.pet}
          rewardEvents={appState.rewardEvents}
          snackInventory={appState.snackInventory}
          snackItems={snackItems}
          stats={appStats}
          wardrobeItems={shopItemViews.filter(
            (item) => item.itemType !== "snack" && (item.state === "owned" || item.state === "equipped"),
          )}
          onEquipItem={buyOrEquipItem}
          onFeedSnack={giveSnack}
          onOpenShop={() => setPage("shop")}
          onShareOutfit={shareOutfit}
          onUpdatePetName={updatePetName}
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
          onUpdateBudget={updateBudget}
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
          coins={appCoins}
          characters={characterShopItems}
          items={shopItemViews}
          level={appStats.level}
          onAiCharacterCreate={openAiCharacterCreation}
          onCharacterAction={buyOrSelectCharacter}
          onItemAction={buyOrEquipItem}
          onOpenPremiumBox={openPremiumBox}
          onPostComment={addComment}
          onPostLike={likePost}
          onShareOutfit={shareOutfit}
          onSnackAction={buySnack}
          posts={appState.communityPosts}
          snackInventory={appState.snackInventory}
        />
      )}
      {activePage === "settings" && (
        <SettingsPage
          coins={appCoins}
          entries={appState.entries}
          monthlyBudget={appState.monthlyBudget}
          ownedCustomPets={appState.ownedCustomPets}
          pet={appState.pet}
          ownedPetIds={ownedPetIds}
          stats={appStats}
          onSelectPet={buyOrSelectCharacter}
          onResetData={resetLocalData}
          onUpdateBudget={updateBudget}
        />
      )}
    </AppShell>
  );
}

function spendCoins(currentCoins: number, amount: number): number {
  if (import.meta.env.DEV) return currentCoins;
  return Math.max(0, currentCoins - amount);
}

function confirmAction(message: string): boolean {
  if (typeof window === "undefined") return true;
  return window.confirm(message);
}

export default App;
