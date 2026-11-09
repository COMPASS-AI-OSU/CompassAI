import 'server-only';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { HEARD_ABOUT, type HeardAbout } from '@/lib/heard-about';

/**
 * Launch analytics (`events` table). Rows are written only here, on the server, with the secret
 * key; users can't read or write the table. We never save names, emails or question text.
 */

export type EventName = 'visit' | 'sign_up' | 'core_action';

/** Random ID for a browser that isn't signed in. */
export const VISITOR_COOKIE = 'compass_vid';
/** The ?ref= tag from someone's first visit. */
export const FIRST_REF_COOKIE = 'compass_ref';
const ONE_YEAR = 60 * 60 * 24 * 365;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** A clean channel tag ("ig_story", "busadm-2802"), or null. Anything else is ignored. */
export function cleanRef(ref: unknown): string | null {
  if (typeof ref !== 'string') return null;
  const tag = ref.trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(tag) ? tag : null;
}

export function cleanHeardAbout(value: unknown): HeardAbout | null {
  return HEARD_ABOUT.some((h) => h.value === value) ? (value as HeardAbout) : null;
}

const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: ONE_YEAR };

/**
 * The browser's random ID, creating it if needed. Call only where cookies can be set
 * (a Route Handler or Server Action).
 */
export async function visitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing && UUID.test(existing)) return existing;
  const id = crypto.randomUUID();
  jar.set(VISITOR_COOKIE, id, cookieOptions);
  return id;
}

/** Remembers the tag from someone's first tagged visit; later tags don't replace it. */
export async function rememberFirstRef(tag: string | null): Promise<void> {
  if (!tag) return;
  const jar = await cookies();
  if (!cleanRef(jar.get(FIRST_REF_COOKIE)?.value)) jar.set(FIRST_REF_COOKIE, tag, cookieOptions);
}

export async function firstRef(): Promise<string | null> {
  return cleanRef((await cookies()).get(FIRST_REF_COOKIE)?.value);
}

/** Saves one event. Never throws: analytics must not break the page or the action it's in. */
export async function logEvent(row: {
  event: EventName;
  actorId: string;
  signedIn: boolean;
  channel?: string | null;
  heardAbout?: HeardAbout | null;
}): Promise<void> {
  try {
    if (!UUID.test(row.actorId)) return;
    const { error } = await createAdminClient().from('events').insert({
      event: row.event,
      actor_id: row.actorId,
      signed_in: row.signedIn,
      channel: row.channel ?? null,
      heard_about: row.event === 'sign_up' ? row.heardAbout ?? null : null,
    });
    if (error) console.error(`Couldn't save the ${row.event} event:`, error.message);
  } catch (error) {
    console.error(`Couldn't save the ${row.event} event:`, error);
  }
}
