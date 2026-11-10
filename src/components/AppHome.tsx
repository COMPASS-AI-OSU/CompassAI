import CompassApp from '@/components/CompassApp';
import { listPublishedCourses } from '@/app/student-courses/actions';
import type { SessionUser } from '@/types';

/** The student app (Courses → Policy table → Compass), with every published course loaded on the server (#14). */
export async function AppHome({ user }: { user: SessionUser | null }) {
  const { courses, error } = await listPublishedCourses();
  return <CompassApp user={user} initialCourses={courses} coursesError={error} />;
}

export function AppLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
