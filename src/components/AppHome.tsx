import CompassApp from '@/components/CompassApp';
import { listPublishedCourses } from '@/app/student-courses/actions';
import { getRecentSession } from '@/app/recent-session/actions';
import type { SessionUser } from '@/types';

/**
 * The student app (Courses → Policy table → Compass). Loads every published course on the server
 * (#14), and a student's last answered question for "Pick up where you left off" (#23).
 */
export async function AppHome({ user }: { user: SessionUser | null }) {
  const [{ courses, error }, recentSession] = await Promise.all([
    listPublishedCourses(),
    user?.role === 'student' ? getRecentSession() : Promise.resolve(null),
  ]);
  return (
    <CompassApp user={user} initialCourses={courses} coursesError={error} initialRecentSession={recentSession} />
  );
}

export function AppLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
