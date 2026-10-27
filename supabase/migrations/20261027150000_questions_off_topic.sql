-- Off-topic questions (issue #18): Compass saves them with the verdict 'off_topic'
-- and answers "I can only answer about this course's AI policy." with no verdict shown.
-- Run once in Supabase: SQL Editor → New query → paste → Run.

alter table public.questions drop constraint if exists questions_verdict_check;

alter table public.questions
  add constraint questions_verdict_check
  check (verdict in ('allowed', 'not_allowed', 'ask_instructor', 'off_topic'));
