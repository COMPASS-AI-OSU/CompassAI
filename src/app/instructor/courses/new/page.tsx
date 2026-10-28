import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { InstructorHeader, NotAllowed, PageLoading } from '@/components/instructor/InstructorChrome';
import { SyllabusUpload } from '@/components/instructor/SyllabusUpload';

export const metadata: Metadata = { title: 'Add a course · CompassAI' };

export default function NewCoursePage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <Suspense fallback={<PageLoading label="Loading…" />}>
        <NewCourseContent />
      </Suspense>
    </div>
  );
}

async function NewCourseContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/instructor/courses/new');
  if (user.role !== 'instructor') return <NotAllowed email={user.email} reason="student" />;

  return (
    <>
      <InstructorHeader email={user.email} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-[#BA0C2F] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to your courses
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-serif text-neutral-950">Add a course</h1>
          <p className="text-sm text-neutral-700 mt-1 max-w-2xl">
            Upload your syllabus. CompassAI reads it and fills in the course and every assignment with its AI rule. You’ll
            check each assignment before students can see anything.
          </p>
        </div>
        <SyllabusUpload userId={user.id} />
      </main>
    </>
  );
}
