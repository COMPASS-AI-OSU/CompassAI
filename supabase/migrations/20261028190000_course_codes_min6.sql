-- Course codes must be at least 6 characters, so they're harder to guess.
-- Run once in Supabase after 20261028180000_course_codes.sql: SQL Editor → New query → paste → Run.
-- Existing codes of 6 or more characters keep working.

-- Swap the old 4–20 character rule for 6–20 (the only "drop" here is that old rule).
alter table public.course_codes drop constraint if exists course_codes_code_check;
alter table public.course_codes
  add constraint course_codes_code_check check (code ~ '^[A-Z0-9-]{6,20}$');

-- Same function as before, with the 6-character minimum.
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
  if normalized !~ '^[A-Z0-9-]{6,20}$' then
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
