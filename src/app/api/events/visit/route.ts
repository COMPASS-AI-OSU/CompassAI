import { getCurrentUser } from '@/lib/auth';
import { cleanRef, logEvent, rememberFirstRef, visitorId } from '@/lib/events';

/**
 * Saves a "visit" event each time someone opens the site (called once per page load by
 * <VisitBeacon />). Body: { ref?: string } — the ?ref= tag from the link they opened, if any.
 */
export async function POST(request: Request) {
  // Only our own pages should send visits.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) {
    return new Response(null, { status: 403 });
  }

  let ref: string | null = null;
  try {
    const body = await request.json();
    ref = cleanRef(body?.ref);
  } catch {
    // No body or not JSON: a visit without a tag.
  }

  await rememberFirstRef(ref);
  const user = await getCurrentUser();
  await logEvent({
    event: 'visit',
    // The account ID once signed in; otherwise the browser's random ID.
    actorId: user?.id ?? (await visitorId()),
    signedIn: Boolean(user),
    channel: ref,
  });
  return new Response(null, { status: 204 });
}
