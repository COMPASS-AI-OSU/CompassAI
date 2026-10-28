'use server';

import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export interface MyCourse {
  id: string;
  code: string | null;
  name: string | null;
  term: string | null;
  professor: string | null;
}

export interface JoinState {
  error?: string;
  added?: string;
}

const MESSAGES: Record<string, string> = {
  not_found: 'We couldn’t find a course with that code. Check it with your instructor.',
  not_published: 'This course isn’t available yet. Your instructor hasn’t published it.',
  instructor: 'Instructors don’t have a My Courses list. Sign in with a student account to add courses.',
  signed_out: 'Sign in to add a course with a code.',
};

/** Roles table: Save to My Courses is students only, their own list only. The database checks again. */
export async function joinCourseByCode(_prev: JoinState | undefined, formData: FormData): Promise<JoinState> {
  const user = await getCurrentUser();
  if (!user) return { error: MESSAGES.signed_out };
  if (user.role === 'instructor') return { error: MESSAGES.instructor };

  const raw = formData.get('course_code');
  const code = typeof raw === 'string' ? raw.replace(/\s+/g, '').toUpperCase() : '';
  if (!code) return { error: 'Enter the course code your instructor gave you.' };
  if (code.length > 20 || !/^[A-Z0-9-]+$/.test(code)) return { error: MESSAGES.not_found };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('join_course_by_code', { input_code: code }).single<{
    course_id: string | null;
    result: string;
  }>();
  if (error || !data) return { error: 'We couldn’t add the course right now. Try again.' };

  if (data.result === 'added' || data.result === 'already_added') {
    const { data: course } = await supabase.from('courses').select('code, name').eq('id', data.course_id!).maybeSingle();
    const label = [course?.code, course?.name].filter(Boolean).join(' · ') || 'The course';
    return { added: data.result === 'added' ? `Added ${label} to My Courses.` : `${label} is already in My Courses.` };
  }
  return { error: MESSAGES[data.result] ?? 'We couldn’t add the course right now. Try again.' };
}

/** The signed-in student's saved courses that are still published. */
export async function listMyCourses(): Promise<{ courses: MyCourse[]; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role === 'instructor') return { courses: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('my_courses')
    .select('created_at, courses(id, code, name, term, professor, status)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return { courses: [], error: 'We couldn’t load My Courses. Refresh to try again.' };

  type Row = { courses: (MyCourse & { status: string }) | null };
  const courses = ((data ?? []) as unknown as Row[])
    .map((row) => row.courses)
    // An unpublished course disappears until it's published again (students never see drafts).
    .filter((c): c is MyCourse & { status: string } => Boolean(c && c.status === 'published'))
    .map(({ id, code, name, term, professor }) => ({ id, code, name, term, professor }));
  return { courses };
}

export async function removeMyCourse(courseId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: MESSAGES.signed_out };

  const supabase = await createClient();
  const { error } = await supabase.from('my_courses').delete().eq('student_id', user.id).eq('course_id', courseId);
  return error ? { error: 'We couldn’t remove the course. Try again.' } : {};
}
