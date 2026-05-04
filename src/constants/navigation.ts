import { BarChart3, Home, NotebookPen, Settings, Store } from "lucide-react";

import type { NavItem } from "../types/app";

export const NAV_ITEMS: NavItem[] = [
  { page: "home", label: "홈", Icon: Home },
  { page: "ledger", label: "장부", Icon: NotebookPen },
  { page: "analysis", label: "분석", Icon: BarChart3 },
  { page: "shop", label: "상점", Icon: Store },
  { page: "settings", label: "설정", Icon: Settings },
];
