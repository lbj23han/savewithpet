import { describe, expect, it } from "vitest";

import { AD_REWARD_COINS, AD_REWARD_DAILY_LIMIT } from "./adPolicy";
import {
  ATTENDANCE_REWARD_COINS,
  createAttendanceReward,
  createRewardAdReward,
  getRewardAdClaimState,
  hasClaimedAttendanceReward,
} from "./rewards";

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

  it("creates a reward ad coin event", () => {
    const reward = createRewardAdReward(new Date("2026-05-24T10:00:00.000Z"));

    expect(reward.label).toBe("영상 광고 보상");
    expect(reward.coins).toBe(AD_REWARD_COINS);
    expect(reward.createdAt).toBe("2026-05-24T10:00:00.000Z");
  });

  it("blocks reward ads during the cooldown window", () => {
    const reward = createRewardAdReward(new Date("2026-05-24T10:00:00.000Z"));
    const state = getRewardAdClaimState([reward], new Date("2026-05-24T10:10:00.000Z"));

    expect(state.canClaim).toBe(false);
    expect(state.remainingToday).toBe(AD_REWARD_DAILY_LIMIT - 1);
    expect(state.message).toContain("20분");
  });

  it("allows reward ads after cooldown if daily limit remains", () => {
    const reward = createRewardAdReward(new Date("2026-05-24T10:00:00.000Z"));
    const state = getRewardAdClaimState([reward], new Date("2026-05-24T10:31:00.000Z"));

    expect(state.canClaim).toBe(true);
    expect(state.remainingToday).toBe(AD_REWARD_DAILY_LIMIT - 1);
  });

  it("blocks reward ads after the daily limit", () => {
    const rewards = Array.from({ length: AD_REWARD_DAILY_LIMIT }, (_, index) =>
      createRewardAdReward(new Date(`2026-05-24T0${index}:00:00.000Z`)),
    );
    const state = getRewardAdClaimState(rewards, new Date("2026-05-24T08:00:00.000Z"));

    expect(state.canClaim).toBe(false);
    expect(state.remainingToday).toBe(0);
    expect(state.message).toBe("오늘 영상 보상은 모두 받았어요");
  });

  it("resets the reward ad daily limit on the next local day", () => {
    const rewards = Array.from({ length: AD_REWARD_DAILY_LIMIT }, (_, index) =>
      createRewardAdReward(new Date(`2026-05-24T0${index}:00:00.000Z`)),
    );
    const state = getRewardAdClaimState(rewards, new Date("2026-05-25T09:00:00.000Z"));

    expect(state.canClaim).toBe(true);
    expect(state.remainingToday).toBe(AD_REWARD_DAILY_LIMIT);
  });
});
