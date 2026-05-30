/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_BANNER_UNIT_ID?: string;
  readonly VITE_AD_REWARD_UNIT_ID?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_AUTH_ENABLED?: string;
  readonly VITE_IAP_AI_CHARACTER_PACK_SKU?: string;
  readonly VITE_IAP_AI_CHARACTER_SKU?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_TOSS_LOGIN_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@apps-in-toss/web-framework" {
  export type IapProductListItem = {
    description?: string;
    displayAmount?: string;
    displayName: string;
    iconUrl?: string;
    sku: string;
  };

  export const IAP: {
    completeProductGrant: (options: { params: { orderId: string } }) => Promise<void>;
    createOneTimePurchaseOrder: (params: {
      onError: (error: unknown) => void;
      onEvent: (event: { data?: { displayName?: string; orderId?: string }; type: string }) => void;
      options: {
        processProductGrant: (params: { orderId: string }) => Promise<boolean>;
        sku: string;
      };
    }) => () => void;
    getCompletedOrRefundedOrders: () => Promise<{ orders?: Array<{ orderId: string; sku?: string; status?: string }> }>;
    getPendingOrders: () => Promise<{ orders?: Array<{ orderId: string; sku?: string }> }>;
    getProductItemList: () => Promise<{ products?: IapProductListItem[] }>;
  };

  type AdMobLoadEvent = { data: { adGroupId: string; adUnitId: string }; type: "loaded" };
  type AdMobShowEvent =
    | { type: "clicked" | "dismissed" | "failedToShow" | "impression" | "requested" | "show" }
    | { data: { unitAmount: number; unitType: string }; type: "userEarnedReward" };

  export const GoogleAdMob: {
    isAppsInTossAdMobLoaded: ((params: { adGroupId: string }) => Promise<boolean>) & { isSupported: () => boolean };
    loadAppsInTossAdMob: ((params: {
      onError: (error: unknown) => void;
      onEvent: (event: AdMobLoadEvent) => void;
      options: { adGroupId: string };
    }) => () => void) & { isSupported: () => boolean };
    showAppsInTossAdMob: ((params: {
      onError: (error: unknown) => void;
      onEvent: (event: AdMobShowEvent) => void;
      options: { adGroupId: string };
    }) => () => void) & { isSupported: () => boolean };
  };

  export const TossAds: {
    attachBanner: (adGroupId: string, target: HTMLElement, options?: {
      callbacks?: {
        onAdFailedToRender?: (event: unknown) => void;
        onAdRendered?: (event: unknown) => void;
        onNoFill?: (event: unknown) => void;
      };
      theme?: "auto" | "dark" | "light";
      tone?: "blackAndWhite" | "grey";
      variant?: "card" | "expanded";
    }) => { destroy: () => void };
    initialize: ((params?: {
      callbacks?: {
        onInitializationFailed?: (error: unknown) => void;
        onInitialized?: () => void;
      };
    }) => void) & { isSupported: () => boolean };
  };

  export const graniteEvent: {
    addEventListener: (eventName: string, options: { onEvent: (event: unknown) => void }) => () => void;
  };

  export function isMinVersionSupported(minVersion: { android: string; ios: string }): boolean;
}
