-- Questions students ask Compass (issue #17), enforced in the database (row-level security).
-- Follows the roles table in CLAUDE.md: asking Compass needs sign-in, and each person
-- sees only their own questions. Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- The server saves each question first, then fills in Claude's answer on the same row.
-- Asking the same question again (same assignment, same syllabus text) reuses that answer.

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id text not null check (char_length(course_id) between 1 and 100),
  assignment_id text not null check (char_length(assignment_id) between 1 and 100),
  question text not null check (char_length(question) between 1 and 500),
  -- Lower-cased, trimmed question, used to find a saved answer to reuse.
  question_key text not null check (char_length(question_key) between 1 and 500),
  -- Hash of the syllabus text the answer came from. A new hash means a new answer.
  source_hash text not null,
  -- Null until Claude has answered.
  verdict text check (verdict in ('allowed', 'not_allowed', 'ask_instructor')),
  answer text check (char_length(answer) <= 2000),
  quote text check (char_length(quote) <= 2000),
  model text,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index if not exists questions_reuse_idx
  on public.questions (owner_id, assignment_id, question_key, source_hash);

alter table public.questions enable row level security;

-- Ask Compass: signed-in users only, saved under their own ID.
create policy "Users can save their own questions"
  on public.questions for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

-- See question history: own only.
create policy "Users can read their own questions"
  on public.questions for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- The server fills in the answer on the user's own row.
create policy "Users can update their own questions"
  on public.questions for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant select, insert, update on public.questions to authenticated;
