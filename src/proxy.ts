import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cleanVariant, HEADLINE_COOKIE, HEADLINE_COOKIE_MAX_AGE, pickVariant } from '@/lib/experiment';

// Pages a logged-out visitor can't open. Each page also checks the role on
// the server; this is only the first, quick check.
const PROTECTED_PATHS = ['/instructor', '/reset-password'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  // Refreshes the session cookie when it's about to expire.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!signedIn && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    url.searchParams.set('next', path);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  // Already signed in: skip the sign-in and create-account screens.
  if (signedIn && (path === '/sign-in' || path === '/sign-up')) {
    const isInstructor = data?.claims?.app_metadata?.role === 'instructor';
    const redirect = NextResponse.redirect(new URL(isInstructor ? '/instructor' : '/', request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  // Headline experiment (#57): a logged-out visitor to the home page without a version yet gets
  // one at random. It goes on the request too, so the page renders that version right away.
  if (!signedIn && path === '/' && !cleanVariant(request.cookies.get(HEADLINE_COOKIE)?.value)) {
    const variant = pickVariant();
    request.cookies.set(HEADLINE_COOKIE, variant);
    const previous = response;
    response = NextResponse.next({ request });
    previous.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    ['cache-control', 'expires', 'pragma'].forEach((key) => {
      const value = previous.headers.get(key);
      if (value) response.headers.set(key, value);
    });
    response.cookies.set(HEADLINE_COOKIE, variant, {
      path: '/',
      maxAge: HEADLINE_COOKIE_MAX_AGE,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
