import React from 'react';
import Link from 'next/link';
import { Lock, LogOut } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { CompassMark } from '@/components/auth/AuthShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NameMenu } from '@/components/NameMenu';

export const buttonLink =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2';
export const primaryButton = `${buttonLink} bg-[#BA0C2F] text-white hover:bg-[#990000] disabled:opacity-60 disabled:cursor-wait cursor-pointer`;
export const secondaryButton = `${buttonLink} bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 cursor-pointer`;

export function InstructorHeader({ email, firstName }: { email: string; firstName?: string }) {
  return (
    <header className="w-full bg-neutral-50/90 text-neutral-900 border-b border-neutral-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/instructor"
          className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
        >
          <CompassMark className="w-9 h-9" />
          <span className="text-xl font-semibold font-serif tracking-tight text-neutral-950">Compass</span>
          <span className="font-hand text-xl leading-none text-[#BA0C2F] -rotate-3">instructor</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <NameMenu email={email} firstName={firstName} />
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-400 text-neutral-800 hover:bg-neutral-200 font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function NotAllowed({ email, reason }: { email: string; reason: 'student' | 'not-yours' | 'missing' }) {
  const message = {
    student: (
      <>
        The instructor dashboard is only for instructors. You’re signed in as <strong>{email}</strong>, a student account.
      </>
    ),
    'not-yours': <>This course belongs to another instructor. You can only see and change your own courses.</>,
    missing: <>We couldn’t find that course. It may have been deleted.</>,
  }[reason];
  return (
    <main className="max-w-xl mx-auto px-4 py-16 space-y-4">
      <Lock className="w-10 h-10 text-[#BA0C2F]" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-neutral-950">{reason === 'missing' ? 'Course not found' : 'Not allowed'}</h1>
      <p className="text-neutral-800">{message}</p>
      {reason === 'student' && (
        <p className="text-sm text-neutral-700">
          If you teach a course, sign in again with “I’m an instructor” turned on and the code from the CompassAI team.
        </p>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href={reason === 'student' ? '/' : '/instructor'} className={primaryButton}>
          {reason === 'student' ? 'Go to your courses' : 'Back to your courses'}
        </Link>
        <form action={signOut}>
          <button type="submit" className={secondaryButton}>
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

export function PageLoading({ label }: { label: string }) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">{label}</p>
      <div className="h-8 w-56 bg-neutral-300 rounded animate-pulse" />
      <div className="h-40 bg-neutral-200 rounded-2xl animate-pulse" />
    </main>
  );
}
