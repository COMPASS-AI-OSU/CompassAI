-- Course import from a syllabus PDF (issue #6, with #7 upload and #8 AI levels).
-- Follows the roles table in CLAUDE.md. Run once in Supabase: SQL Editor → New query → paste → Run.
-- Needs 20261022150000_roles_and_courses.sql (courses table, is_instructor()) to have run first.

-- ---------- courses: what the syllabus import fills in ----------
-- A draft can be missing its code, name or term when the syllabus doesn't say;
-- the instructor fills them in on the review page. Publishing (#9) will require them.
alter table public.courses
  alter column code drop not null,
  alter column name drop not null,
  alter column term drop not null;

alter table public.courses
  add column if not exists overall_policy text check (char_length(overall_policy) <= 4000),
  add column if not exists syllabus_path text check (char_length(syllabus_path) <= 300),
  add column if not exists imported_at timestamptz;

-- ---------- assignments ----------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  due_at date,
  due_text text check (char_length(due_text) <= 200),
  points numeric(7, 2) check (points >= 0 and points <= 100000),
  ai_level text check (ai_level in ('allowed', 'allowed_with_disclosure', 'partial', 'prohibited')),
  instructor_comment text check (char_length(instructor_comment) <= 1000),
  syllabus_quote text check (char_length(syllabus_quote) <= 1000),
  status text not null default 'needs_review' check (status in ('needs_review', 'confirmed')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A confirmed assignment always has exactly one AI level (issue #8).
  constraint confirmed_needs_ai_level check (status <> 'confirmed' or ai_level is not null)
);

create index if not exists assignments_course_id_idx on public.assignments (course_id, position);

alter table public.assignments enable row level security;

-- True when the signed-in user owns this course.
create or replace function public.owns_course(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.courses c
    where c.id = target_course and c.owner_id = auth.uid()
  );
$$;

-- See published rules: everyone sees confirmed assignments of published courses.
create policy "Anyone can read confirmed assignments of published courses"
  on public.assignments for select
  to anon, authenticated
  using (
    status = 'confirmed'
    and exists (
      select 1 from public.courses c
      where c.id = assignments.course_id and c.status = 'published'
    )
  );

-- See draft rules: own courses only.
create policy "Owners can read their own assignments"
  on public.assignments for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- Edit an assignment's rules: instructors, own courses only.
create policy "Instructors can add assignments to their own courses"
  on public.assignments for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and (select public.is_instructor())
    and public.owns_course(course_id)
  );

create policy "Instructors can update their own assignments"
  on public.assignments for update
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()))
  with check (owner_id = (select auth.uid()) and public.owns_course(course_id));

create policy "Instructors can delete their own assignments"
  on public.assignments for delete
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()));

grant select on public.assignments to anon;
grant select, insert, update, delete on public.assignments to authenticated;

-- ---------- storage: private bucket for syllabus PDFs ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('syllabi', 'syllabi', false, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

-- Files live at <user id>/<file>.pdf. Instructors can only touch their own folder.
create policy "Instructors can upload syllabi to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'syllabi'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_instructor())
  );

create policy "Instructors can read their own syllabi"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'syllabi'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_instructor())
  );

create policy "Instructors can delete their own syllabi"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'syllabi'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_instructor())
  );
