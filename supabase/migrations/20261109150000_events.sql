-- Launch analytics: one row per visit, sign-up and core action (Compass answering a student).
--
-- Privacy: no names, no emails, no question text. actor_id is the account ID once someone is
-- signed in, otherwise a random ID kept in a cookie in their browser. "How did you hear about us?"
-- is a fixed list, so no free text (and no names) can get in.
--
-- Access: only the server writes rows, with the secret key (src/lib/events.ts). Row-level security
-- is on with no policies, and every privilege is revoked from the app's roles, so signed-in users
-- and logged-out visitors can neither read nor write this table.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event       text not null check (event in ('visit', 'sign_up', 'core_action')),
  -- Account ID (uuid) once signed in, otherwise the browser's random ID (uuid).
  actor_id    text not null check (actor_id ~ '^[0-9a-f-]{36}$'),
  signed_in   boolean not null default false,
  -- The ?ref= tag: on visits, from the link just opened; on sign_up and core_action, from the first visit.
  channel     text check (channel ~ '^[a-z0-9_-]{1,40}$'),
  -- Only on sign_up rows.
  heard_about text check (
    heard_about in ('friend', 'instructor', 'class_or_club', 'social_media', 'group_chat', 'search', 'other')
  ),
  check (heard_about is null or event = 'sign_up')
);

create index if not exists events_event_created_at_idx on public.events (event, created_at);
create index if not exists events_actor_id_idx on public.events (actor_id);

alter table public.events enable row level security;
-- No policies on purpose: nothing but the secret key (which skips row-level security) can touch it.
revoke all on table public.events from anon, authenticated;
