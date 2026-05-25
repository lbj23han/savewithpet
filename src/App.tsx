import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { AppShell } from "./components/AppShell";
import { addCommunityComment, createOutfitPost, likeCommunityPost } from "./domain/community";
import { createPetFromPhoto, createPetFromPreset } from "./domain/avatarGenerator";
import { AI_CHARACTER_MAX_OWNED_COUNT, getAiCharacterLimitMessage, getAiCharacterNoEditMessage } from "./domain/aiCharacterPolicy";
import { calculateAppStats, createLedgerEntry } from "./domain/ledger";
import { calculateEffectiveIntimacy, createNextFreeSnackClaims, feedPet, getFreeSnackClaimState } from "./domain/petCare";
import {
  ATTENDANCE_REWARD_COINS,
  createAttendanceReward,
  createEntryReward,
  hasClaimedAttendanceReward,
} from "./domain/rewards";
import { createShopItemViewModels, openPremiumBox as resolvePremiumBox } from "./domain/shop";
import { saveAppStateToCloud } from "./lib/cloudPersistence";
import { defaultAppState, loadAppState, saveAppState } from "./lib/persistence";
import { generateAiCharacter } from "./lib/aiCharacterGeneration";
import {
  AI_CHARACTER_PAYMENT_OPTIONS,
  type AiCharacterPaymentProduct,
  requestAiCharacterPayment,
  restorePendingAiCharacterPayments,
} from "./lib/tossPayments";
import {
  type TossLoginInfo,
  getTossLoginReady,
  loadTossLoginInfo,
  requestTossLogin,
} from "./lib/tossLogin";
import { petPresets, shopItems } from "./mocks/appData";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HomePage } from "./pages/HomePage";
import { LedgerPage } from "./pages/LedgerPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopPage } from "./pages/ShopPage";
import type { AppPage, Category, LedgerEntryDraft, PersistedAppState } from "./types/app";

const DEV_UNLOCKED_COINS = 999_999;
const DEV_UNLOCKED_LEVEL = 99;
const DEV_AI_CHARACTER_CREDITS = 5;
const BASE_CHARACTER_PRICE = 200;

type ConfirmDialog = {
  confirmLabel?: string;
  danger?: boolean;
  message: string;
  onConfirm: () => void;
  title: string;
};

