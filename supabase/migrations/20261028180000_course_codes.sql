-- Course codes and My Courses (testing feature; starts issue #12's saved-courses list).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Instructors set a code on their own course. Students who enter it save the course to My Courses.
-- Students can never read codes: codes live in their own table that only the course's
-- instructor can see, and students join through join_course_by_code(), which checks the
-- code without revealing it.

-- ---------- course codes (instructor only) ----------
create table if not exists public.course_codes (
  course_id uuid primary key references public.courses (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9-]{4,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One course per code, whatever the capitals (codes are stored in capitals).
create unique index if not exists course_codes_code_key on public.course_codes (code);

alter table public.course_codes enable row level security;

create policy "Instructors can read their own course codes"
  on public.course_codes for select
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()));

create policy "Instructors can set codes on their own courses"
  on public.course_codes for insert
  to authenticated
  with check (owner_id = (select auth.uid()) and (select public.is_instructor()) and public.owns_course(course_id));

create policy "Instructors can change their own course codes"
  on public.course_codes for update
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()))
  with check (owner_id = (select auth.uid()) and public.owns_course(course_id));

create policy "Instructors can remove their own course codes"
  on public.course_codes for delete
  to authenticated
  using (owner_id = (select auth.uid()) and (select public.is_instructor()));

grant select, insert, update, delete on public.course_codes to authenticated;
-- No policy allows anon, so logged-out visitors get no rows and can't change anything.

-- ---------- My Courses (student only) ----------
create table if not exists public.my_courses (
  student_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

alter table public.my_courses enable row level security;

-- Roles table: Save to My Courses is "Own only" for students, "No" for instructors.
create policy "Students can read their own saved courses"
  on public.my_courses for select
  to authenticated
  using (student_id = (select auth.uid()));

create policy "Students can save published courses"
  on public.my_courses for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    and not (select public.is_instructor())
    and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );

create policy "Students can remove their own saved courses"
  on public.my_courses for delete
  to authenticated
  using (student_id = (select auth.uid()));

grant select, insert, delete on public.my_courses to authenticated;

-- ---------- join by code ----------
-- Returns the course id and what happened: 'added', 'already_added', 'not_found',
-- 'not_published', 'instructor' or 'signed_out'. Never returns the code itself.
create or replace function public.join_course_by_code(input_code text)
returns table (course_id uuid, result text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := upper(regexp_replace(coalesce(input_code, ''), '\s', '', 'g'));
  found_course uuid;
  found_status text;
  inserted integer;
begin
  if auth.uid() is null then
    return query select null::uuid, 'signed_out'::text;
    return;
  end if;
  if public.is_instructor() then
    return query select null::uuid, 'instructor'::text;
    return;
  end if;
  if normalized !~ '^[A-Z0-9-]{4,20}$' then
    return query select null::uuid, 'not_found'::text;
    return;
  end if;

  select c.id, c.status into found_course, found_status
  from public.course_codes cc
  join public.courses c on c.id = cc.course_id
  where cc.code = normalized;

  if found_course is null then
    return query select null::uuid, 'not_found'::text;
    return;
  end if;
  if found_status <> 'published' then
    return query select null::uuid, 'not_published'::text;
    return;
  end if;

  insert into public.my_courses (student_id, course_id)
  values (auth.uid(), found_course)
  on conflict do nothing;
  get diagnostics inserted = row_count;

  return query select found_course, (case when inserted = 1 then 'added' else 'already_added' end)::text;
end;
$$;

revoke all on function public.join_course_by_code(text) from public, anon;
grant execute on function public.join_course_by_code(text) to authenticated;
