-- Launch analytics (issue #64): a row each time a student saves a course to My Courses, the
-- middle step of our funnel (visit -> sign up -> save a course -> Compass answer).
-- Same privacy and access as the rest of the table: the account ID and channel tag only, never
-- the course, a name or an email; only the server writes rows, with the secret key.

alter table public.events
  drop constraint if exists events_event_check;
alter table public.events
  add constraint events_event_check check (event in ('visit', 'sign_up', 'save_course', 'core_action'));
