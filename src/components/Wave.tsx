import React from 'react';

/** The hand-drawn wave from the Notebook look: slightly uneven on purpose, like a pen stroke. */
const UNDERLINE = 'M2 7 Q 14 1.5 27 5.5 T 52 6 T 77 5 T 100 5.5 T 124 5 T 148 6.5 T 172 5 T 198 4.5';

/** Underlines a word or short phrase with a scarlet wave. */
export function WaveUnderline({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`wave-under ${className}`}>
      {children}
      <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
        <path d={UNDERLINE} stroke="#BA0C2F" strokeWidth="3" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

/** Two soft wavy lines across the page, used between sections and above footers. */
export function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full h-6 sm:h-8 text-neutral-300 ${className}`}
    >
      <path
        d="M0 16 C 90 4, 170 28, 260 16 S 420 4, 500 16 S 600 26, 640 14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 26 C 90 14, 170 36, 260 25 S 420 14, 500 26 S 600 34, 640 23"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
