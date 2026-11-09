'use client';

import { useEffect } from 'react';

// One visit per page load, even if React runs the effect twice in development.
let sent = false;

/** Tells the server someone opened the site, with the link's ?ref= tag if it had one. */
export function VisitBeacon() {
  useEffect(() => {
    if (sent) return;
    sent = true;
    const ref = new URLSearchParams(window.location.search).get('ref');
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
