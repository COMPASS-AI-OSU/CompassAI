import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client with the secret key. It skips row-level security, so use it
 * only on the server and only for setting a user's role.
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
