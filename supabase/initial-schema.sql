-- SaveWithPet initial Supabase schema.
-- Run once in Supabase SQL editor after Auth is enabled.
-- App user-owned rows use auth.uid(); public catalog/community reads are allowed where noted.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  toss_user_key text unique,
  display_name text,
  coins integer not null default 0 check (coins >= 0),
  intimacy integer not null default 50 check (intimacy >= 0 and intimacy <= 100),
  last_fed_at timestamptz,
  monthly_budget integer not null default 1500000 check (monthly_budget >= 0),
  active_pet_id uuid,
  has_completed_onboarding boolean not null default false,
  toss_login_linked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists intimacy integer not null default 50 check (intimacy >= 0 and intimacy <= 100);
alter table public.profiles add column if not exists last_fed_at timestamptz;
alter table public.profiles add column if not exists toss_login_linked_at timestamptz;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text,
  preset_pet_id text,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'rabbit', 'custom')),
  source text not null check (source in ('preset', 'photo', 'skip')),
  trait text not null default '',
  emoji text not null default '',
  image_url text,
  source_photo_url text,
  template_id text not null default 'single-png-v1',
  visual_layers jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  purchase_price_coins integer not null default 0 check (purchase_price_coins >= 0),
  purchase_price_krw integer not null default 0 check (purchase_price_krw >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pets add column if not exists client_id text;

create index if not exists pets_user_id_idx on public.pets(user_id);
create unique index if not exists pets_user_client_id_idx on public.pets(user_id, client_id);
create unique index if not exists pets_one_active_per_user_idx on public.pets(user_id) where is_active;

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_active_pet_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_active_pet_id_fkey
      foreign key (active_pet_id) references public.pets(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.shop_items (
  id text primary key,
  name text not null,
  item_type text not null check (item_type in ('wardrobe', 'snack', 'character', 'limited')),
  icon text not null default '',
  price_coins integer not null default 0 check (price_coins >= 0),
  intimacy_boost integer not null default 0 check (intimacy_boost >= 0),
  required_level integer,
  unlock_label text,
  layer text check (layer in ('backdrop', 'foreground')),
  asset_id text,
  is_limited boolean not null default false,
  is_premium_box_item boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shop_items add column if not exists intimacy_boost integer not null default 0 check (intimacy_boost >= 0);

drop trigger if exists set_shop_items_updated_at on public.shop_items;
create trigger set_shop_items_updated_at
before update on public.shop_items
for each row execute function public.set_updated_at();

insert into public.shop_items (id, name, item_type, icon, price_coins, intimacy_boost, required_level, unlock_label, layer, asset_id)
values
  ('canola-garden', '유채꽃 정원', 'wardrobe', 'canola-garden', 1200, 0, null, null, 'backdrop', 'canola-garden'),
  ('cozy-cushion', '포근 방석', 'wardrobe', 'cushion', 450, 0, null, null, 'backdrop', 'cozy-cushion'),
  ('heart-aura', '하트 오라', 'wardrobe', 'heart-aura', 600, 0, null, null, 'foreground', 'heart-aura'),
  ('coin-shower', '코인 링', 'wardrobe', 'coin-shower', 1600, 0, 12, 'Lv.12 해금', 'foreground', 'coin-shower'),
  ('sparkle-sticker', '반짝 스티커', 'wardrobe', 'sparkle-sticker', 300, 0, null, null, 'foreground', 'sparkle-sticker'),
  ('saving-sprout', '저축 새싹', 'wardrobe', 'saving-sprout', 900, 0, null, null, 'backdrop', 'saving-sprout'),
  ('carrot-snack', '아삭 당근', 'snack', 'carrot-snack', 80, 6, null, null, null, 'carrot-snack'),
  ('churu-snack', '말랑 츄르', 'snack', 'churu-snack', 120, 9, null, null, null, 'churu-snack'),
  ('bone-snack', '튼튼 뼈다귀', 'snack', 'bone-snack', 100, 8, null, null, null, 'bone-snack')
on conflict (id) do update set
  name = excluded.name,
  item_type = excluded.item_type,
  icon = excluded.icon,
  price_coins = excluded.price_coins,
  intimacy_boost = excluded.intimacy_boost,
  required_level = excluded.required_level,
  unlock_label = excluded.unlock_label,
  layer = excluded.layer,
  asset_id = excluded.asset_id,
  updated_at = now();

create table if not exists public.user_owned_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.shop_items(id) on delete cascade,
  is_equipped boolean not null default false,
  quantity integer not null default 1 check (quantity >= 0),
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_owned_items add column if not exists quantity integer not null default 1 check (quantity >= 0);

create table if not exists public.ledger_categories (
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id text not null,
  label text not null,
  icon text not null,
  is_custom boolean not null default false,
  is_selected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

drop trigger if exists set_ledger_categories_updated_at on public.ledger_categories;
create trigger set_ledger_categories_updated_at
before update on public.ledger_categories
for each row execute function public.set_updated_at();

create table if not exists public.category_budgets (
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id text not null,
  monthly_budget integer not null default 0 check (monthly_budget >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

drop trigger if exists set_category_budgets_updated_at on public.category_budgets;
create trigger set_category_budgets_updated_at
before update on public.category_budgets
for each row execute function public.set_updated_at();

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text,
  category_id text not null,
  amount integer not null check (amount >= 0),
  memo text not null default '',
  entry_date date not null,
  entry_type text not null check (entry_type in ('expense', 'saving', 'income')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ledger_entries add column if not exists client_id text;

create index if not exists ledger_entries_user_date_idx on public.ledger_entries(user_id, entry_date desc);
create unique index if not exists ledger_entries_user_client_id_idx on public.ledger_entries(user_id, client_id);

drop trigger if exists set_ledger_entries_updated_at on public.ledger_entries;
create trigger set_ledger_entries_updated_at
before update on public.ledger_entries
for each row execute function public.set_updated_at();

create table if not exists public.reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text,
  label text not null,
  coins integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.reward_events add column if not exists client_id text;

create unique index if not exists reward_events_user_client_id_idx on public.reward_events(user_id, client_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_type text not null check (product_type in ('ai_character', 'premium_box', 'coin_item', 'character_coin')),
  product_id text,
  price_coins integer not null default 0 check (price_coins >= 0),
  price_krw integer not null default 0 check (price_krw >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text,
  provider_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_purchases_updated_at on public.purchases;
create trigger set_purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

create table if not exists public.ai_character_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purchase_id uuid references public.purchases(id) on delete set null,
  source_photo_url text not null,
  prompt_version text not null default 'single-png-v1',
  input_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'failed')),
  result_image_url text,
  result_pet_id uuid references public.pets(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_character_jobs add column if not exists prompt_version text not null default 'single-png-v1';
alter table public.ai_character_jobs add column if not exists input_metadata jsonb not null default '{}'::jsonb;
alter table public.ai_character_jobs add column if not exists result_image_url text;

drop trigger if exists set_ai_character_jobs_updated_at on public.ai_character_jobs;
create trigger set_ai_character_jobs_updated_at
before update on public.ai_character_jobs
for each row execute function public.set_updated_at();

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  equipped_item_id text references public.shop_items(id) on delete set null,
  author_name text not null,
  caption text not null,
  pet_name text not null,
  pet_emoji text not null default '',
  pet_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_community_posts_updated_at on public.community_posts;
create trigger set_community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('pet-characters', 'pet-characters', true, 5242880, array['image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.shop_items enable row level security;
alter table public.user_owned_items enable row level security;
alter table public.ledger_categories enable row level security;
alter table public.category_budgets enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.reward_events enable row level security;
alter table public.purchases enable row level security;
alter table public.ai_character_jobs enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

drop policy if exists "profiles_own_all" on public.profiles;
create policy "profiles_own_all" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "pets_own_all" on public.pets;
create policy "pets_own_all" on public.pets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "shop_items_public_read" on public.shop_items;
create policy "shop_items_public_read" on public.shop_items
  for select using (is_active = true);

drop policy if exists "owned_items_own_all" on public.user_owned_items;
create policy "owned_items_own_all" on public.user_owned_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "ledger_categories_own_all" on public.ledger_categories;
create policy "ledger_categories_own_all" on public.ledger_categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "category_budgets_own_all" on public.category_budgets;
create policy "category_budgets_own_all" on public.category_budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "ledger_entries_own_all" on public.ledger_entries;
create policy "ledger_entries_own_all" on public.ledger_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reward_events_own_all" on public.reward_events;
create policy "reward_events_own_all" on public.reward_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "purchases_own_all" on public.purchases;
create policy "purchases_own_all" on public.purchases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "ai_character_jobs_own_all" on public.ai_character_jobs;
create policy "ai_character_jobs_own_all" on public.ai_character_jobs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "community_posts_public_read" on public.community_posts;
create policy "community_posts_public_read" on public.community_posts
  for select using (true);

drop policy if exists "community_posts_own_insert" on public.community_posts;
create policy "community_posts_own_insert" on public.community_posts
  for insert with check (user_id = auth.uid());

drop policy if exists "community_posts_own_update_delete" on public.community_posts;
create policy "community_posts_own_update_delete" on public.community_posts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "community_comments_public_read" on public.community_comments;
create policy "community_comments_public_read" on public.community_comments
  for select using (true);

drop policy if exists "community_comments_own_insert" on public.community_comments;
create policy "community_comments_own_insert" on public.community_comments
  for insert with check (user_id = auth.uid());

drop policy if exists "community_likes_public_read" on public.community_likes;
create policy "community_likes_public_read" on public.community_likes
  for select using (true);

drop policy if exists "community_likes_own_all" on public.community_likes;
create policy "community_likes_own_all" on public.community_likes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "pet_photos_own_all" on storage.objects;
create policy "pet_photos_own_all" on storage.objects
  for all
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "pet_characters_public_read" on storage.objects;
create policy "pet_characters_public_read" on storage.objects
  for select using (bucket_id = 'pet-characters');

drop policy if exists "pet_characters_own_write" on storage.objects;
create policy "pet_characters_own_write" on storage.objects
  for insert with check (bucket_id = 'pet-characters' and (storage.foldername(name))[1] = auth.uid()::text);
