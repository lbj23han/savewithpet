import { Heart, LockKeyhole, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import { SHOP_COPY } from "../constants/copy";
import { PetItemArt } from "../components/PetItemArt";
import { AI_CHARACTER_GENERATION_PRICE_KRW } from "../domain/aiCharacterPolicy";
import { PREMIUM_BOX_PRICE } from "../domain/shop";
import type { CommunityPost, PetPreset, ShopItemState, ShopItemViewModel } from "../types/app";

type ShopTab = "wardrobe" | "snacks" | "characters";

type CharacterShopItem = PetPreset & {
  active: boolean;
  canBuy: boolean;
  owned: boolean;
  price: number;
};

type ShopPageProps = {
  characters: CharacterShopItem[];
  coins: number;
  items: ShopItemViewModel[];
  level: number;
  onAiCharacterCreate: () => void;
  onCharacterAction: (petId: string) => void;
  onItemAction: (itemId: string) => void;
  onOpenPremiumBox: () => void;
  onPostComment: (postId: string, message: string) => void;
  onPostLike: (postId: string) => void;
  onShareOutfit: () => void;
  posts: CommunityPost[];
};

export function ShopPage({
  characters,
  coins,
  items,
  level,
  onAiCharacterCreate,
  onCharacterAction,
  onItemAction,
  onOpenPremiumBox,
  onPostComment,
  onPostLike,
  onShareOutfit,
  posts,
}: ShopPageProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>("wardrobe");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const tabs: Array<{ id: ShopTab; label: string }> = [
    { id: "wardrobe", label: SHOP_COPY.tabs[0] },
    { id: "snacks", label: SHOP_COPY.tabs[1] },
    { id: "characters", label: SHOP_COPY.tabs[2] },
  ];

  return (
    <Page>
      <Hero>
        <h1>{SHOP_COPY.title}</h1>
        <p>Lv.{level} · 보유 코인 {coins.toLocaleString("ko-KR")}개</p>
      </Hero>

      <Tabs>
        {tabs.map((tab) => (
          <Tab key={tab.id} $active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      {activeTab === "wardrobe" && (
        <ItemGrid>
          {items.map((item) => (
            <ItemCard key={item.id} $locked={item.state === "locked"} onClick={() => onItemAction(item.id)}>
              <IconCircle>
                <PetItemArt itemId={item.id} title={item.name} />
              </IconCircle>
              {item.state === "locked" && <LockKeyhole size={24} />}
              <h2>{item.name}</h2>
              <StateBadge $state={item.state}>{getStateLabel(item)}</StateBadge>
              <Price $disabled={item.state === "locked"}>🪙 {item.price.toLocaleString()}</Price>
            </ItemCard>
          ))}
        </ItemGrid>
      )}

      {activeTab === "snacks" && (
        <EmptyPanel>
          <h2>간식 상점 준비중</h2>
          <p>포만도 회복, 기분 상승처럼 캐릭터와 직접 겹치지 않는 소비형 아이템으로 넣을 예정이에요.</p>
        </EmptyPanel>
      )}

      {activeTab === "characters" && (
        <CharacterGrid>
          <AiCharacterCard onClick={onAiCharacterCreate}>
            <AiBadge>{AI_CHARACTER_GENERATION_PRICE_KRW.toLocaleString("ko-KR")}원</AiBadge>
            <h2>AI 캐릭터 생성</h2>
            <p>사진 기반 프리미엄 캐릭터를 생성하고 컬렉션에 추가해요.</p>
            <strong>결제 연동 예정</strong>
          </AiCharacterCard>
          {characters.map((character) => (
            <CharacterCard key={character.id} onClick={() => onCharacterAction(character.id)}>
              <CharacterImageWrap>
                <CharacterImage src={character.imageUrl} alt={character.name} />
              </CharacterImageWrap>
              <h2>{character.name}</h2>
              <p>{character.trait}</p>
              <CharacterAction $active={character.active}>
                {character.active
                  ? "사용중"
                  : character.owned
                    ? "변경하기"
                    : character.canBuy
                      ? `🪙 ${character.price.toLocaleString()}`
                      : "코인 부족"}
              </CharacterAction>
            </CharacterCard>
          ))}
        </CharacterGrid>
      )}

      <PremiumBox>
        <div>
          <h2>{SHOP_COPY.premiumTitle}</h2>
          <p>
            {PREMIUM_BOX_PRICE.toLocaleString("ko-KR")}코인 · {SHOP_COPY.premiumDescription}
          </p>
        </div>
        <button disabled onClick={onOpenPremiumBox}>{SHOP_COPY.premiumButton}</button>
      </PremiumBox>

      <CommunityPanel>
        <CommunityHeader>
          <div>
            <h2>베스트 코디</h2>
            <span>가벼운 자랑/댓글 기능 MVP</span>
          </div>
          <button onClick={onShareOutfit}>자랑하기</button>
        </CommunityHeader>
        <PostList>
          {posts.length === 0 ? (
            <CommunityEmpty>
              아직 자랑글이 없어요. 첫 코디를 저장해보세요.
            </CommunityEmpty>
          ) : (
            posts.slice(0, 3).map((post) => (
              <PostCard key={post.id}>
                <PostPet>
                  <span>
                    {post.petImageUrl ? <PostPetImage src={post.petImageUrl} alt={post.petName} /> : post.petEmoji}
                  </span>
                  <strong>{post.petName}</strong>
                </PostPet>
                <PostBody>
                  <strong>{post.authorName}</strong>
                  <p>{post.caption}</p>
                  <PostActions>
                    <button onClick={() => onPostLike(post.id)}>
                      <Heart size={15} /> {post.likes}
                    </button>
                    <span>
                      <MessageCircle size={15} /> {post.comments.length}
                    </span>
                  </PostActions>
                  <CommentInputRow>
                    <input
                      placeholder="짧게 응원하기"
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                    />
                    <button
                      aria-label="댓글 등록"
                      onClick={() => {
                        onPostComment(post.id, commentDrafts[post.id] ?? "");
                        setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </CommentInputRow>
                </PostBody>
              </PostCard>
            ))
          )}
        </PostList>
      </CommunityPanel>
    </Page>
  );
}

function getStateLabel(item: ShopItemViewModel): string {
  if (item.state === "equipped") return "적용중";
  if (item.state === "owned") return "보유중";
  if (item.state === "locked") return item.unlockLabel ?? "잠김";
  if (!item.canBuy) return "코인 부족";
  return "구매가능";
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  padding: 24px ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.orangeDark};
  background: linear-gradient(135deg, #ffe0ec 0%, #ffcedd 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0;
    color: rgba(176, 48, 96, 0.65);
    font-size: 14px;
    font-weight: 400;
  }
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Tab = styled.button<{ $active: boolean }>`
  min-height: 42px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : "transparent")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const CharacterCard = styled.button`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 230px;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 15px;
    font-weight: 700;
  }

  p {
    min-height: 36px;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    line-height: 1.45;
  }
`;

const CharacterImageWrap = styled.div`
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  background: #fff5f9;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const CharacterImage = styled.img`
  width: 82px;
  height: 82px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const CharacterAction = styled.strong<{ $active: boolean }>`
  padding: 5px 12px;
  color: ${({ $active, theme }) => ($active ? theme.colors.orangeDark : theme.colors.green)};
  background: ${({ $active, theme }) => ($active ? "#FFF1B5" : theme.colors.greenSoft)};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 700;
`;

const AiCharacterCard = styled.button`
  position: relative;
  display: grid;
  align-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 230px;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  background: linear-gradient(135deg, #fff5f9 0%, #edf8ff 100%);
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 17px;
    font-weight: 800;
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    line-height: 1.45;
  }

  strong {
    justify-self: start;
    padding: 5px 12px;
    color: ${({ theme }) => theme.colors.purple};
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: 12px;
  }
`;

const AiBadge = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  padding: 4px 10px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.purple};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 800;
`;

const EmptyPanel = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 16px;
  }

  p {
    font-size: 13px;
    line-height: 1.5;
  }
`;

const ItemCard = styled.button<{ $locked: boolean }>`
  position: relative;
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ $locked, theme }) => ($locked ? theme.colors.surfaceWarm : theme.colors.surface)};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};

  > svg {
    position: absolute;
    top: 68px;
    color: ${({ theme }) => theme.colors.muted};
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }
`;

const IconCircle = styled.div`
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: 50%;

  svg {
    width: 64px;
    height: 64px;
  }
`;

const StateBadge = styled.span<{ $state: ShopItemState }>`
  padding: 4px 12px;
  color: ${({ $state, theme }) =>
    $state === "locked"
      ? theme.colors.muted
      : $state === "owned" || $state === "equipped"
        ? theme.colors.orangeDark
        : theme.colors.green};
  background: ${({ $state, theme }) =>
    $state === "locked" ? theme.colors.surfaceWarm : $state === "owned" || $state === "equipped" ? "#FFF1B5" : theme.colors.greenSoft};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 600;
`;

const Price = styled.strong<{ $disabled: boolean }>`
  color: ${({ $disabled, theme }) => ($disabled ? theme.colors.muted : theme.colors.orangeDark)};
  font-size: 15px;
  font-weight: 600;
`;

const PremiumBox = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.purple};
  background: ${({ theme }) => theme.colors.purpleSoft};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  p {
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: 13px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.muted};
  }

  button {
    flex: 0 0 auto;
    padding: 10px 16px;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.purple};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 14px;
    font-weight: 600;

    &:disabled {
      opacity: 0.45;
    }
  }
`;

const CommunityPanel = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const CommunityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  h2,
  span {
    margin: 0;
  }

  h2 {
    font-size: 18px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    font-weight: 500;
  }

  button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.orangeDark};
    background: ${({ theme }) => theme.colors.surfaceWarm};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-weight: 700;
  }
`;

const PostList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CommunityEmpty = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
`;

const PostCard = styled.article`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceWarm};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const PostPet = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  span {
    display: grid;
    width: 54px;
    height: 54px;
    place-items: center;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: 30px;
  }

  strong {
    font-size: 11px;
  }
`;

const PostPetImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

const PostBody = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;

  > strong {
    font-size: 13px;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 13px;
    line-height: 1.4;
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  button,
  span {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.muted};
    background: transparent;
    font-size: 12px;
    font-weight: 700;
  }
`;

const CommentInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 34px;
  gap: ${({ theme }) => theme.spacing.sm};

  input {
    min-width: 0;
    min-height: 34px;
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.line};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: 13px;
  }

  button {
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.orange};
    border-radius: 50%;
  }
`;
