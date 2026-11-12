import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, MessageSquareText, PlayCircle, Search, ShieldCheck } from 'lucide-react';
import { CompassMark } from '@/components/auth/AuthShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PolicyBadge } from '@/components/PolicyBadge';
import { WaveDivider, WaveUnderline } from '@/components/Wave';

/**
 * The home page for visitors who aren't signed in: what CompassAI is, who it's for, and one
 * sign-up button. Copy comes from our launch deck. No made-up quotes, user counts or logos.
 */
export function LandingPage() {
  return (
    <div className="paper min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans antialiased">
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-4"
        >
          <CompassMark className="w-10 h-10 sm:w-12 sm:h-12" />
          <span className="flex items-end gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold font-serif tracking-tight text-neutral-950">Compass</span>
            <span className="text-xs font-extrabold text-[#BA0C2F] mb-1">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-neutral-800 underline-offset-4 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
          >
            Sign in
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero: the headline and the one sign-up button fit on a phone without scrolling. */}
        <section aria-labelledby="landing-headline" className="pt-8 sm:pt-16 pb-10 sm:pb-14 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="font-hand text-2xl text-[#BA0C2F] -rotate-2 origin-left">for Ohio State students</p>
            <h1 id="landing-headline" className="mt-1 text-4xl sm:text-6xl font-semibold font-serif tracking-tight text-neutral-950 leading-[1.08]">
              Students ask. The syllabus <WaveUnderline>answers.</WaveUnderline>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-neutral-700 max-w-xl leading-relaxed">
              Tells OSU students if they can use AI on each assignment, straight from the syllabus.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#BA0C2F] hover:bg-[#8F0A24] text-white text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2 min-h-[48px]"
              >
                Sign up free with your OSU email
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/courses"
                className="text-sm font-semibold text-neutral-700 underline underline-offset-4 hover:text-neutral-950 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] self-center sm:self-auto"
              >
                Browse courses without an account
              </Link>
            </div>
          </div>

          {/* Teaser video goes here once it's ready. */}
          <div
            className="aspect-video w-full rounded-2xl border-2 border-dashed border-neutral-400 bg-neutral-50 flex flex-col items-center justify-center gap-1 text-neutral-600 -rotate-1"
            role="img"
            aria-label="Video coming soon"
          >
            <PlayCircle className="w-12 h-12 text-neutral-400" aria-hidden="true" />
            <p className="font-hand text-2xl text-neutral-700">video coming soon</p>
          </div>
        </section>

        <WaveDivider className="mb-10 sm:mb-14" />

        {/* How it works, with a real rule from a published course. */}
        <section aria-labelledby="how-heading" className="pb-12 sm:pb-16">
          <h2 id="how-heading" className="text-3xl font-semibold font-serif tracking-tight text-neutral-950">How it works</h2>
          <ol className="mt-5 grid sm:grid-cols-3 gap-4">
            <Step icon={Search} n={1} title="Find your course">
              Search by course code, name or professor, like Economics 2001.01.
            </Step>
            <Step icon={BookOpen} n={2} title="See each assignment’s AI rule">
              Every assignment, in due-date order, with your professor’s own words.
            </Step>
            <Step icon={MessageSquareText} n={3} title="Ask Compass">
              Get Allowed, Not allowed, or Ask your instructor, with the syllabus line it used.
            </Step>
          </ol>

          <div className="mt-6 bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 max-w-2xl rotate-[0.4deg]">
            <p className="font-hand text-xl text-[#BA0C2F]">from a real syllabus:</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-bold text-neutral-950">Economics 2001.01 · Test 2</span>
              <PolicyBadge status="strictly_prohibited" label="Prohibited" size="sm" />
            </div>
            <p className="mt-2 text-sm italic text-neutral-700">“AI Allowed for Studying, not on test.”</p>
          </div>
        </section>

        {/* Who it's for. */}
        <section aria-labelledby="who-heading" className="pb-14 sm:pb-20">
          <h2 id="who-heading" className="text-3xl font-semibold font-serif tracking-tight text-neutral-950">Who it’s for</h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-300 rounded-2xl p-5">
              <h3 className="font-bold text-neutral-950">Students</h3>
              <p className="mt-1 text-sm text-neutral-700">
                Check what’s allowed before you start, and copy an AI disclosure for your Canvas submission in one click.
              </p>
            </div>
            <div className="bg-white border border-neutral-300 rounded-2xl p-5">
              <h3 className="font-bold text-neutral-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#BA0C2F]" aria-hidden="true" />
                Instructors
              </h3>
              <p className="mt-1 text-sm text-neutral-700">
                Upload your syllabus, confirm each assignment’s AI rule, and publish. Students only see rules you’ve confirmed.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-4 border-t border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-600 px-4">
        CompassAI · The Ohio State University COAM Syllabus Companion
      </footer>
    </div>
  );
}

function Step({
  icon: Icon,
  n,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="bg-white border border-neutral-300 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="font-hand text-3xl leading-none text-[#BA0C2F]">{n}.</span>
        <Icon className="w-4 h-4 text-neutral-500" aria-hidden={true} />
      </div>
      <h3 className="mt-2 text-lg font-semibold font-serif text-neutral-950">{title}</h3>
      <p className="mt-1 text-sm text-neutral-700">{children}</p>
    </li>
  );
}
