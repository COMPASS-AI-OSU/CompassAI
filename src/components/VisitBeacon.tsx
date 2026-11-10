'use client';

import { useEffect } from 'react';
import { rememberFirstTag } from '@/lib/first-ref';

// One visit per page load, even if React runs the effect twice in development.
let sent = false;

/**
 * Tells the server someone opened the site, with the link's ?ref= tag if it had one.
 * It runs only after the page has loaded in a real browser, so link previews and email
 * scanners that just fetch the link don't count as visits.
 */
export function VisitBeacon() {
  useEffect(() => {
    if (sent) return;
    sent = true;
    const ref = new URLSearchParams(window.location.search).get('ref');
    rememberFirstTag(ref);
    fetch('/api/events/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ref ? { ref } : {}),
      keepalive: true,
    }).catch(() => {
      // Analytics never gets in the way of the page.
    });
  }, []);
  return null;
}
