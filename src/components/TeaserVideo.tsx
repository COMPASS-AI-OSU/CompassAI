'use client';

import { useEffect, useRef } from 'react';

/**
 * The 40-second teaser on the landing page: real screens from the live site, no sound.
 * It loops silently, and people who ask for less motion get the still image and a play button
 * instead of autoplay. Controls are always there so anyone can pause it.
 */
export function TeaserVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.play().catch(() => {
      // Autoplay blocked (low-power mode, data saver): the poster and play button still show.
    });
  }, []);

  return (
    <video
      ref={ref}
      className="aspect-video w-full rounded-2xl border border-neutral-300 bg-neutral-50 shadow-sm -rotate-1"
      src="/teaser/compass-ai-teaser.mp4"
      poster="/teaser/compass-ai-teaser-poster.jpg"
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label="40-second demo of CompassAI: search for a course, see each assignment's AI rule, filter to the no-AI work, and ask Compass, which answers with the syllabus line it relied on."
    />
  );
}
