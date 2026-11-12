'use server';

import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getPublishedCourse } from '@/app/student-courses/actions';
import type { Course, HistoryGroup } from '@/types';

/** How many saved answers to load. Older ones stay in the database. */
const MAX_ROWS = 100;

/**
 * The student's saved Compass questions and answers, grouped by assignment, newest first (#22).
 *
 * Roles table: question history is "own only" for students; instructors and logged-out
 * visitors get nothing. Row-level security on `questions` also limits reads to the
 * student's own rows. Only answers about a course that is still published, with the
 * assignment still confirmed, are shown.
 */
export async function getQuestionHistory(): Promise<HistoryGroup[]> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('course_id, assignment_id, question, verdict, answer, quote, answered_at')
    .eq('owner_id', user.id)
    .in('verdict', ['allowed', 'not_allowed', 'ask_instructor'])
    .not('answered_at', 'is', null)
    .order('answered_at', { ascending: false })
    .limit(MAX_ROWS);

  if (error || !data) {
    if (error) console.error("Couldn't load question history:", error.message);
    return [];
  }

  const courses = new Map<string, Course | null>();
  const groups = new Map<string, HistoryGroup>();
  for (const row of data) {
    if (!courses.has(row.course_id)) {
      courses.set(row.course_id, (await getPublishedCourse(row.course_id)).course);
    }
    const course = courses.get(row.course_id);
    const assignment = course?.assignments.find((a) => a.id === row.assignment_id);
    if (!course || !assignment) continue;

    const key = `${course.id}:${assignment.id}`;
    let group = groups.get(key);
    if (!group) {
      // Rows come newest first, so groups are created in order of their newest answer.
      group = {
        courseId: course.id,
        courseCode: course.code,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        suggestedContact: `${course.professor} or your recitation TA`,
        items: [],
      };
      groups.set(key, group);
    }
    group.items.push({
      question: row.question,
      verdict: row.verdict,
      answer: row.answer ?? '',
      quote: row.quote ?? null,
      answeredAt: row.answered_at,
    });
  }
  return [...groups.values()];
}
