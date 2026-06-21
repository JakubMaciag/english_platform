-- =============================================
-- English Learning Platform — Initial Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  level text not null default 'B2' check (level in ('B2', 'C1', 'C2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Dictionary entries
create table if not exists public.dictionary_entries (
  id bigint generated always as identity primary key,
  word text not null,
  translation text not null,
  dict_type text not null check (dict_type in ('pl-en', 'en-pl', 'en-en')),
  description text,
  example_sentence text,
  level text not null default 'all' check (level in ('B2', 'C1', 'C2', 'all')),
  created_at timestamptz not null default now()
);

create index on public.dictionary_entries using gin (to_tsvector('english', word || ' ' || translation));

-- Exercises
create table if not exists public.exercises (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  category text not null check (category in ('grammar', 'vocabulary')),
  level text not null check (level in ('B2', 'C1', 'C2')),
  exercise_type text not null check (exercise_type in ('multiple_choice', 'fill_blank', 'matching', 'translation')),
  data jsonb not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- User exercise progress
create table if not exists public.user_exercise_progress (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_id bigint references public.exercises(id) on delete cascade not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  score integer check (score between 0 and 100),
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, exercise_id)
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.profiles enable row level security;
alter table public.dictionary_entries enable row level security;
alter table public.exercises enable row level security;
alter table public.user_exercise_progress enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin());

-- Dictionary (read: all auth users; write: admins only)
create policy "dict_select" on public.dictionary_entries
  for select using (auth.role() = 'authenticated');

create policy "dict_insert" on public.dictionary_entries
  for insert with check (public.is_admin());

create policy "dict_update" on public.dictionary_entries
  for update using (public.is_admin());

create policy "dict_delete" on public.dictionary_entries
  for delete using (public.is_admin());

-- Exercises (read: all auth; write: admins)
create policy "exercises_select" on public.exercises
  for select using (auth.role() = 'authenticated');

create policy "exercises_insert" on public.exercises
  for insert with check (public.is_admin());

create policy "exercises_update" on public.exercises
  for update using (public.is_admin());

create policy "exercises_delete" on public.exercises
  for delete using (public.is_admin());

-- Progress (users own their data; admins read all)
create policy "progress_own_all" on public.user_exercise_progress
  for all using (auth.uid() = user_id);

create policy "progress_admin_select" on public.user_exercise_progress
  for select using (public.is_admin());
