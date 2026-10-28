-- Professor's name on each course, so students can search by professor (issue #11).
-- Nullable: instructors fill it in when they create or review a course.
-- The existing "Anyone can read published courses" policy already covers this column.
-- Run once in Supabase: SQL Editor → New query → paste → Run.

alter table public.courses
  add column if not exists professor text check (char_length(professor) <= 120);
