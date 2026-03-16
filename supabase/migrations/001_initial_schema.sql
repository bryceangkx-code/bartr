-- ============================================================
-- Bartr MVP — Initial Schema
-- Run this in the Supabase SQL editor or via supabase db push
-- ============================================================

-- -------------------------------------------------------
-- PROFILES (extends auth.users)
-- -------------------------------------------------------
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  role       text not null check (role in ('creator', 'brand')),
  display_name text,
  avatar_url text,
  bio        text,
  location   text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- Everyone can read profiles
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can only insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------
-- CREATOR PROFILES
-- -------------------------------------------------------
create table if not exists public.creator_profiles (
  id                 uuid references public.profiles on delete cascade primary key,
  instagram_handle   text,
  instagram_user_id  text,
  followers          int,
  engagement_rate    numeric(5,2),
  niches             text[],
  portfolio_urls     text[],
  verified_at        timestamptz
);

alter table public.creator_profiles enable row level security;

create policy "creator_profiles_select_all"
  on public.creator_profiles for select
  using (true);

create policy "creator_profiles_insert_own"
  on public.creator_profiles for insert
  with check (auth.uid() = id);

create policy "creator_profiles_update_own"
  on public.creator_profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------
-- BRAND PROFILES
-- -------------------------------------------------------
create table if not exists public.brand_profiles (
  id           uuid references public.profiles on delete cascade primary key,
  company_name text,
  website      text,
  category     text,
  credits      int default 0 not null
);

alter table public.brand_profiles enable row level security;

create policy "brand_profiles_select_all"
  on public.brand_profiles for select
  using (true);

create policy "brand_profiles_insert_own"
  on public.brand_profiles for insert
  with check (auth.uid() = id);

create policy "brand_profiles_update_own"
  on public.brand_profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------
-- LISTINGS
-- -------------------------------------------------------
create table if not exists public.listings (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid references public.brand_profiles on delete cascade not null,
  title               text not null,
  description         text,
  product_value_sgd   numeric(10,2),
  deliverables        text,
  min_followers       int,
  min_engagement_rate numeric(5,2),
  niches              text[],
  status              text default 'active' not null check (status in ('active', 'paused', 'closed')),
  created_at          timestamptz default now() not null
);

alter table public.listings enable row level security;

-- Anyone can read active listings
create policy "listings_select_active"
  on public.listings for select
  using (status = 'active' or brand_id = auth.uid());

-- Only the brand owner can insert listings
create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.uid() = brand_id);

-- Only the brand owner can update their listings
create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = brand_id);

-- -------------------------------------------------------
-- DEALS
-- -------------------------------------------------------
create table if not exists public.deals (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid references public.listings on delete cascade not null,
  creator_id   uuid references public.creator_profiles on delete cascade not null,
  brand_id     uuid references public.brand_profiles on delete cascade not null,
  status       text default 'applied' not null check (
                 status in ('applied', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')
               ),
  creator_note text,
  brand_note   text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table public.deals enable row level security;

-- Creator or brand involved can read deals
create policy "deals_select_participants"
  on public.deals for select
  using (auth.uid() = creator_id or auth.uid() = brand_id);

-- Only creators can apply (insert a deal)
create policy "deals_insert_creator"
  on public.deals for insert
  with check (auth.uid() = creator_id);

-- Brand can update deal status; creator can also update (for cancellation)
create policy "deals_update_participants"
  on public.deals for update
  using (auth.uid() = brand_id or auth.uid() = creator_id);

-- -------------------------------------------------------
-- AUTO-UPDATE updated_at on deals
-- -------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------
-- AUTO-CREATE profile on signup
-- -------------------------------------------------------
-- This function is called by a Supabase Auth hook (see README)
-- Or triggered manually from the onboarding API route.
-- We keep a trigger here as a safety net.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Profile row is created explicitly during onboarding with role.
  -- This trigger is intentionally a no-op to avoid role ambiguity.
  return new;
end;
$$ language plpgsql security definer;
