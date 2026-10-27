'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for the browser, acting as the signed-in user, so row-level
 * security and storage rules apply. Only uses the publishable key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
