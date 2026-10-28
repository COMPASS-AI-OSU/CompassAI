import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import * as z from 'zod/v4';
import { AI_LEVELS, type AiLevel } from '@/lib/ai-levels';

// See docs/ai-syllabus-import.md for what this step does and its test cases.
export const IMPORT_MODEL = 'claude-haiku-5-5';
// Bump when the prompt, schema or model changes.
export const IMPORT_PROMPT_VERSION = '3';

export const MAX_SYLLABUS_BYTES = 10 * 1024 * 1024; // issue #7: up to 10 MB

const AssignmentSchema = z.object({
  title: z.string().describe('Assignment name exactly as the syllabus writes it.'),
  due_date: z
    .string()
    .nullable()
    .describe('Due date as YYYY-MM-DD, only if the syllabus gives a full date (use the course term to fill in the year). Otherwise null.'),
  due_text: z.string().nullable().describe('The due date or deadline exactly as written in the syllabus, or null.'),
  points: z.number().nullable().describe('Points the assignment is worth, or null if not stated.'),
  ai_level: z
    .enum(AI_LEVELS)
    .nullable()
    .describe('The AI rule for this assignment, or null if the syllabus does not say.'),
  instructor_comment: z
    .string()
    .nullable()
    .describe("The instructor's own words about AI use on this assignment, copied or closely condensed. Null if none."),
  syllabus_quote: z
    .string()
    .nullable()
    .describe('The one sentence from the syllabus the ai_level relies on, copied exactly. Null if ai_level is null.'),
});

const SyllabusSchema = z.object({
  is_syllabus: z.boolean().describe('False if this document is not a course syllabus.'),
  course: z.object({
    code: z.string().nullable().describe('Course code such as "BUS-MHR 2292", or null.'),
    name: z.string().nullable().describe('Course title, or null.'),
    term: z.string().nullable().describe('Term such as "Autumn 2026", or null.'),
    professor: z
      .string()
      .nullable()
      .describe('The instructor\'s name as the syllabus writes it, such as "Prof. Ty Shepfer", or null.'),
    office_hours: z.string().nullable().describe('Office hours as written, or null.'),
    overall_policy: z
      .string()
      .nullable()
      .describe("The course-wide policy on using AI, copied or closely condensed from the syllabus. Null if there isn't one."),
  }),
  assignments: z.array(AssignmentSchema).describe('Every graded assignment, quiz, exam or project, in due-date order.'),
});

export type ExtractedSyllabus = z.infer<typeof SyllabusSchema>;
export type ExtractedAssignment = z.infer<typeof AssignmentSchema>;

const SYSTEM_PROMPT = `You read one Ohio State course syllabus and fill in a form so the instructor can review it in CompassAI.

Use only the attached syllabus. Never use general knowledge, other courses, or what is common at other universities.

For each graded assignment, quiz, exam, or project, pick the AI rule the syllabus gives it:
- "allowed": AI use is permitted without conditions.
- "allowed_with_disclosure": AI use is permitted if the student discloses or cites it.
- "partial": AI is permitted for some parts or uses and forbidden for others.
- "prohibited": the syllabus forbids AI use for this assignment.
If the syllabus does not say, use null. Choose "prohibited" only when the syllabus itself forbids AI for that assignment. When an assignment's own rule differs from the course-wide policy, use the assignment's rule; when an assignment has no rule of its own, apply the course-wide policy.

Leave a field null rather than guessing. Copy syllabus_quote exactly, character for character. The instructor will check every assignment before students see it.

If the document is not a course syllabus, set is_syllabus to false and return no assignments.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  // One long try: a syllabus can take a minute or more to read.
  client ??= new Anthropic({ timeout: 240_000, maxRetries: 1 });
  return client;
}

export class SyllabusImportError extends Error {
  constructor(
    public readonly kind: 'not_syllabus' | 'refused' | 'unreadable' | 'too_long' | 'api_error',
    message: string
  ) {
    super(message);
  }
}

/** Plain-code guardrails: trim, cap lengths, and drop values the database would reject. */
function clean(text: string | null | undefined, max: number): string | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, max) : null;
}

function cleanDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : value;
}

export interface ImportResult {
  course: {
    code: string | null;
    name: string | null;
    term: string | null;
    professor: string | null;
    office_hours: string | null;
    overall_policy: string | null;
  };
  assignments: {
    title: string;
    due_at: string | null;
    due_text: string | null;
    points: number | null;
    ai_level: AiLevel | null;
    instructor_comment: string | null;
    syllabus_quote: string | null;
  }[];
  model: string;
}

/** Reads a syllabus PDF with Claude and returns cleaned course and assignment fields. */
export async function extractSyllabus(pdf: Uint8Array): Promise<ImportResult> {
  const data = Buffer.from(pdf).toString('base64');

  let response;
  try {
    response = await getClient().beta.messages.parse({
      model: IMPORT_MODEL,
      max_tokens: 16000,
      // Haiku has no server-side refusal fallback; a refusal shows the instructor a plain message instead.
      system: SYSTEM_PROMPT,
      output_config: { effort: 'medium', format: betaZodOutputFormat(SyllabusSchema) },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
            { type: 'text', text: 'Fill in the form from this syllabus.' },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      // Usually a PDF Claude can't open (encrypted, damaged, or too many pages).
      throw new SyllabusImportError('unreadable', error.message);
    }
    if (error instanceof Anthropic.APIError) {
      throw new SyllabusImportError('api_error', `${error.status ?? ''} ${error.message}`.trim());
    }
    throw new SyllabusImportError('api_error', error instanceof Error ? error.message : String(error));
  }

  if (response.stop_reason === 'refusal') {
    throw new SyllabusImportError('refused', response.stop_details?.explanation ?? 'Claude declined to read this file.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new SyllabusImportError('too_long', 'The syllabus has more assignments than we can read at once.');
  }
  const parsed = response.parsed_output;
  if (!parsed) {
    throw new SyllabusImportError('api_error', 'Claude did not return the form.');
  }
  if (!parsed.is_syllabus) {
    throw new SyllabusImportError('not_syllabus', 'This file does not look like a course syllabus.');
  }

  const assignments = parsed.assignments
    .map((a) => ({
      title: clean(a.title, 200) ?? '',
      due_at: cleanDate(a.due_date),
      due_text: clean(a.due_text, 200),
      points: a.points !== null && a.points >= 0 && a.points <= 100000 ? Math.round(a.points * 100) / 100 : null,
      ai_level: a.ai_level,
      instructor_comment: clean(a.instructor_comment, 1000),
      syllabus_quote: a.ai_level ? clean(a.syllabus_quote, 1000) : null,
    }))
    .filter((a) => a.title)
    .slice(0, 200);

  return {
    course: {
      code: clean(parsed.course.code, 20),
      name: clean(parsed.course.name, 200),
      term: clean(parsed.course.term, 40),
      professor: clean(parsed.course.professor, 200),
      office_hours: clean(parsed.course.office_hours, 500),
      overall_policy: clean(parsed.course.overall_policy, 4000),
    },
    assignments,
    model: response.model,
  };
}
