-- Roles and courses, enforced in the database (row-level security).
-- Follows the roles table in CLAUDE.md. Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- The instructor role lives in auth.users.raw_app_meta_data ("app_metadata"),
-- which users can't change. Only the server sets it, after checking the
-- team's instructor code.

-- True when the signed-in user is an instructor.
create or replace function public.is_instructor()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'instructor', false);
$$;

-- Courses (issue #6 will add the screens). owner_id saves the creator's user ID automatically.
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code text not null check (char_length(code) between 1 and 20),
  name text not null check (char_length(name) between 1 and 200),
  term text not null check (char_length(term) between 1 and 40),
  office_hours text check (char_length(office_hours) <= 500),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, code, term)
);

alter table public.courses enable row level security;

-- See published rules: everyone, including logged-out visitors.
create policy "Anyone can read published courses"
  on public.courses for select
  to anon, authenticated
  using (status = 'published');

-- See draft courses: own courses only.
create policy "Owners can read their own courses"
  on public.courses for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- Create a course: instructors only, saved under their own ID.
create policy "Instructors can create their own courses"
  on public.courses for insert
  to authenticated
  with check (owner_id = (select auth.uid()) and (select public.is_instructor()));

-- Edit / publish: own courses only.
create policy "Instructors can update their own courses"
  on public.courses for update
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()))
  with check (owner_id = (select auth.uid()));

create policy "Instructors can delete their own courses"
  on public.courses for delete
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()));

grant select on public.courses to anon;
grant select, insert, update, delete on public.courses to authenticated;
