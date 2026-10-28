import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { InstructorHeader, NotAllowed, PageLoading } from '@/components/instructor/InstructorChrome';
import { CourseDetailsForm } from '@/components/instructor/CourseDetailsForm';
import { AssignmentCard, type AssignmentRow } from '@/components/instructor/AssignmentCard';
import { AddAssignmentForm } from '@/components/instructor/AddAssignmentForm';
import { FormAlert } from '@/components/auth/fields';
import { PublishPanel } from '@/components/instructor/PublishPanel';
import { checkPublishable } from '@/lib/publish';

export const metadata: Metadata = { title: 'Review course · CompassAI' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CourseReviewPage(props: PageProps<'/instructor/courses/[id]'>) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <Suspense fallback={<PageLoading label="Loading your course…" />}>
        <CourseReview {...props} />
      </Suspense>
    </div>
  );
}

async function CourseReview({ params, searchParams }: PageProps<'/instructor/courses/[id]'>) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=/instructor/courses/${encodeURIComponent(id)}`);
  if (user.role !== 'instructor') return <NotAllowed email={user.email} reason="student" />;
  if (!UUID.test(id)) {
    return (
      <>
        <InstructorHeader email={user.email} />
        <NotAllowed email={user.email} reason="missing" />
      </>
    );
  }

  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id, owner_id, code, name, term, office_hours, overall_policy, status')
    .eq('id', id)
    .maybeSingle();

  // Another instructor's published course is readable, but never editable here.
  if (!course || course.owner_id !== user.id) {
    return (
      <>
        <InstructorHeader email={user.email} />
        <NotAllowed email={user.email} reason={course ? 'not-yours' : 'missing'} />
      </>
    );
  }

  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('id, title, due_at, due_text, points, ai_level, instructor_comment, syllabus_quote, status')
    .eq('course_id', course.id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  const rows = (assignments ?? []) as AssignmentRow[];
  const confirmed = rows.filter((a) => a.status === 'confirmed').length;
  const publish = checkPublishable({ ...course, assignments: rows });
  const imported = (await searchParams).imported;

  return (
    <>
      <InstructorHeader email={user.email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-[#BA0C2F] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to your courses
        </Link>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-serif text-neutral-950">
            {course.code ?? 'New course'}
            {course.name ? `: ${course.name}` : ''}
          </h1>
          <p className="text-sm text-neutral-700">
            {course.term ?? 'Term needed'} · {course.status === 'published' ? 'Published · students can see this' : 'Draft · only you can see this'}
          </p>
        </div>

        {typeof imported === 'string' && (
          <FormAlert tone="success">
            We read your syllabus and found {imported === '1' ? '1 assignment' : `${imported} assignments`}. Check each one
            below. Nothing is visible to students until you confirm every assignment and publish.
          </FormAlert>
        )}

        <PublishPanel
          courseId={course.id}
          status={course.status === 'published' ? 'published' : 'draft'}
          problems={error ? ['We couldn’t load the assignments. Refresh the page.'] : publish.problems}
        />

        <CourseDetailsForm course={course} />

        <section aria-labelledby="assignments-heading" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="assignments-heading" className="text-xl font-bold text-neutral-950">
              Assignments
            </h2>
            {rows.length > 0 && (
              <p
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                  confirmed === rows.length ? 'text-emerald-800' : 'text-neutral-900'
                }`}
                aria-live="polite"
              >
                {confirmed === rows.length ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                )}
                {confirmed} of {rows.length} confirmed
              </p>
            )}
          </div>

          {error && <FormAlert tone="error">We couldn’t load the assignments. Refresh the page to try again.</FormAlert>}

          {!error && rows.length === 0 && (
            <div className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-6 text-sm text-neutral-800">
              No assignments yet. Your syllabus didn’t list any we could find, so add your first one below.
            </div>
          )}

          {rows.map((a, i) => (
            <AssignmentCard key={a.id} assignment={a} index={i} />
          ))}
        </section>

        <AddAssignmentForm courseId={course.id} />
      </main>
    </>
  );
}
