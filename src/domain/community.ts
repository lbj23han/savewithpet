import type { CommunityPost, ShopItemViewModel, UserPet } from "../types/app";

export function createOutfitPost({
  equippedItem,
  pet,
}: {
  equippedItem?: ShopItemViewModel;
  pet: UserPet;
}): CommunityPost {
  return {
    id: `community-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    authorName: "나",
    caption: equippedItem ? `${pet.name}에게 ${equippedItem.name}을 입혀봤어요.` : `${pet.name}의 오늘 모습을 자랑해요.`,
    comments: [],
    createdAt: new Date().toISOString(),
    equippedItemId: equippedItem?.id ?? null,
    likes: 0,
    petEmoji: pet.emoji,
    petImageUrl: pet.imageUrl,
    petName: pet.name,
  };
}

export function likeCommunityPost(posts: CommunityPost[], postId: string): CommunityPost[] {
  return posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post));
}

export function addCommunityComment({
  message,
  postId,
  posts,
}: {
  message: string;
  postId: string;
  posts: CommunityPost[];
}): CommunityPost[] {
  const trimmed = message.trim().slice(0, 80);
  if (!trimmed) return posts;

  return posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          comments: [
            {
              id: `comment-${Date.now()}-${Math.round(Math.random() * 1000)}`,
              authorName: "나",
              createdAt: new Date().toISOString(),
              message: trimmed,
            },
            ...post.comments,
          ].slice(0, 20),
        }
      : post,
  );
}
