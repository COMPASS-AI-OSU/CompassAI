-- Landing-page headline experiment (issue #57): which headline a logged-out visitor saw on the
-- home page, 'a' (current) or 'b' (COAM). Saved on their visit rows for the home page and on
-- their sign_up row, so we can count sign-ups per version. Null everywhere else.
-- Access is unchanged: only the server writes this table, with the secret key.

alter table public.events
  add column if not exists variant text check (variant in ('a', 'b'));

alter table public.events
  drop constraint if exists events_variant_event_check;
alter table public.events
  add constraint events_variant_event_check check (variant is null or event in ('visit', 'sign_up'));
