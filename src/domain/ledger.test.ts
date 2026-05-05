import { describe, expect, it } from "vitest";

import type { LedgerEntry } from "../types/app";
import { calculateAppStats, filterEntriesByPeriod } from "./ledger";

const entries: LedgerEntry[] = [
  { id: "1", amount: 10_000, categoryId: "food", date: new Date().toISOString().slice(0, 10), memo: "today", type: "expense" },
  { id: "2", amount: 5_000, categoryId: "saving", date: new Date().toISOString().slice(0, 10), memo: "save", type: "saving" },
];

describe("ledger domain", () => {
  it("calculates expense, saving, and pet status stats", () => {
    const stats = calculateAppStats(entries, 100_000);

    expect(stats.totalExpense).toBe(10_000);
    expect(stats.totalSaving).toBe(5_000);
    expect(stats.level).toBeGreaterThanOrEqual(1);
    expect(stats.growth).toBeGreaterThan(0);
  });

  it("filters entries by today", () => {
    expect(filterEntriesByPeriod(entries, "today")).toHaveLength(2);
  });
});
