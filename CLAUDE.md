@AGENTS.md

# CompassAI team rules

- **Never change files in `prototype/`.** It is the original Google AI Studio prototype, kept only for reference.
- **Never put a key or secret in any file except `.env.local`.** `.env.local` is git-ignored and must never be committed.
- **Work on a branch, never on `main`.**
- **Keep each branch to one issue.**
- **Before every commit, run the production build (`npm run build`) and fix every error.**

## Roles (who sees what)

Every "No" and "Own only" is a business rule. Enforce it on the server **and** in the database (row-level security), never only on the screen.

| Action | Instructor | Student | Logged out |
|---|---|---|---|
| Search published courses | Yes | Yes | Yes |
| See published rules | Yes | Yes | Yes |
| Ask Compass | Yes | Yes | No |
| Save to My Courses | No | Own only | No |
| See question history | No | Own only | No |
| Instructor dashboard | Yes | No | No |
| Create a course | Yes | No | No |
| Edit rules / syllabus | Own only | No | No |
| Publish / unpublish | Own only | No | No |
| See draft courses / rules | Own only | No | No |
| Become an instructor | Only with the team's instructor code | Only with the team's instructor code | No |

## Sign-in rules

- Sign-in is email + password with Supabase Auth. Only `@osu.edu` emails can create an account.
- No confirmation email for now: the server creates accounts already confirmed (`admin.auth.admin.createUser` with `email_confirm: true`) and signs the person in. Supabase stores only a hash of each password; our app never stores or logs passwords.
- We only collect an email and a password. Never ask for a student ID.
- The role lives in Supabase `app_metadata.role` (`instructor`, or missing for students). Users can't edit it. Only the server sets it, after checking `INSTRUCTOR_SIGNUP_CODE`.
- Read the signed-in user with `getCurrentUser()` from `src/lib/auth.ts`. Re-check it in every Server Action and Route Handler.
- Save the signed-in user's ID with everything they create (`owner_id uuid default auth.uid()`), and add row-level security to every new table.
- Database changes go in `supabase/migrations/`.
- `SUPABASE_SECRET_KEY`, `INSTRUCTOR_SIGNUP_CODE` and `ANTHROPIC_API_KEY` never get a `NEXT_PUBLIC_` prefix and are used only on the server (`src/lib/supabase/admin.ts`).
