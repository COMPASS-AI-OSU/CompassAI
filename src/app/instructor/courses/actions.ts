'use server';

import { refresh } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AI_LEVELS, type AiLevel } from '@/lib/ai-levels';
import { checkPublishable } from '@/lib/publish';

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
  saved?: string;
}

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === 'string' ? v.trim() : '';
}

function limit(value: string, max: number, label: string): string | undefined {
  return value.length > max ? `${label} can be at most ${max} characters.` : undefined;
}

/** Roles table: only instructors edit course rules. The database checks ownership again. */
async function requireInstructor() {
  const user = await getCurrentUser();
  if (!user) return { error: 'You’ve been signed out. Sign in again to save.' } as const;
  if (user.role !== 'instructor') return { error: 'Only instructors can change courses.' } as const;
  return { user } as const;
}

const NOT_YOURS = 'You can only change your own courses.';

// ---------- course details ----------

export async function updateCourse(courseId: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const code = text(formData, 'code');
  const name = text(formData, 'name');
  const term = text(formData, 'term');
  const officeHours = text(formData, 'office_hours');
  const policy = text(formData, 'overall_policy');

  const fieldErrors = {
    code: code ? limit(code, 20, 'Course code') : 'Enter the course code, like BUS-MHR 2292.',
    name: name ? limit(name, 200, 'Course name') : 'Enter the course name.',
    term: term ? limit(term, 40, 'Term') : 'Enter the term, like Autumn 2026.',
    office_hours: limit(officeHours, 500, 'Office hours'),
    overall_policy: limit(policy, 4000, 'AI policy'),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .update({
      code,
      name,
      term,
      office_hours: officeHours || null,
      overall_policy: policy || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select('id');

  if (error?.code === '23505') return { fieldErrors: { code: `You already have ${code} for ${term}.` } };
  if (error) return { error: 'We couldn’t save the course details. Try again.' };
  if (!data?.length) return { error: NOT_YOURS };

  refresh();
  return { saved: 'Course details saved.' };
}

// ---------- assignments ----------

function readAssignment(formData: FormData, confirming: boolean) {
  const title = text(formData, 'title');
  const dueAt = text(formData, 'due_at');
  const dueText = text(formData, 'due_text');
  const pointsRaw = text(formData, 'points');
  const aiLevel = text(formData, 'ai_level');
  const comment = text(formData, 'instructor_comment');

  const points = pointsRaw === '' ? null : Number(pointsRaw);
  const fieldErrors = {
    title: title ? limit(title, 200, 'Name') : 'Enter the assignment name.',
    due_at: dueAt && !/^\d{4}-\d{2}-\d{2}$/.test(dueAt) ? 'Pick a date, or leave it empty.' : undefined,
    due_text: limit(dueText, 200, 'Due date note'),
    points:
      points !== null && (!Number.isFinite(points) || points < 0 || points > 100000)
        ? 'Enter points as a number from 0 to 100,000, or leave it empty.'
        : undefined,
    ai_level:
      aiLevel && !AI_LEVELS.includes(aiLevel as AiLevel)
        ? 'Pick one of the AI levels.'
        : confirming && !aiLevel
          ? 'Pick an AI level before confirming.'
          : undefined,
    instructor_comment: limit(comment, 1000, 'Comment'),
  };

  return {
    fieldErrors,
    values: {
      title,
      due_at: dueAt || null,
      due_text: dueText || null,
      points,
      ai_level: (aiLevel || null) as AiLevel | null,
      instructor_comment: comment || null,
    },
  };
}

/** Saves an assignment's edits. The "confirm" button also marks it Confirmed; "save" leaves it Needs review. */
export async function saveAssignment(assignmentId: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const intent = text(formData, 'intent');
  const confirming = intent === 'confirm';
  const { fieldErrors, values } = readAssignment(formData, confirming);
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .update({
      ...values,
      status: confirming ? 'confirmed' : intent === 'unconfirm' ? 'needs_review' : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select('id');

  if (error) return { error: 'We couldn’t save this assignment. Try again.' };
  if (!data?.length) return { error: NOT_YOURS };

  refresh();
  return { saved: confirming ? 'Confirmed.' : intent === 'unconfirm' ? 'Marked as needs review.' : 'Saved.' };
}

export async function deleteAssignment(assignmentId: string): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from('assignments').delete().eq('id', assignmentId).select('id');
  if (error) return { error: 'We couldn’t delete this assignment. Try again.' };
  if (!data?.length) return { error: NOT_YOURS };

  refresh();
  return { saved: 'Deleted.' };
}

export async function addAssignment(courseId: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const { fieldErrors, values } = readAssignment(formData, false);
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors };

  const supabase = await createClient();
  const { count } = await supabase
    .from('assignments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId);

  // The database only allows this on the instructor's own course.
  const { error } = await supabase
    .from('assignments')
    .insert({ ...values, course_id: courseId, position: count ?? 0, status: 'needs_review' });
  if (error?.code === '42501') return { error: NOT_YOURS };
  if (error) return { error: 'We couldn’t add this assignment. Try again.' };

  refresh();
  return { saved: `Added “${values.title}”. Review and confirm it below.` };
}

// ---------- publish (issue #9) ----------

/** Draft → Published, so students can find the course in search. */
export async function publishCourse(courseId: string): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id, owner_id, code, name, term, status, assignments(status, ai_level)')
    .eq('id', courseId)
    .maybeSingle();
  if (!course || course.owner_id !== auth.user.id) return { error: NOT_YOURS };
  if (course.status === 'published') return { saved: 'Already published.' };

  const check = checkPublishable({ ...course, assignments: course.assignments ?? [] });
  if (!check.ready) return { error: check.problems.join(' ') };

  const { data, error } = await supabase
    .from('courses')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select('id');
  // The database trigger refuses a course that isn't ready (check_violation), e.g. if it changed in another tab.
  if (error?.code === '23514') return { error: error.message };
  if (error) return { error: 'We couldn’t publish the course. Try again.' };
  if (!data?.length) return { error: NOT_YOURS };

  refresh();
  return { saved: 'Published. Students can now find this course in search.' };
}

/** Published → Draft, which hides the course and its rules from students again. */
export async function unpublishCourse(courseId: string): Promise<ActionState> {
  const auth = await requireInstructor();
  if ('error' in auth) return { error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select('id');
  if (error) return { error: 'We couldn’t unpublish the course. Try again.' };
  if (!data?.length) return { error: NOT_YOURS };

  refresh();
  return { saved: 'Unpublished. Students can no longer see this course.' };
}
