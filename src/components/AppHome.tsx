import CompassApp from '@/components/CompassApp';
import { listPublishedCourses } from '@/app/student-courses/actions';
import { getRecentSession } from '@/app/recent-session/actions';
import { getQuestionHistory } from '@/app/question-history/actions';
import type { SessionUser } from '@/types';

/**
 * The student app (Courses → Policy table → Compass). Loads every published course on the server
 * (#14), a student's last answered question for "Pick up where you left off" (#23), and their
 * saved questions and answers (#22).
 */
export async function AppHome({ user }: { user: SessionUser | null }) {
  const isStudent = user?.role === 'student';
  const [{ courses, error }, recentSession, history] = await Promise.all([
    listPublishedCourses(),
    isStudent ? getRecentSession() : Promise.resolve(null),
    isStudent ? getQuestionHistory() : Promise.resolve([]),
  ]);
  return (
    <CompassApp
      user={user}
      initialCourses={courses}
      coursesError={error}
      initialRecentSession={recentSession}
      initialHistory={history}
    />
  );
}

export function AppLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
