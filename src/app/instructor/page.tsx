import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, BookOpen, CheckCircle2, ChevronRight, FileUp, PlusCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  InstructorHeader,
  NotAllowed,
  PageLoading,
  primaryButton,
  secondaryButton,
} from '@/components/instructor/InstructorChrome';

export const metadata: Metadata = { title: 'Instructor dashboard · CompassAI' };

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <Suspense fallback={<PageLoading label="Loading your dashboard…" />}>
        <InstructorContent />
      </Suspense>
    </div>
  );
}

async function InstructorContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/instructor');
  if (user.role !== 'instructor') return <NotAllowed email={user.email} reason="student" />;

  // Only this instructor's own courses (the database also limits drafts to their owner).
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, code, name, term, status, created_at, assignments(status)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <InstructorHeader email={user.email} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-neutral-950">Your courses</h1>
            <p className="text-sm text-neutral-700 mt-1">Only you can see and change the courses you create.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className={secondaryButton}>
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              See the student view
            </Link>
            <Link href="/instructor/courses/new" className={primaryButton}>
              <FileUp className="w-4 h-4" aria-hidden="true" />
              Add a course
            </Link>
          </div>
        </div>

        {error ? (
          <div role="alert" className="bg-white border-l-4 border-[#BA0C2F] rounded-xl p-4 text-sm text-neutral-900 flex gap-2">
            <AlertCircle className="w-4 h-4 text-[#BA0C2F] shrink-0 mt-0.5" aria-hidden="true" />
            We couldn’t load your courses. Refresh the page to try again.
          </div>
        ) : !courses?.length ? (
          <section
            aria-labelledby="empty-heading"
            className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-8 text-center space-y-3"
          >
            <PlusCircle className="w-10 h-10 text-[#BA0C2F] mx-auto" aria-hidden="true" />
            <h2 id="empty-heading" className="text-lg font-bold text-neutral-950">
              No courses yet
            </h2>
            <p className="text-sm text-neutral-700 max-w-md mx-auto">
              Upload your syllabus PDF and CompassAI fills in your course and every assignment for you to check.
            </p>
            <Link href="/instructor/courses/new" className={primaryButton}>
              Add your first course
            </Link>
          </section>
        ) : (
          <ul className="space-y-3">
            {courses.map((c) => {
              const total = c.assignments?.length ?? 0;
              const confirmed = c.assignments?.filter((a) => a.status === 'confirmed').length ?? 0;
              const allDone = total > 0 && confirmed === total;
              return (
                <li key={c.id}>
                  <Link
                    href={`/instructor/courses/${c.id}`}
                    className="flex items-center justify-between gap-4 bg-white border border-neutral-300 hover:border-[#BA0C2F] rounded-2xl p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-950">{c.code ?? 'Course code needed'}</span>
                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border border-neutral-400 text-neutral-800">
                          {c.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-700 truncate">
                        {c.name ?? 'Course name needed'} · {c.term ?? 'Term needed'}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                        {allDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                        )}
                        {total === 0 ? 'No assignments yet' : `${confirmed} of ${total} assignments confirmed`}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-500 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
