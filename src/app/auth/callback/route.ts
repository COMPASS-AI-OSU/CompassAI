import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, safeNextPath } from '@/lib/auth';

/**
 * Where links in Supabase emails land: confirming a new account and
 * resetting a password. Signs the person in, then sends them on.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeNextPath(searchParams.get('next'));

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (!ok) {
    // Expired, already used, or opened in a different browser.
    return NextResponse.redirect(new URL('/sign-in?error=link', origin));
  }

  const user = await getCurrentUser();
  const destination = next ?? (user?.role === 'instructor' ? '/instructor' : '/');
  return NextResponse.redirect(new URL(destination, origin));
}
