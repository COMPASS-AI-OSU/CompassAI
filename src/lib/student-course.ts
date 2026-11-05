import type { AIPolicyStatus, Assignment, Course } from '@/types';
import { AI_LEVEL_LABELS, type AiLevel } from '@/lib/ai-levels';

/** A published course row with its confirmed assignments, as students may read them (#14). */
export interface PublishedCourseRow {
  id: string;
  code: string | null;
  name: string | null;
  term: string | null;
  professor: string | null;
  office_hours: string | null;
  overall_policy: string | null;
  assignments: {
    id: string;
    title: string;
    due_at: string | null;
    due_text: string | null;
    ai_level: AiLevel | null;
    instructor_comment: string | null;
    syllabus_quote: string | null;
    position: number;
  }[];
}

const STATUS: Record<AiLevel, AIPolicyStatus> = {
  allowed: 'allowed',
  allowed_with_disclosure: 'allowed_with_disclosure',
  partial: 'partial_allowed',
  prohibited: 'strictly_prohibited',
};

/** Shown when the instructor didn't add a course-wide policy. Never sent to Compass as syllabus text. */
export const NO_COURSE_POLICY =
  'Your instructor hasn’t added a course-wide AI policy. Check each assignment’s rule below.';

/** Sorts after every real date, so assignments with no due date are listed last. */
export const NO_DUE_DATE = Number.MAX_SAFE_INTEGER;

function formatDate(isoDate: string): string {
  // due_at is a plain date (YYYY-MM-DD); read it at noon UTC so it never shifts a day.
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** "11:59pm" → "11:59 PM", "7am" → "7 AM". */
function times(text: string): string[] {
  return [...text.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?(?![a-z])/gi)].map(
    (m) => `${Number(m[1])}${m[2] ? `:${m[2]}` : ''} ${m[3].toUpperCase()}M`
  );
}

/**
 * A short due date for tight spaces: the date from due_at ("Wed, Oct 22"), or the start of
 * the syllabus wording when there's no single date ("Friday of each week"), plus the time.
 */
export function compactDue(dueAt: string | null, dueText: string | null): { short: string; time?: string } {
  const text = (dueText ?? '').replace(/\s+/g, ' ').trim();
  const found = times(text);
  const time = found.length >= 2 ? `${found[0]} – ${found.at(-1)}` : found.length === 1 ? `by ${found[0]}` : undefined;
  if (dueAt) return { short: formatShortDate(dueAt), time };
  if (!text) return { short: 'No due date' };
  // Keep the words before the time ("Friday of each week by 11:59 PM EST" → "Friday of each week").
  const lead = text.split(/,?\s+(?:at|by|before|between|from|until|due)\s+(?=\d|noon|midnight)/i)[0].replace(/[,;:\s]+$/, '');
  const short = lead.length > 28 ? `${lead.slice(0, 27).trimEnd()}…` : lead;
  return { short: short.charAt(0).toUpperCase() + short.slice(1), time };
}

/** Three AI-use questions any assignment's rules can answer. No AI call needed. */
export function suggestedQuestions(title: string) {
  return [
    `Can I use AI to brainstorm ideas for ${title}?`,
    `Can I use AI to check my grammar and wording on ${title}?`,
    `Do I need to say I used AI on ${title}?`,
  ].map((question) => ({ label: question, question }));
}

/**
 * Turns a published course from the database into the shape the student screens use.
 * Every rule is the instructor's own words, never rewritten by Compass.
 */
export function toStudentCourse(row: PublishedCourseRow): Course {
  const assignments: Assignment[] = row.assignments
    .filter((a) => a.ai_level !== null)
    .map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.due_text ?? (a.due_at ? formatDate(a.due_at) : 'No due date'),
      dueDateTimestamp: a.due_at ? Date.parse(`${a.due_at}T12:00:00Z`) : NO_DUE_DATE,
      ...(() => {
        const c = compactDue(a.due_at, a.due_text);
        return { dueShort: c.short, dueTime: c.time };
      })(),
      aiStatus: STATUS[a.ai_level!],
      aiStatusLabel: AI_LEVEL_LABELS[a.ai_level!],
      instructorComment: a.instructor_comment ?? '',
      syllabusClause: a.syllabus_quote ?? undefined,
      quickPrompts: suggestedQuestions(a.title),
    }))
    .sort((x, y) => (x.dueDateTimestamp ?? NO_DUE_DATE) - (y.dueDateTimestamp ?? NO_DUE_DATE));

  return {
    id: row.id,
    code: row.code ?? 'Course',
    name: row.name ?? '',
    professor: row.professor ?? 'Your instructor',
    department: row.term ?? '',
    term: row.term ?? '',
    overallPolicy: row.overall_policy ?? NO_COURSE_POLICY,
    officeHours: row.office_hours ?? undefined,
    assignments,
  };
}
