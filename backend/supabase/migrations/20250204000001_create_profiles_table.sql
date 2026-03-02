-- Create profiles table if it does not exist (fixes "Could not find the table 'public.profiles'").
-- Run this in Supabase Dashboard → SQL Editor, or via Supabase CLI.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,
  updated_at timestamptz default now(),
  onboarding_completed_at timestamptz,
  onboarding_answers jsonb default '{}'
);

-- Ensure onboarding columns exist (if table was created earlier without them)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'onboarding_completed_at') then
    alter table public.profiles add column onboarding_completed_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'onboarding_answers') then
    alter table public.profiles add column onboarding_answers jsonb default '{}';
  end if;
end $$;

-- Allow users to read and update their own profile
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

comment on table public.profiles is 'User profile and onboarding survey data';
