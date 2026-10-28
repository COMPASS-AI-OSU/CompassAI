import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';

// The model our AI step spec names (docs/ai-step.md). Short replies keep each call cheap.
export const COMPASS_MODEL = 'claude-haiku-4-5';

export type CompassVerdict = 'allowed' | 'not_allowed' | 'ask_instructor' | 'off_topic';

// What Compass says to anything that isn't about this course's AI rules (issue #18).
export const OFF_TOPIC_ANSWER = 'I can only answer about this course’s AI policy.';

export interface CompassAnswer {
  verdict: CompassVerdict;
  answer: string;
  quote: string;
}

const AnswerSchema = z.object({
  verdict: z.enum(['allowed', 'not_allowed', 'ask_instructor', 'off_topic']),
  answer: z.string(),
  quote: z.string(),
  // What the quoted line itself says about this use. Checked against the verdict in plain code.
  quote_says: z.enum(['permits', 'forbids', 'neither']),
});

const SYSTEM_PROMPT = `You are Compass, a guide to one Ohio State course's rules on using AI for one assignment.

Answer the student's question using only the syllabus text you are given. Never use general knowledge, other courses, or what is common at other universities.

Return:
- verdict: "allowed" if the syllabus text clearly permits what the student describes, "not_allowed" if it clearly forbids it, or "ask_instructor" if the text does not clearly cover it. Use "off_topic" when the question is not about this course's rules for using AI or on this assignment at all (for example the weather, general trivia, homework answers, or requests to write something); then leave answer and quote empty and set quote_says to "neither".
- answer: one or two plain sentences for the student, starting with "Yes", "No", or "The syllabus doesn't say".
- quote: the one sentence from the syllabus text that your verdict relies on, copied exactly, character for character. For "ask_instructor", quote the closest line, or leave it empty if nothing is close.
- quote_says: what the quoted line itself says about the exact use the student describes: "permits" if the line allows that use, "forbids" if the line prohibits that use, "neither" if the line is about something else.

Choose "not_allowed" only when a line in the text itself forbids what the student describes. A line that permits some other use of AI does not forbid this one: if nothing forbids or permits it, choose "ask_instructor".

When the rules for the assignment and the course's general policy differ, follow the assignment's rules. When you are unsure, choose "ask_instructor". Never say "allowed" without a quote.`;

// Bump when SYSTEM_PROMPT or the model changes, so saved answers are made again instead of reused.
export const COMPASS_PROMPT_VERSION = '4';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  // One try, under 10 seconds, so the student never waits longer than issue #17 allows.
  client ??= new Anthropic({ timeout: 9_000, maxRetries: 0 });
  return client;
}

/** The syllabus text Compass may answer from, in the order the model should read it. */
export function buildSourceText(parts: {
  courseCode: string;
  assignmentTitle: string;
  overallPolicy: string;
  syllabusClause?: string;
  instructorComment: string;
}): string {
  return [
    `Course: ${parts.courseCode}`,
    `Assignment: ${parts.assignmentTitle}`,
    `Course AI policy: ${parts.overallPolicy}`,
    parts.syllabusClause ? `Assignment syllabus clause: ${parts.syllabusClause}` : null,
    `Instructor's rules for this assignment: ${parts.instructorComment}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Ignore quote marks, case and spacing, so a correct quote isn't rejected over punctuation. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"‘’'`…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Guardrails in plain code: an Allowed or Not allowed verdict must quote a line that really
 * appears in the syllabus text, and that line must itself permit (for Allowed) or forbid
 * (for Not allowed) the use. Otherwise Compass hands the student off instead.
 */
export function enforceQuote(
  result: CompassAnswer & { quote_says?: 'permits' | 'forbids' | 'neither' },
  sourceText: string
): CompassAnswer {
  const { verdict, answer, quote, quote_says } = result;
  // Off-topic: our own wording, never Claude's, and no syllabus quote (issue #18).
  if (verdict === 'off_topic') return { verdict, answer: OFF_TOPIC_ANSWER, quote: '' };
  if (verdict === 'ask_instructor') return { verdict, answer, quote };

  const quoteFound = normalize(quote).length >= 12 && normalize(sourceText).includes(normalize(quote));
  const quoteBacksVerdict =
    quote_says === undefined || quote_says === (verdict === 'allowed' ? 'permits' : 'forbids');
  if (quoteFound && quoteBacksVerdict) return { verdict, answer, quote };

  return {
    verdict: 'ask_instructor',
    answer: "The syllabus doesn't clearly answer this, so check with your instructor before you use AI this way.",
    quote: quoteFound ? quote : '',
  };
}

/** Ask Claude one question about one assignment. Throws when Claude can't answer. */
export async function askCompass(question: string, sourceText: string): Promise<CompassAnswer> {
  const response = await getClient().messages.parse({
    model: COMPASS_MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `<syllabus>\n${sourceText}\n</syllabus>\n\n<question>\n${question}\n</question>`,
      },
    ],
    output_config: { format: zodOutputFormat(AnswerSchema) },
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error(`Compass got no usable answer (stop reason: ${response.stop_reason})`);
  }

  return enforceQuote(response.parsed_output, sourceText);
}
