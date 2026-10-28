/** Publish rules (issue #9). The database trigger in 20261028170000_publish_rules.sql enforces the same ones. */

export interface PublishCheck {
  ready: boolean;
  problems: string[];
}

/** What still stops a course from being published. The database enforces the same rules. */
export function checkPublishable(course: {
  code: string | null;
  name: string | null;
  term: string | null;
  assignments: { status: string; ai_level: string | null }[];
}): PublishCheck {
  const problems: string[] = [];
  const missing = [!course.code && 'course code', !course.name && 'course name', !course.term && 'term'].filter(Boolean);
  if (missing.length) problems.push(`Add the ${missing.join(', ')} in Course details.`);
  if (course.assignments.length === 0) problems.push('Add at least one assignment.');
  const unconfirmed = course.assignments.filter((a) => a.status !== 'confirmed' || !a.ai_level).length;
  if (unconfirmed) {
    problems.push(`Confirm ${unconfirmed === 1 ? 'the last assignment' : `${unconfirmed} more assignments`}.`);
  }
  return { ready: problems.length === 0, problems };
}
