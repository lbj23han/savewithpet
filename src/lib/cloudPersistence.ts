import { petPresets } from "../mocks/appData";
import { AI_CHARACTER_GENERATION_PRICE_KRW } from "../domain/aiCharacterPolicy";
import type { Category, LedgerEntry, PersistedAppState, RewardEvent, UserPet } from "../types/app";
import { ensureSupabaseUserId, isSupabaseConfigured, supabase } from "./supabase";

type CloudSyncResult =
  | { status: "skipped"; reason: "not_configured" }
  | { status: "ok" }
  | { error: unknown; status: "error" };

export async function saveAppStateToCloud(state: PersistedAppState): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured || !supabase) return { reason: "not_configured", status: "skipped" };

  try {
    const userId = await ensureSupabaseUserId();
    if (!userId) return { reason: "not_configured", status: "skipped" };

    await upsertProfile(userId, state);
    await Promise.all([
      upsertCategories(userId, state.categories),
      upsertCategoryBudgets(userId, state.categoryBudgets),
      upsertLedgerEntries(userId, state.entries),
      upsertRewardEvents(userId, state.rewardEvents),
      upsertOwnedItems(userId, state),
    ]);
    await upsertPets(userId, state);

    return { status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

async function upsertProfile(userId: string, state: PersistedAppState): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      ai_character_credits: state.aiCharacterCredits,
      coins: state.coins,
      has_completed_onboarding: state.hasCompletedOnboarding,
      id: userId,
      intimacy: state.intimacy,
      last_fed_at: state.lastFedAt,
      monthly_budget: state.monthlyBudget,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

async function upsertCategories(userId: string, categories: Category[]): Promise<void> {
  if (!supabase) return;

  await deleteRowsNotInValues({
    column: "category_id",
    table: "ledger_categories",
    userId,
    values: categories.map((category) => category.id),
  });

  if (categories.length === 0) return;

  const { error } = await supabase.from("ledger_categories").upsert(
    categories.map((category) => ({
      category_id: category.id,
      icon: category.icon,
      is_custom: Boolean(category.isCustom),
      is_selected: Boolean(category.selected),
      label: category.label,
      user_id: userId,
    })),
    { onConflict: "user_id,category_id" },
  );

  if (error) throw error;
}

async function upsertCategoryBudgets(userId: string, categoryBudgets: Record<string, number>): Promise<void> {
  if (!supabase) return;

  const rows = Object.entries(categoryBudgets).map(([categoryId, monthlyBudget]) => ({
    category_id: categoryId,
    monthly_budget: monthlyBudget,
    user_id: userId,
  }));
  await deleteRowsNotInValues({
    column: "category_id",
    table: "category_budgets",
    userId,
    values: rows.map((row) => row.category_id),
  });

  if (rows.length === 0) return;

  const { error } = await supabase.from("category_budgets").upsert(rows, { onConflict: "user_id,category_id" });
  if (error) throw error;
}

async function upsertLedgerEntries(userId: string, entries: LedgerEntry[]): Promise<void> {
  if (!supabase) return;

  await deleteRowsNotInValues({
    column: "client_id",
    table: "ledger_entries",
    userId,
    values: entries.map((entry) => entry.id),
  });

  if (entries.length === 0) return;

  const { error } = await supabase.from("ledger_entries").upsert(
    entries.map((entry) => ({
      amount: entry.amount,
      category_id: entry.categoryId,
      client_id: entry.id,
      entry_date: entry.date,
      entry_type: entry.type,
      memo: entry.memo,
      user_id: userId,
    })),
    { onConflict: "user_id,client_id" },
  );

  if (error) throw error;
}

async function upsertRewardEvents(userId: string, rewardEvents: RewardEvent[]): Promise<void> {
  if (!supabase) return;

  await deleteRowsNotInValues({
    column: "client_id",
    table: "reward_events",
    userId,
    values: rewardEvents.map((event) => event.id),
  });

  if (rewardEvents.length === 0) return;

  const { error } = await supabase.from("reward_events").upsert(
    rewardEvents.map((event) => ({
      client_id: event.id,
      coins: event.coins,
      created_at: event.createdAt,
      label: event.label,
      user_id: userId,
    })),
    { onConflict: "user_id,client_id" },
  );

  if (error) throw error;
}

async function upsertOwnedItems(userId: string, state: PersistedAppState): Promise<void> {
  if (!supabase) return;

  const snackRows = Object.entries(state.snackInventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({
      is_equipped: false,
      item_id: itemId,
      quantity,
      user_id: userId,
    }));
  const wardrobeRows = state.ownedItemIds.map((itemId) => ({
    is_equipped: state.equippedItemId === itemId,
    item_id: itemId,
    quantity: 1,
    user_id: userId,
  }));
  const rows = [...wardrobeRows, ...snackRows];

  await deleteRowsNotInValues({
    column: "item_id",
    table: "user_owned_items",
    userId,
    values: rows.map((row) => row.item_id),
  });

  if (rows.length === 0) return;

  const { error } = await supabase.from("user_owned_items").upsert(rows, { onConflict: "user_id,item_id" });

  if (error) throw error;
}

async function upsertPets(userId: string, state: PersistedAppState): Promise<void> {
  if (!supabase) return;

  const pets = getPetsForSync(state);
  await deleteRowsNotInValues({
    column: "client_id",
    table: "pets",
    userId,
    values: pets.map((pet) => pet.id),
  });

  if (pets.length === 0) return;

  const { error: clearActiveError } = await supabase.from("pets").update({ is_active: false }).eq("user_id", userId);
  if (clearActiveError) throw clearActiveError;

  const { data, error } = await supabase.from("pets").upsert(
    pets.map((pet) => ({
      client_id: pet.id,
      emoji: pet.emoji,
      image_url: pet.imageUrl,
      is_active: pet.id === state.pet.id,
      name: pet.name,
      preset_pet_id: getPresetPetId(pet),
      purchase_price_coins: pet.source === "preset" ? getPresetPurchasePrice(pet.id, state) : 0,
      purchase_price_krw: pet.source === "photo" ? AI_CHARACTER_GENERATION_PRICE_KRW : 0,
      source: pet.source,
      source_photo_url: pet.sourcePhotoUrl,
      species: pet.species,
      template_id: pet.templateId ?? "single-png-v1",
      trait: pet.trait,
      user_id: userId,
      visual_layers: pet.visualLayers ?? {},
    })),
    { onConflict: "user_id,client_id" },
  ).select("id, client_id");

  if (error) throw error;

  const activePetId = data?.find((pet) => pet.client_id === state.pet.id)?.id;
  if (!activePetId) return;

  const { error: profileError } = await supabase.from("profiles").update({ active_pet_id: activePetId }).eq("id", userId);
  if (profileError) throw profileError;
}

function getPetsForSync(state: PersistedAppState): UserPet[] {
  const byId = new Map<string, UserPet>();

  state.ownedPetIds.forEach((petId) => {
    const preset = petPresets.find((candidate) => candidate.id === petId);
    if (!preset) return;
    byId.set(preset.id, {
      emoji: preset.emoji,
      id: preset.id,
      imageUrl: preset.imageUrl,
      name: preset.name,
      source: "preset",
      species: preset.species,
      templateId: preset.templateId,
      trait: preset.trait,
      visualLayers: preset.visualLayers,
    });
  });

  state.ownedCustomPets.forEach((pet) => byId.set(pet.id, pet));
  byId.set(state.pet.id, state.pet);

  return Array.from(byId.values());
}

function getPresetPetId(pet: UserPet): string | null {
  if (pet.source !== "preset") return null;
  return petPresets.some((preset) => preset.id === pet.id) ? pet.id : null;
}

function getPresetPurchasePrice(petId: string, state: PersistedAppState): number {
  if (state.pet.id === petId && state.ownedPetIds.length <= 1) return 0;
  return petId === petPresets[0]?.id ? 0 : 200;
}

async function deleteRowsNotInValues({
  column,
  table,
  userId,
  values,
}: {
  column: string;
  table: string;
  userId: string;
  values: string[];
}): Promise<void> {
  if (!supabase) return;

  const query = supabase.from(table).delete().eq("user_id", userId);
  const { error } =
    values.length === 0 ? await query : await query.not(column, "in", `(${values.map(quotePostgrestValue).join(",")})`);

  if (error) throw error;
}

function quotePostgrestValue(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
