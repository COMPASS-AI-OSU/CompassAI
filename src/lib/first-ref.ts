/**
 * The ?ref= tag from someone's first visit, kept in this browser so the sign-up form can send it
 * with the sign-up request. The server also keeps it in a cookie (src/lib/events.ts).
 */
const KEY = 'compass_first_ref';

export function cleanTag(ref: string | null | undefined): string | null {
  const tag = (ref ?? '').trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(tag) ? tag : null;
}

/** Saves the tag only if this browser doesn't have one yet (first visit wins). */
export function rememberFirstTag(ref: string | null): void {
  const tag = cleanTag(ref);
  if (!tag) return;
  try {
    if (!cleanTag(window.localStorage.getItem(KEY))) window.localStorage.setItem(KEY, tag);
  } catch {
    // Storage blocked (private mode on some browsers): the server's cookie still has it.
  }
}

export function readFirstTag(): string | null {
  try {
    return cleanTag(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}
