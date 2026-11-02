'use server';

import { createClient } from '@/lib/supabase/server';
import { toStudentCourse, type PublishedCourseRow } from '@/lib/student-course';
import type { Course, CourseSummary } from '@/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every published course, for the Courses screen (#14). Open to everyone, including
 * logged-out visitors (roles table: "Search published courses"). Row-level security
 * already hides drafts; we also ask for published courses explicitly, because
 * instructors can read their own drafts.
 */
export async function listPublishedCourses(): Promise<{ courses: CourseSummary[]; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('id, code, name, term, professor, assignments(count)')
    .eq('status', 'published')
    .eq('assignments.status', 'confirmed')
    .order('code', { ascending: true })
    .limit(200);

  if (error) return { courses: [], error: 'We couldn’t load courses right now. Refresh to try again.' };

  type Row = Omit<CourseSummary, 'assignmentCount'> & { assignments: { count: number }[] | null };
  return {
    courses: ((data ?? []) as Row[]).map(({ assignments, ...c }) => ({
      ...c,
      assignmentCount: assignments?.[0]?.count ?? 0,
    })),
  };
}

/** One published course with its confirmed assignments, or null if it isn't published (never drafts). */
export async function getPublishedCourse(courseId: string): Promise<{ course: Course | null; error?: string }> {
  if (typeof courseId !== 'string' || !UUID.test(courseId)) return { course: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(
      'id, code, name, term, professor, office_hours, overall_policy, assignments(id, title, due_at, due_text, ai_level, instructor_comment, syllabus_quote, position, status)'
    )
    .eq('id', courseId)
    .eq('status', 'published')
    .eq('assignments.status', 'confirmed')
    .maybeSingle();

  if (error) return { course: null, error: 'We couldn’t load this course. Try again.' };
  if (!data) return { course: null };
  return { course: toStudentCourse(data as unknown as PublishedCourseRow) };
}
