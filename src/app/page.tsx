import { Suspense } from 'react';
import CompassApp from '@/components/CompassApp';
import { getCurrentUser } from '@/lib/auth';
import { listPublishedCourses } from '@/app/student-courses/actions';

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const user = await getCurrentUser();
  // Every published course, so the Courses screen shows them without a spinner (#14).
  const { courses, error } = await listPublishedCourses();
  return <CompassApp user={user} initialCourses={courses} coursesError={error} />;
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
