import React from 'react';
import Link from 'next/link';

/** The compass from the whiteboard sketch: a circle with N, E, S, W. */
export function CompassMark({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#fff" stroke="#BA0C2F" strokeWidth="3" />
      <path d="M32 14 L37 32 L32 50 L27 32 Z" fill="#BA0C2F" />
      <path d="M14 32 L32 27 L50 32 L32 37 Z" fill="#171717" opacity="0.85" />
      <text x="32" y="11.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#171717">N</text>
      <text x="32" y="59" textAnchor="middle" fontSize="8" fontWeight="700" fill="#171717">S</text>
      <text x="58" y="35" textAnchor="middle" fontSize="8" fontWeight="700" fill="#171717">E</text>
      <text x="6" y="35" textAnchor="middle" fontSize="8" fontWeight="700" fill="#171717">W</text>
    </svg>
  );
}

/**
 * Layout for the sign-in screens, following the whiteboard sketch:
 * logo and "Compass AI" at the top, the form in the middle,
 * account links on the right.
 */
export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans antialiased">
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-4"
        >
          <CompassMark className="w-14 h-14 sm:w-16 sm:h-16" />
          <span className="flex items-end gap-2">
            <span className="text-4xl sm:text-5xl font-bold font-serif tracking-tight text-neutral-950">
              Compass
            </span>
            <span className="text-sm font-extrabold text-[#BA0C2F] mb-1.5">AI</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-neutral-950">{title}</h1>
        {intro && <p className="mt-1 text-sm text-neutral-700 max-w-xl">{intro}</p>}
        <div className="mt-6">{children}</div>
      </main>

      <footer className="w-full py-4 border-t border-neutral-300 bg-white text-center text-xs text-neutral-600 px-4">
        CompassAI · The Ohio State University COAM Syllabus Companion
      </footer>
    </div>
  );
}
