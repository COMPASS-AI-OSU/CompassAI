import { Suspense } from 'react';
import CompassApp from '@/components/CompassApp';
import { getCurrentUser } from '@/lib/auth';
import { listPublishedCourses } from '@/app/student-courses/actions';
import { getRecentSession } from '@/app/recent-session/actions';

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const user = await getCurrentUser();
  // Every published course, so the Courses screen shows them without a spinner (#14),
  // and a student's last answered question for "Pick up where you left off" (#23).
  const [{ courses, error }, recentSession] = await Promise.all([
    listPublishedCourses(),
    user?.role === 'student' ? getRecentSession() : Promise.resolve(null),
  ]);
  return (
    <CompassApp user={user} initialCourses={courses} coursesError={error} initialRecentSession={recentSession} />
  );
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
