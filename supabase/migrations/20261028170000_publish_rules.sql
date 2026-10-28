-- Publish rules (issue #9), enforced in the database so they hold even if someone skips the screens.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- A course can change from draft to published only when:
--   - it has a code, name and term,
--   - it has at least one assignment, and
--   - every assignment is confirmed with an AI level (issue #8).
-- Unpublishing (back to draft) is always allowed.
-- Who may change a course is already limited to its owner, an instructor, by row-level security.

create or replace function public.check_course_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    if new.code is null or new.name is null or new.term is null then
      raise exception 'Add the course code, name and term before publishing.'
        using errcode = 'check_violation';
    end if;

    if not exists (select 1 from public.assignments a where a.course_id = new.id) then
      raise exception 'Add at least one assignment before publishing.'
        using errcode = 'check_violation';
    end if;

    if exists (
      select 1 from public.assignments a
      where a.course_id = new.id and (a.status <> 'confirmed' or a.ai_level is null)
    ) then
      raise exception 'Confirm every assignment before publishing.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists courses_check_publish on public.courses;
create trigger courses_check_publish
  before update of status on public.courses
  for each row
  execute function public.check_course_publish();
