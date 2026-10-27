import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { extractSyllabus, MAX_SYLLABUS_BYTES, SyllabusImportError } from '@/lib/syllabus-import';

// Reading a long syllabus with Claude can take a minute or more.
export const maxDuration = 300;

const ERRORS: Record<SyllabusImportError['kind'], { status: number; message: string }> = {
  not_syllabus: { status: 422, message: 'This PDF doesn’t look like a course syllabus. Check you picked the right file.' },
  unreadable: { status: 422, message: 'We couldn’t read this PDF. If it’s a scan or password-protected, export it again from Word or Canvas and try again.' },
  too_long: { status: 422, message: 'This syllabus has more assignments than we can read at once. Add the rest by hand on the next page.' },
  refused: { status: 422, message: 'We couldn’t read this file. Try a different PDF of your syllabus.' },
  api_error: { status: 502, message: 'Reading the syllabus failed on our side. Your PDF is saved, so try again in a minute.' },
};

/**
 * Reads an uploaded syllabus and saves it as a Draft course with assignments
 * that need review. Body: { path: "<user id>/<uuid>.pdf" } in the syllabi bucket.
 */
export async function POST(request: Request) {
  // Roles table: only instructors can create a course.
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Sign in to add a course.' }, { status: 401 });
  if (user.role !== 'instructor') {
    return Response.json({ error: 'Only instructors can add courses.' }, { status: 403 });
  }

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

  // Storage rules only let instructors read their own folder.
  const { data: file, error: downloadError } = await supabase.storage.from('syllabi').download(path);
  if (downloadError || !file) {
    return Response.json({ error: 'We couldn’t find your uploaded PDF. Upload it again.' }, { status: 404 });
  }
  if (file.size > MAX_SYLLABUS_BYTES) {
    return Response.json({ error: 'That PDF is over 10 MB. Export a smaller copy and try again.' }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    return Response.json({ error: 'That file isn’t a PDF. Export your syllabus as a PDF and try again.' }, { status: 415 });
  }

  let result;
  try {
    result = await extractSyllabus(bytes);
  } catch (error) {
    if (error instanceof SyllabusImportError) {
      console.error('Syllabus import failed:', error.kind, error.message);
      const { status, message } = ERRORS[error.kind];
      const retry = error.kind === 'api_error';
      // Keep the PDF only when trying again could work.
      if (!retry) await supabase.storage.from('syllabi').remove([path]);
      return Response.json({ error: message, retry }, { status });
    }
    throw error;
  }

  const { course, assignments } = result;

  // Course code + term must be unique for each instructor (issue #6).
  if (course.code && course.term) {
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('owner_id', user.id)
      .eq('code', course.code)
      .eq('term', course.term)
      .maybeSingle();
    if (existing) {
      await supabase.storage.from('syllabi').remove([path]);
      return Response.json(
        { error: `You already have ${course.code} for ${course.term}.`, courseId: existing.id },
        { status: 409 }
      );
    }
  }

  // owner_id defaults to the signed-in user's ID; the database checks the role again.
  const { data: created, error: courseError } = await supabase
    .from('courses')
    .insert({
      code: course.code,
      name: course.name,
      term: course.term,
      office_hours: course.office_hours,
      overall_policy: course.overall_policy,
      syllabus_path: path,
      imported_at: new Date().toISOString(),
      status: 'draft',
    })
    .select('id')
    .single();
  if (courseError || !created) {
    console.error('Saving imported course failed:', courseError);
    return Response.json({ error: 'We read your syllabus but couldn’t save the course. Try again.', retry: true }, { status: 500 });
  }

  if (assignments.length > 0) {
    const { error: assignmentsError } = await supabase.from('assignments').insert(
      assignments.map((a, position) => ({ ...a, course_id: created.id, position, status: 'needs_review' }))
    );
    if (assignmentsError) {
      console.error('Saving imported assignments failed:', assignmentsError);
      await supabase.from('courses').delete().eq('id', created.id);
      return Response.json({ error: 'We read your syllabus but couldn’t save the assignments. Try again.', retry: true }, { status: 500 });
    }
  }

  return Response.json({ courseId: created.id, assignments: assignments.length });
}
