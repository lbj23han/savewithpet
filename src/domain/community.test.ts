import { describe, expect, it } from "vitest";

import type { CommunityPost } from "../types/app";
import { addCommunityComment, likeCommunityPost } from "./community";

const posts: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "나",
    caption: "테스트",
    comments: [],
    createdAt: "2026-05-05T00:00:00.000Z",
    equippedItemId: null,
    likes: 0,
    petEmoji: "🐱",
    petImageUrl: "/assets/pets/ttoosseunyang.svg",
    petName: "또쓰냥",
  },
];

describe("community domain", () => {
  it("increments likes", () => {
    expect(likeCommunityPost(posts, "post-1")[0].likes).toBe(1);
  });

  it("adds a trimmed comment", () => {
    const next = addCommunityComment({ message: " 좋아요 ", postId: "post-1", posts });

    expect(next[0].comments[0].message).toBe("좋아요");
  });
});
