import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { extractSyllabus, MAX_SYLLABUS_BYTES, SyllabusImportError } from '@/lib/syllabus-import';

// Reading a long syllabus with Claude can take a minute or more.
export const maxDuration = 300;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ERRORS: Record<SyllabusImportError['kind'], { status: number; message: string }> = {
  not_syllabus: { status: 422, message: 'This PDF doesn’t look like a course syllabus. Your current syllabus is unchanged.' },
  unreadable: { status: 422, message: 'We couldn’t read this PDF. If it’s a scan or password-protected, export it again from Word or Canvas. Your current syllabus is unchanged.' },
  too_long: { status: 422, message: 'This syllabus has more assignments than we can read at once. Add new ones by hand below. Your current syllabus is unchanged.' },
  refused: { status: 422, message: 'We couldn’t read this file. Try a different PDF. Your current syllabus is unchanged.' },
  api_error: { status: 502, message: 'Reading the syllabus failed on our side. Your PDF is saved, so try again in a minute.' },
};

/** Titles match when they're the same words, ignoring case, spacing and punctuation. */
function titleKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Replaces a course's syllabus PDF with a new version (issue #7).
 * Body: { path: "<user id>/<uuid>.pdf" } in the syllabi bucket.
 *
 * The instructor's checked work is kept: existing assignments are never changed, and course
 * details are only filled in where they're blank. Assignments in the new syllabus that the
 * course doesn't have yet are added as "needs review", so students don't see them until the
 * instructor confirms them. The old PDF is deleted.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Roles table: editing rules / syllabus is instructors, own courses only.
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Sign in to update a syllabus.' }, { status: 401 });
  if (user.role !== 'instructor') {
    return Response.json({ error: 'Only instructors can update a syllabus.' }, { status: 403 });
  }

  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: 'We couldn’t find that course.' }, { status: 404 });

  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return Response.json({ error: 'Something went wrong. Upload the PDF again.' }, { status: 400 });
  }
  const ownPath = new RegExp(`^${user.id}/[0-9a-f-]{36}\\.pdf$`);
  if (typeof path !== 'string' || !ownPath.test(path)) {
    return Response.json({ error: 'That file isn’t yours. Upload the PDF again.' }, { status: 403 });
  }

  const supabase = await createClient();
  const discardUpload = () => supabase.storage.from('syllabi').remove([path as string]);

  const { data: course } = await supabase
    .from('courses')
    .select('id, owner_id, name, professor, office_hours, overall_policy, syllabus_path')
    .eq('id', id)
    .maybeSingle();
  if (!course || course.owner_id !== user.id) {
    await discardUpload();
    return Response.json({ error: 'You can only update the syllabus of your own courses.' }, { status: 403 });
  }

  // Storage rules only let instructors read their own folder.
  const { data: file, error: downloadError } = await supabase.storage.from('syllabi').download(path);
  if (downloadError || !file) {
    return Response.json({ error: 'We couldn’t find your uploaded PDF. Upload it again.' }, { status: 404 });
  }
  if (file.size > MAX_SYLLABUS_BYTES) {
    await discardUpload();
    return Response.json({ error: 'That PDF is over 10 MB. Export a smaller copy and try again.' }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    await discardUpload();
    return Response.json({ error: 'That file isn’t a PDF. Export your syllabus as a PDF and try again.' }, { status: 415 });
  }

  let result;
  try {
    result = await extractSyllabus(bytes);
  } catch (error) {
    if (error instanceof SyllabusImportError) {
      console.error('Syllabus replace failed:', error.kind, error.message);
      const { status, message } = ERRORS[error.kind];
      const retry = error.kind === 'api_error';
      // Keep the new PDF only when trying again could work. The old one is untouched either way.
      if (!retry) await discardUpload();
      return Response.json({ error: message, retry }, { status });
    }
    throw error;
  }

  const { data: existing, error: existingError } = await supabase
    .from('assignments')
    .select('title, position')
    .eq('course_id', course.id);
  if (existingError || !existing) {
    return Response.json({ error: 'We read your syllabus but couldn’t load your assignments. Try again.', retry: true }, { status: 500 });
  }

  // Keep everything the instructor already has; add only assignments the course doesn't have yet.
  const have = new Set(existing.map((a) => titleKey(a.title)));
  const seen = new Set<string>();
  const added = result.assignments.filter((a) => {
    const key = titleKey(a.title);
    if (!key || have.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const inNewSyllabus = new Set(result.assignments.map((a) => titleKey(a.title)));
  const notInNewSyllabus = existing.filter((a) => !inNewSyllabus.has(titleKey(a.title))).map((a) => a.title);

  if (added.length > 0) {
    const start = existing.reduce((max, a) => Math.max(max, a.position ?? 0), -1) + 1;
    const { error: insertError } = await supabase.from('assignments').insert(
      added.map((a, i) => ({ ...a, course_id: course.id, position: start + i, status: 'needs_review' }))
    );
    if (insertError) {
      console.error('Saving new assignments failed:', insertError);
      return Response.json({ error: 'We read your syllabus but couldn’t save the new assignments. Try again.', retry: true }, { status: 500 });
    }
  }

  // Point the course at the new PDF, and fill in only the details the instructor left blank.
  // Code and term are left alone: they identify the course and its course code for students.
  const blankFill: Record<string, string> = {};
  for (const field of ['name', 'professor', 'office_hours', 'overall_policy'] as const) {
    const value = result.course[field];
    if (!course[field] && value) blankFill[field] = value;
  }
  const { error: updateError } = await supabase
    .from('courses')
    .update({ ...blankFill, syllabus_path: path, imported_at: new Date().toISOString() })
    .eq('id', course.id);
  if (updateError) {
    console.error('Saving the new syllabus failed:', updateError);
    return Response.json({ error: 'We added the new assignments but couldn’t save the PDF. Try again.', retry: true }, { status: 500 });
  }

  // The old PDF is no longer used. Storage rules only allow deleting files in the user's own folder.
  if (course.syllabus_path && course.syllabus_path !== path && course.syllabus_path.startsWith(`${user.id}/`)) {
    await supabase.storage.from('syllabi').remove([course.syllabus_path]);
  }

  return Response.json({
    courseId: course.id,
    added: added.length,
    kept: existing.length,
    notInNewSyllabus: notInNewSyllabus.slice(0, 20),
  });
}
