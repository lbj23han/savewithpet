import type { LucideIcon } from "lucide-react";

export type AppPage = "onboarding" | "home" | "ledger" | "analysis" | "shop" | "settings";

export type NavItem = {
  page: Exclude<AppPage, "onboarding">;
  label: string;
  Icon: LucideIcon;
};

export type PetPreset = {
  id: string;
  name: string;
  trait: string;
  emoji: string;
  featured?: boolean;
};

export type PetStatus = {
  label: string;
  value: number;
  tone: "orange" | "purple" | "green";
};

export type SummaryMetric = {
  label: string;
  value: string;
  tone: "red" | "green" | "purple";
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  selected?: boolean;
};

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number;
  state: "owned" | "available" | "locked";
  unlockLabel?: string;
};
