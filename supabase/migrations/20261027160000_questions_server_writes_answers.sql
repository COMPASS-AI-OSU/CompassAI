-- Only the server writes Compass's answers (issue #29).
-- Before this, a signed-in student could update their own questions rows, or insert one
-- with a verdict already filled in, and change what Compass told them.
-- Now students can only insert the question itself and read their own rows. The server
-- fills in the answer with the secret key (src/lib/supabase/admin.ts), which skips RLS.
-- Run once in Supabase: SQL Editor → New query → paste → Run.

-- No more updates by students, even to their own rows.
drop policy if exists "Users can update their own questions" on public.questions;
revoke update on public.questions from authenticated;

-- Students may insert only the question columns; the answer columns stay empty
-- (owner_id, id and created_at come from their defaults).
revoke insert on public.questions from authenticated;
grant insert (course_id, assignment_id, question, question_key, source_hash)
  on public.questions to authenticated;

-- Defense in depth: a student's insert must leave the answer empty.
drop policy if exists "Users can save their own questions" on public.questions;
create policy "Users can save their own questions"
  on public.questions for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and verdict is null
    and answer is null
    and quote is null
    and model is null
    and answered_at is null
  );
