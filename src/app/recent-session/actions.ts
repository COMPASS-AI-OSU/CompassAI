'use server';

import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getPublishedCourse } from '@/app/student-courses/actions';
import type { Course, RecentSession } from '@/types';

/** How many recent answers to look through for one whose course is still published. */
const LOOK_BACK = 10;

/**
 * The student's last answered Compass question, for the "Pick up where you left off" card (#23).
 *
 * Roles table: question history is "own only" for students, and instructors don't see it.
 * Row-level security on `questions` already limits this to the student's own rows.
 * Only answers about a course that is still published, with the assignment still confirmed,
 * are offered, so Resume never opens rules the instructor has taken down.
 */
export async function getRecentSession(): Promise<RecentSession | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('course_id, assignment_id, question, verdict, answer, quote, answered_at')
    .eq('owner_id', user.id)
    .in('verdict', ['allowed', 'not_allowed', 'ask_instructor'])
    .not('answered_at', 'is', null)
    .order('answered_at', { ascending: false })
    .limit(LOOK_BACK);

  if (error || !data) {
    if (error) console.error("Couldn't load the recent question:", error.message);
    return null;
  }

  const courses = new Map<string, Course | null>();
  for (const row of data) {
    if (!courses.has(row.course_id)) {
      courses.set(row.course_id, (await getPublishedCourse(row.course_id)).course);
    }
    const course = courses.get(row.course_id);
    const assignment = course?.assignments.find((a) => a.id === row.assignment_id);
    if (!course || !assignment) continue;

    return {
      courseId: course.id,
      courseCode: course.code,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      question: row.question,
      verdict: row.verdict,
      answer: row.answer ?? '',
      quote: row.quote ?? null,
      suggestedContact: `${course.professor} or your recitation TA`,
      answeredAt: row.answered_at,
    };
  }
  return null;
}
