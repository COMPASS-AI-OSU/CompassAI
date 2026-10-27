import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Lock, LogOut, PlusCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { signOut } from '@/app/(auth)/actions';
import { CompassMark } from '@/components/auth/AuthShell';

export const metadata: Metadata = { title: 'Instructor dashboard · CompassAI' };

const buttonLink =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2';

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <Suspense fallback={<DashboardLoading />}>
        <InstructorContent />
      </Suspense>
    </div>
  );
}

async function InstructorContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/instructor');

  if (user.role !== 'instructor') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <Lock className="w-10 h-10 text-[#BA0C2F]" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-neutral-950">Not allowed</h1>
        <p className="text-neutral-800">
          The instructor dashboard is only for instructors. You’re signed in as <strong>{user.email}</strong>, a student
          account.
        </p>
        <p className="text-sm text-neutral-700">
          If you teach a course, sign in again with “I’m an instructor” turned on and the code from the CompassAI team.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className={`${buttonLink} bg-[#BA0C2F] text-white hover:bg-[#990000]`}>
            Go to your courses
          </Link>
          <form action={signOut}>
            <button type="submit" className={`${buttonLink} bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 cursor-pointer`}>
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="w-full bg-neutral-950 text-white border-b-2 border-b-[#BA0C2F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/instructor" className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]">
            <CompassMark className="w-9 h-9" />
            <span className="font-extrabold">CompassAI</span>
            <span className="text-[11px] font-bold uppercase bg-[#BA0C2F] px-1.5 py-0.5 rounded">Instructor</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-neutral-300">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-600 hover:bg-neutral-800 font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-neutral-950">Your courses</h1>
            <p className="text-sm text-neutral-700 mt-1">Only you can see and change the courses you create.</p>
          </div>
          <Link href="/" className={`${buttonLink} bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50`}>
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            See the student view
          </Link>
        </div>

        <section aria-labelledby="empty-heading" className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-8 text-center space-y-3">
          <PlusCircle className="w-10 h-10 text-[#BA0C2F] mx-auto" aria-hidden="true" />
          <h2 id="empty-heading" className="text-lg font-bold text-neutral-950">
            No courses yet
          </h2>
          <p className="text-sm text-neutral-700 max-w-md mx-auto">
            Adding a course with its code, name and term is coming next (issue #6). Your courses will show here as
            drafts until you publish them.
          </p>
        </section>
      </main>
    </>
  );
}

function DashboardLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading your dashboard…</p>
      <div className="h-8 w-56 bg-neutral-300 rounded animate-pulse" />
      <div className="h-40 bg-neutral-200 rounded-2xl animate-pulse" />
    </main>
  );
}
