import { describe, expect, it } from "vitest";

import { ATTENDANCE_REWARD_COINS, createAttendanceReward, hasClaimedAttendanceReward } from "./rewards";

describe("rewards domain", () => {
  it("creates a daily attendance reward worth 20 coins", () => {
    const reward = createAttendanceReward(new Date("2026-05-24T09:00:00.000Z"));

    expect(reward.label).toBe("출석 보상");
    expect(reward.coins).toBe(ATTENDANCE_REWARD_COINS);
    expect(reward.createdAt).toBe("2026-05-24T09:00:00.000Z");
  });

  it("detects whether attendance has already been claimed today", () => {
    const reward = createAttendanceReward(new Date("2026-05-24T09:00:00.000Z"));

    expect(hasClaimedAttendanceReward([reward], new Date("2026-05-24T20:00:00.000Z"))).toBe(true);
    expect(hasClaimedAttendanceReward([reward], new Date("2026-05-25T00:00:00.000Z"))).toBe(false);
  });
});
