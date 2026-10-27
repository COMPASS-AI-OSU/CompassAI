import 'server-only';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type Role = 'student' | 'instructor';

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * The signed-in user, or null when logged out.
 * The role comes from app_metadata, which users can't change themselves:
 * only the server sets it, after checking the instructor code.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // The session check reads the clock (token expiry), so it must run per request, never prerendered.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims;
  return {
    id: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : '',
    role: claims.app_metadata?.role === 'instructor' ? 'instructor' : 'student',
  };
}

/** Only allow redirects to paths on this site, like "/instructor". */
export function safeNextPath(next: unknown): string | null {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}