function App() {
  const [appState, setAppState] = useState<PersistedAppState>(() => loadAppState());
  const [page, setPage] = useState<AppPage>(() => {
    if (getTossLoginReady()) return "login";
    return loadAppState().hasCompletedOnboarding ? "home" : "onboarding";
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAiCharacterGenerating, setIsAiCharacterGenerating] = useState(false);
  const [tossLoginInfo, setTossLoginInfo] = useState<TossLoginInfo | null>(null);
  const [shouldShowOnboardingAfterLogin, setShouldShowOnboardingAfterLogin] = useState(false);
  const [isTossLoginRequesting, setIsTossLoginRequesting] = useState(false);
  const [tossLoginStatusMessage, setTossLoginStatusMessage] = useState<string | null>(null);
  const [selectedAiPaymentProduct, setSelectedAiPaymentProduct] = useState<AiCharacterPaymentProduct | null>(null);
  const [snackPurchaseItemId, setSnackPurchaseItemId] = useState<string | null>(null);
  const [snackPurchaseQuantity, setSnackPurchaseQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const activePage = page === "login" || page === "onboarding" ? "home" : page;
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
  const selectedAiPaymentOption = AI_CHARACTER_PAYMENT_OPTIONS.find((option) => option.id === selectedAiPaymentProduct);
  const snackPurchaseItem = snackItems.find((item) => item.id === snackPurchaseItemId);
  const freeSnackClaimState = getFreeSnackClaimState(appState.freeSnackClaimedAt);
  const snackMaxQuantity = snackPurchaseItem
    ? import.meta.env.DEV
      ? 20
      : Math.max(1, Math.min(20, Math.floor(appCoins / snackPurchaseItem.price)))
    : 1;
  const snackPurchaseTotal = snackPurchaseItem ? snackPurchaseItem.price * snackPurchaseQuantity : 0;
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
  const hasClaimedAttendance = hasClaimedAttendanceReward(appState.rewardEvents);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    if (!import.meta.env.DEV || appState.aiCharacterCredits >= DEV_AI_CHARACTER_CREDITS) return;

    setAppState((prev) =>
      prev.aiCharacterCredits >= DEV_AI_CHARACTER_CREDITS
        ? prev
        : { ...prev, aiCharacterCredits: DEV_AI_CHARACTER_CREDITS },
    );
  }, [appState.aiCharacterCredits]);

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
    void restorePendingAiCharacterPayments()
      .then((results) => {
        const creditCount = results.reduce((sum, result) => sum + result.creditCount, 0);
        if (creditCount <= 0) return;

        setAppState((prev) => ({
          ...prev,
          aiCharacterCredits: prev.aiCharacterCredits + creditCount,
        }));
        setToastMessage(`미지급 생성권 ${creditCount}회를 복구했어요`);
      })
      .catch((error) => {
        console.info("Pending IAP restore skipped", error);
      });
  }, []);

  useEffect(() => {
    if (!getTossLoginReady()) return;
    if (page === "login") return;

    void loadTossLoginInfo()
      .then((info) => {
        if (info) setTossLoginInfo(info);
      })
      .catch((error) => {
        console.info("Toss login info load skipped", error);
      });
  }, [page]);

  useEffect(() => {
    if (page !== "login" || !tossLoginInfo) return;
    if (shouldShowOnboardingAfterLogin) {
      setPage("onboarding");
      return;
    }

    setPage(appState.hasCompletedOnboarding ? "home" : "onboarding");
  }, [page, tossLoginInfo, appState.hasCompletedOnboarding, shouldShowOnboardingAfterLogin]);

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

  const openConfirm = (dialog: ConfirmDialog) => {
    setConfirmDialog(dialog);
  };

  const addLedgerEntry = (draft: LedgerEntryDraft) => {
    const nextEntry = createLedgerEntry(draft);
    const reward = createEntryReward(draft, appStats.streakDays);
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      entries: [nextEntry, ...prev.entries],
      rewardEvents: [reward, ...prev.rewardEvents].slice(0, 20),
      petLevels: {
        ...prev.petLevels,
        [prev.pet.id]: Math.min(99, (prev.petLevels[prev.pet.id] ?? 1) + 1),
      },
    }));
    setToastMessage(`${reward.label} +${reward.coins}코인`);
    setPage("home");
  };

  const claimAttendanceReward = () => {
    if (hasClaimedAttendanceReward(appState.rewardEvents)) {
      setToastMessage("오늘 출석 보상은 이미 받았어요");
      return;
    }

    const reward = createAttendanceReward();
    setAppState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      rewardEvents: [reward, ...prev.rewardEvents].slice(0, 20),
    }));
    setToastMessage(`${reward.label} +${reward.coins}코인`);
  };

  const updateLedgerEntry = (entryId: string, draft: LedgerEntryDraft) => {
    setAppState((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.id === entryId ? { id: entryId, ...draft } : entry)),
    }));
    setToastMessage("기록을 수정했어요");
  };

  const deleteLedgerEntry = (entryId: string) => {
    openConfirm({
      title: "기록 삭제",
      message: "이 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없어요.",
      confirmLabel: "삭제",
      danger: true,
      onConfirm: () => {
        setAppState((prev) => ({
          ...prev,
          entries: prev.entries.filter((entry) => entry.id !== entryId),
        }));
        setToastMessage("기록을 삭제했어요");
      },
    });
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
    openConfirm({
      title: "카테고리 삭제",
      message: "이 카테고리를 삭제할까요? 연결된 기록은 기타 카테고리로 이동해요.",
      confirmLabel: "삭제",
      danger: true,
      onConfirm: () => {
        setAppState((prev) => ({
          ...prev,
          categoryBudgets: Object.fromEntries(Object.entries(prev.categoryBudgets).filter(([id]) => id !== categoryId)),
          categories: prev.categories.filter((category) => category.id !== categoryId),
          entries: prev.entries.map((entry) => (entry.categoryId === categoryId ? { ...entry, categoryId: "etc" } : entry)),
        }));
        setToastMessage("카테고리를 삭제했어요");
      },
    });
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
    openConfirm({
      title: "아이템 구매",
      message: `${item.name}을 ${item.price.toLocaleString("ko-KR")}코인으로 구매하고 적용할까요?`,
      confirmLabel: "구매하고 적용",
      onConfirm: () => {
        setAppState((prev) => ({
          ...prev,
          coins: spendCoins(prev.coins, item.price),
          equippedItemId: item.id,
          ownedItemIds: [...prev.ownedItemIds, item.id],
        }));
        setToastMessage(`${item.name} 구매 완료`);
      },
    });
  };

  const openSnackPurchase = (itemId: string) => {
    const item = snackItems.find((candidate) => candidate.id === itemId);
    if (!item) return;

    if (appCoins < item.price) {
      setToastMessage("코인이 부족해요");
      return;
    }

    setSnackPurchaseItemId(item.id);
    setSnackPurchaseQuantity(1);
  };

  const buySnack = () => {
    if (!snackPurchaseItem) return;
    if (appCoins < snackPurchaseTotal) {
      setToastMessage("코인이 부족해요");
      return;
    }

    const item = snackPurchaseItem;
    const quantity = snackPurchaseQuantity;
    setAppState((prev) => ({
      ...prev,
      coins: spendCoins(prev.coins, snackPurchaseTotal),
      snackInventory: {
        ...prev.snackInventory,
        [item.id]: (prev.snackInventory[item.id] ?? 0) + quantity,
      },
    }));
    setSnackPurchaseItemId(null);
    setToastMessage(`${item.name} ${quantity}개 구매 완료`);
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

  const claimFreeSnack = () => {
    const claimState = getFreeSnackClaimState(appState.freeSnackClaimedAt);
    if (!claimState.canClaim) {
      setToastMessage(claimState.nextClaimLabel);
      return;
    }

    const item = snackItems[claimState.claimedToday % snackItems.length];
    if (!item) {
      setToastMessage("받을 수 있는 간식이 아직 없어요");
      return;
    }

    setAppState((prev) => ({
      ...prev,
      freeSnackClaimedAt: createNextFreeSnackClaims(prev.freeSnackClaimedAt),
      snackInventory: {
        ...prev.snackInventory,
        [item.id]: (prev.snackInventory[item.id] ?? 0) + 1,
      },
    }));
    setToastMessage(`무료 간식 ${item.name} 1개를 받았어요`);
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

    openConfirm({
      title: "캐릭터 구매",
      message: `${preset.name}을 ${BASE_CHARACTER_PRICE.toLocaleString("ko-KR")}코인으로 구매하고 바로 사용할까요?`,
      confirmLabel: "구매하고 사용",
      onConfirm: () => {
        setAppState((prev) => ({
          ...prev,
          coins: spendCoins(prev.coins, BASE_CHARACTER_PRICE),
          ownedPetIds: prev.ownedPetIds.includes(petId) ? prev.ownedPetIds : [...prev.ownedPetIds, petId],
          pet: createPetFromPreset(preset),
        }));
        setToastMessage(`${preset.name} 구매 완료`);
      },
    });
  };

  const openAiCharacterPayment = () => {
    setSelectedAiPaymentProduct("ai_character");
  };

  const useAiCharacterCredit = (file: File) => {
    if (appState.aiCharacterCredits <= 0) {
      setToastMessage("AI 생성권을 먼저 구매해주세요");
      setSelectedAiPaymentProduct("ai_character");
      return;
    }

    if (appState.ownedCustomPets.length >= AI_CHARACTER_MAX_OWNED_COUNT) {
      setToastMessage(getAiCharacterLimitMessage());
      setPage("settings");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setToastMessage("이미지 파일만 선택할 수 있어요");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage("사진은 5MB 이하로 올려주세요");
      return;
    }

    openConfirm({
      title: "AI 캐릭터 생성",
      message: `생성권 1회를 사용해 이 사진으로 캐릭터를 만들까요? ${getAiCharacterNoEditMessage()} 마음에 들지 않으면 삭제 후 다시 생성해야 해요.`,
      confirmLabel: "생성권 사용",
      onConfirm: () => {
        setIsAiCharacterGenerating(true);
        setToastMessage("AI 캐릭터를 만들고 있어요 (약 30초)");
        void readFileAsDataUrl(file)
          .then(async (sourcePhotoUrl) => {
            const generated = await generateAiCharacter({
              fileName: file.name,
              imageDataUrl: sourcePhotoUrl,
              mimeType: file.type,
            });
            const nextPet = createPetFromPhoto(file, sourcePhotoUrl, generated);
            setAppState((prev) => ({
              ...prev,
              aiCharacterCredits: Math.max(0, prev.aiCharacterCredits - 1),
              ownedCustomPets: [...prev.ownedCustomPets, nextPet],
              pet: nextPet,
              petLevels: {
                ...prev.petLevels,
                [nextPet.id]: 1,
              },
            }));
            setPage("settings");
            setToastMessage("AI 캐릭터를 컬렉션에 추가했어요");
          })
          .catch((error) => {
            console.error("AI character generation failed", error);
            setToastMessage(getAiCharacterGenerationErrorMessage(error));
          })
          .finally(() => setIsAiCharacterGenerating(false));
      },
    });
  };

  const startAiCharacterPayment = () => {
    if (!selectedAiPaymentProduct || isPaymentProcessing) return;

    setIsPaymentProcessing(true);
    void requestAiCharacterPayment(selectedAiPaymentProduct)
      .then((result) => {
        if (result.creditCount > 0) {
          setAppState((prev) => ({
            ...prev,
            aiCharacterCredits: prev.aiCharacterCredits + result.creditCount,
          }));
          setToastMessage(`결제가 완료됐어요 · AI 생성권 ${result.creditCount}회 충전`);
        } else {
          setToastMessage("이미 지급된 생성권이에요");
        }
        setSelectedAiPaymentProduct(null);
      })
      .catch((error) => {
        console.error("Payment request failed", error);
        setToastMessage(getPaymentErrorMessage(error));
      })
      .finally(() => setIsPaymentProcessing(false));
  };

  const updateBudget = (budget: number) => {
    setAppState((prev) => ({ ...prev, monthlyBudget: budget }));
    setToastMessage("예산을 저장했어요");
  };

  const updatePetName = (name: string) => {
    const trimmed = name.trim().slice(0, 12);
    if (!trimmed) return;

    setAppState((prev) => ({
      ...prev,
      ownedCustomPets: prev.ownedCustomPets.map((customPet) =>
        customPet.id === prev.pet.id ? { ...customPet, name: trimmed } : customPet,
      ),
      pet: { ...prev.pet, name: trimmed },
    }));
    setToastMessage("이름을 저장했어요");
  };

  const updateCustomPetProfile = (petId: string, profile: { name: string; trait: string }) => {
    const name = profile.name.trim().slice(0, 12) || "몽글친구";
    const trait = profile.trait.trim().replace(/\bPNG\b/gi, "").replace(/\s+/g, " ").slice(0, 60) || "사진 속 분위기를 귀엽게 담은 친구예요";

    setAppState((prev) => ({
      ...prev,
      ownedCustomPets: prev.ownedCustomPets.map((customPet) =>
        customPet.id === petId ? { ...customPet, name, trait } : customPet,
      ),
      pet: prev.pet.id === petId ? { ...prev.pet, name, trait } : prev.pet,
    }));
    setToastMessage("캐릭터 정보를 저장했어요");
  };

  const updateCategoryBudget = (categoryId: string, budget: number) => {
    setAppState((prev) => ({
      ...prev,
      categoryBudgets: { ...prev.categoryBudgets, [categoryId]: budget },
    }));
  };

  const shareOutfit = () => {
    openConfirm({
      title: "우리 애 좀 보세요",
      message: "현재 캐릭터 모습을 게시판에 올릴까요?",
      confirmLabel: "올리기",
      onConfirm: () => {
        const post = createOutfitPost({ equippedItem, pet: appState.pet });
        setAppState((prev) => ({
          ...prev,
          communityPosts: [post, ...prev.communityPosts].slice(0, 30),
        }));
        setToastMessage("우리 애 좀 보세요 게시판에 올렸어요");
      },
    });
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
    setTossLoginInfo(null);
    setPage("onboarding");
  };

  const handleTossLogin = () => {
    if (isTossLoginRequesting) return;
    if (!getTossLoginReady()) {
      const message = "Toss Login은 인증 설정 완료 후 사용할 수 있어요";
      setTossLoginStatusMessage(message);
      setToastMessage(message);
      return;
    }

    setIsTossLoginRequesting(true);
    setTossLoginStatusMessage(null);
    void requestTossLogin()
      .then((result) => {
        if (result.status === "linked") {
          const shouldForceOnboarding = page === "login";
          if (shouldForceOnboarding) {
            setShouldShowOnboardingAfterLogin(true);
            setAppState((prev) => ({
              ...prev,
              hasCompletedOnboarding: false,
              ownedCustomPets: [],
              ownedPetIds: [],
              pet: defaultAppState.pet,
              petLevels: {},
            }));
            setPage("onboarding");
          }
          setTossLoginInfo(result.info);
          setTossLoginStatusMessage(null);
          const success = result.info.displayName
            ? `${result.info.displayName}님으로 Toss 연동을 완료했어요`
            : "Toss 계정을 연동했어요";
          setToastMessage(success);
          return;
        }

        const failureMessage =
          result.status === "cancelled"
            ? "Toss Login을 취소했어요. 다시 시도해주세요."
            : result.status === "unsupported_environment"
              ? "Toss Login은 토스앱 또는 샌드박스앱에서만 사용할 수 있어요"
              : result.status === "already_linked_to_other_account"
                ? "이 Toss 계정은 다른 사용자와 연동되어 있어요"
                : result.message;

        setTossLoginStatusMessage(failureMessage);
        setToastMessage(failureMessage);
      })
      .finally(() => setIsTossLoginRequesting(false));
  };

  const deleteCustomPet = (petId: string) => {
    const customPet = appState.ownedCustomPets.find((candidate) => candidate.id === petId);
    if (!customPet) return;

    openConfirm({
      title: "캐릭터 삭제",
      message: `${customPet.name} 캐릭터를 삭제할까요? 삭제한 캐릭터는 되돌릴 수 없어요.`,
      confirmLabel: "삭제",
      danger: true,
      onConfirm: () => {
        setAppState((prev) => {
          const nextCustomPets = prev.ownedCustomPets.filter((candidate) => candidate.id !== petId);
          const shouldSwitchActivePet = prev.pet.id === petId;
          const fallbackPreset = petPresets.find((preset) => prev.ownedPetIds.includes(preset.id)) ?? petPresets[0];
          const nextPetLevels = { ...prev.petLevels };
          delete nextPetLevels[petId];

          return {
            ...prev,
            ownedCustomPets: nextCustomPets,
            pet: shouldSwitchActivePet && fallbackPreset ? createPetFromPreset(fallbackPreset) : prev.pet,
            petLevels: nextPetLevels,
          };
        });
        setToastMessage(`${customPet.name}을 삭제했어요`);
      },
    });
  };

  if (page === "login") {
    return (
      <LoginPage
        isRequesting={isTossLoginRequesting}
        loginReady={getTossLoginReady()}
        statusMessage={tossLoginStatusMessage}
        onTossLogin={handleTossLogin}
      />
    );
  }

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
            ownedPetIds: nextPet.source === "preset" ? [nextPet.id] : prev.ownedPetIds,
            petLevels: nextPet.source === "preset" ? { [nextPet.id]: 1 } : prev.petLevels,
            pet: nextPet,
          }));
          setShouldShowOnboardingAfterLogin(false);
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
          attendanceRewardCoins={ATTENDANCE_REWARD_COINS}
          canClaimFreeSnack={freeSnackClaimState.canClaim}
          freeSnackClaimLabel={freeSnackClaimState.nextClaimLabel}
          hasClaimedAttendance={hasClaimedAttendance}
          onClaimAttendance={claimAttendanceReward}
          onClaimFreeSnack={claimFreeSnack}
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
          aiCharacterCredits={appState.aiCharacterCredits}
          coins={appCoins}
          characters={characterShopItems}
          isAiCharacterGenerating={isAiCharacterGenerating}
          items={shopItemViews}
          level={appStats.level}
          onAiCharacterBuy={openAiCharacterPayment}
          onAiCharacterGenerate={isAiCharacterGenerating ? () => undefined : useAiCharacterCredit}
          onCharacterAction={buyOrSelectCharacter}
          onItemAction={buyOrEquipItem}
          onOpenPremiumBox={openPremiumBox}
          onPostComment={addComment}
          onPostLike={likePost}
          onShareOutfit={shareOutfit}
          onSnackAction={openSnackPurchase}
          posts={appState.communityPosts}
          snackInventory={appState.snackInventory}
        />
      )}
      {activePage === "settings" && (
        <SettingsPage
          coins={appCoins}
          entries={appState.entries}
          aiCharacterCredits={appState.aiCharacterCredits}
          isAiCharacterGenerating={isAiCharacterGenerating}
          isTossLoginRequesting={isTossLoginRequesting}
          monthlyBudget={appState.monthlyBudget}
          ownedCustomPets={appState.ownedCustomPets}
          pet={appState.pet}
          ownedPetIds={ownedPetIds}
          petLevels={appState.petLevels}
          stats={appStats}
          tossLoginInfo={tossLoginInfo}
          tossLoginReady={getTossLoginReady()}
          onDeleteCustomPet={deleteCustomPet}
          onSelectPet={buyOrSelectCharacter}
          onResetData={resetLocalData}
          onTossLogin={handleTossLogin}
          onUpdateCustomPetProfile={updateCustomPetProfile}
          onUpdateBudget={updateBudget}
        />
      )}
      {snackPurchaseItem && (
        <DialogOverlay>
          <DialogCard>
            <DialogCloseButton aria-label="간식 구매 닫기" onClick={() => setSnackPurchaseItemId(null)}>
              <X size={18} />
            </DialogCloseButton>
            <DialogTitle>{snackPurchaseItem.name}</DialogTitle>
            <DialogText>구매할 수량을 선택해주세요.</DialogText>
            <QuantityStepper>
              <StepperButton
                aria-label="수량 줄이기"
                disabled={snackPurchaseQuantity <= 1}
                onClick={() => setSnackPurchaseQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Minus size={16} />
              </StepperButton>
              <QuantityValue>{snackPurchaseQuantity}</QuantityValue>
              <StepperButton
                aria-label="수량 늘리기"
                disabled={snackPurchaseQuantity >= snackMaxQuantity}
                onClick={() => setSnackPurchaseQuantity((prev) => Math.min(snackMaxQuantity, prev + 1))}
              >
                <Plus size={16} />
              </StepperButton>
            </QuantityStepper>
            <PurchaseSummary>
              <span>총 결제</span>
              <strong>{snackPurchaseTotal.toLocaleString("ko-KR")}코인</strong>
            </PurchaseSummary>
            <DialogActions>
              <DialogCancelButton onClick={() => setSnackPurchaseItemId(null)}>취소</DialogCancelButton>
              <DialogConfirmButton onClick={buySnack}>구매</DialogConfirmButton>
            </DialogActions>
          </DialogCard>
        </DialogOverlay>
      )}
      {selectedAiPaymentOption && (
        <DialogOverlay>
          <DialogCard>
            <DialogCloseButton
              aria-label="AI 캐릭터 결제 닫기"
              disabled={isPaymentProcessing}
              onClick={() => setSelectedAiPaymentProduct(null)}
            >
              <X size={18} />
            </DialogCloseButton>
            <DialogTitle>AI 캐릭터 생성권</DialogTitle>
            <DialogText>
              사진 기반 캐릭터 생성권을 결제하면 캐릭터 컬렉션에서 사용할 수 있어요. {getAiCharacterNoEditMessage()}.
            </DialogText>
            <PaymentOptionList>
              {AI_CHARACTER_PAYMENT_OPTIONS.map((option) => (
                <PaymentOptionButton
                  key={option.id}
                  $active={selectedAiPaymentProduct === option.id}
                  disabled={isPaymentProcessing}
                  onClick={() => setSelectedAiPaymentProduct(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  <em>{option.priceKrw.toLocaleString("ko-KR")}원</em>
                </PaymentOptionButton>
              ))}
            </PaymentOptionList>
            <PurchaseSummary>
              <span>결제 금액</span>
              <strong>{selectedAiPaymentOption.priceKrw.toLocaleString("ko-KR")}원</strong>
            </PurchaseSummary>
            <DialogActions>
              <DialogCancelButton disabled={isPaymentProcessing} onClick={() => setSelectedAiPaymentProduct(null)}>
                취소
              </DialogCancelButton>
              <DialogConfirmButton disabled={isPaymentProcessing} onClick={startAiCharacterPayment}>
                {isPaymentProcessing ? "처리중" : "결제하기"}
              </DialogConfirmButton>
            </DialogActions>
          </DialogCard>
        </DialogOverlay>
      )}
      {confirmDialog && (
        <DialogOverlay>
          <DialogCard>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogText>{confirmDialog.message}</DialogText>
            <DialogActions>
              <DialogCancelButton onClick={() => setConfirmDialog(null)}>취소</DialogCancelButton>
              <DialogConfirmButton
                $danger={confirmDialog.danger}
                onClick={() => {
                  const onConfirm = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  onConfirm();
                }}
              >
                {confirmDialog.confirmLabel ?? "확인"}
              </DialogConfirmButton>
            </DialogActions>
          </DialogCard>
        </DialogOverlay>
      )}
    </AppShell>
  );
}

function spendCoins(currentCoins: number, amount: number): number {
  if (import.meta.env.DEV) return currentCoins;
  return Math.max(0, currentCoins - amount);
}

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(45, 34, 39, 0.24);
  backdrop-filter: blur(10px);
`;

const DialogCard = styled.section`
  position: relative;
  display: grid;
  width: min(360px, 100%);
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: 0 18px 54px rgba(45, 34, 39, 0.18);
`;

const DialogCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: 50%;
`;

const DialogTitle = styled.h2`
  margin: 0;
  padding-right: 34px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.2px;
`;

const DialogText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.55;
`;

const QuantityStepper = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StepperButton = styled.button`
  display: grid;
  height: 48px;
  place-items: center;
  color: ${({ theme }) => theme.colors.orangeDark};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 50%;

  &:disabled {
    color: ${({ theme }) => theme.colors.muted};
    opacity: 0.45;
  }
`;

const QuantityValue = styled.strong`
  display: grid;
  min-height: 48px;
  place-items: center;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 22px;
  font-weight: 800;
`;

const PurchaseSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.md};

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 600;
  }

  strong {
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 16px;
    font-weight: 800;
  }
`;

const PaymentOptionList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PaymentOptionButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 3px;
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active, theme }) => ($active ? "#FFF1B5" : theme.colors.surfaceWarm)};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.orange : theme.colors.line)};
  border-radius: ${({ theme }) => theme.radius.md};

  strong {
    font-size: 15px;
    font-weight: 800;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 500;
  }

  em {
    justify-self: end;
    color: ${({ theme }) => theme.colors.orangeDark};
    font-size: 14px;
    font-style: normal;
    font-weight: 800;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const DialogActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DialogCancelButton = styled.button`
  min-height: 46px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 700;

  &:disabled {
    opacity: 0.5;
  }
`;

const DialogConfirmButton = styled.button<{ $danger?: boolean }>`
  min-height: 46px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ $danger, theme }) => ($danger ? theme.colors.red : theme.colors.orange)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 15px;
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
`;

function getPaymentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "iap_unsupported_environment") return "인앱결제는 토스앱 또는 샌드박스앱에서만 사용할 수 있어요";
  if (message === "missing_supabase_session") return "결제를 위해 사용자 세션을 준비하지 못했어요";
  if (message === "iap_grant_failed") return "결제 지급 처리에 실패했어요";
  return "결제창을 열지 못했어요";
}

function getAiCharacterGenerationErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("missing_openai_api_key")) return "OpenAI API 키가 필요해요";
  if (message.includes("disabled")) return "AI 캐릭터 생성이 아직 비활성화되어 있어요";
  if (message) return `${message} 생성권은 차감되지 않았어요`;
  return "AI 캐릭터 생성에 실패했어요. 생성권은 차감되지 않았어요. 다시 시도해주세요.";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("invalid_file_result"));
    });
    reader.addEventListener("error", () => reject(reader.error ?? new Error("file_read_failed")));
    reader.readAsDataURL(file);
  });
}

export default App;
