import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { COURSES } from "@/data/courses";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  askCompass,
  buildSourceText,
  COMPASS_MODEL,
  COMPASS_PROMPT_VERSION,
  type CompassVerdict,
} from "@/lib/compass-ai";

const MAX_QUESTION_LENGTH = 500;

/**
 * Ask Compass (issue #17). Saves the question to the student's account first, then answers
 * it with Claude from that assignment's syllabus text only, and saves the answer on the
 * same row. The same question about the same syllabus text reuses the saved answer.
 */
export async function POST(request: Request) {
  // Roles table: asking Compass needs sign-in.
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Sign in to ask Compass." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    courseId?: unknown;
    assignmentId?: unknown;
    question?: unknown;
  } | null;

  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ error: "Type a question first." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { error: `Keep your question under ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // The syllabus text comes from our own data, never from the browser.
  const course = COURSES.find((c) => c.id === body?.courseId);
  const assignment = course?.assignments.find((a) => a.id === body?.assignmentId);
  if (!course || !assignment) {
    return Response.json({ error: "We couldn't find that assignment." }, { status: 404 });
  }

  const sourceText = buildSourceText({
    courseCode: course.code,
    assignmentTitle: assignment.title,
    overallPolicy: course.overallPolicy,
    syllabusClause: assignment.syllabusClause,
    instructorComment: assignment.instructorComment,
  });
  // A new syllabus text, prompt or model means a new answer; anything else reuses the saved one.
  const sourceHash = createHash("sha256")
    .update(`${COMPASS_MODEL}\n${COMPASS_PROMPT_VERSION}\n${sourceText}`)
    .digest("hex");
  const questionKey = question.toLowerCase().replace(/\s+/g, " ");
  const suggestedContact = `${course.professor} or your recitation TA`;

  // Acts as the signed-in user, so row-level security limits every query to their own rows.
  const supabase = await createClient();

  const { data: saved, error: lookupError } = await supabase
    .from("questions")
    .select("verdict, answer, quote")
    .eq("owner_id", user.id)
    .eq("assignment_id", assignment.id)
    .eq("question_key", questionKey)
    .eq("source_hash", sourceHash)
    .not("verdict", "is", null)
    .order("answered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("Couldn't look up saved answers:", lookupError.message);
    return Response.json({ error: "Compass couldn't save your question. Try again." }, { status: 500 });
  }

  if (saved) {
    return Response.json({
      verdict: saved.verdict as CompassVerdict,
      answer: saved.answer,
      quote: saved.quote,
      suggestedContact,
      reused: true,
    });
  }

  // Save the question first, then run the AI step on it.
  const { data: row, error: insertError } = await supabase
    .from("questions")
    .insert({
      course_id: course.id,
      assignment_id: assignment.id,
      question,
      question_key: questionKey,
      source_hash: sourceHash,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    console.error("Couldn't save the question:", insertError?.message);
    return Response.json({ error: "Compass couldn't save your question. Try again." }, { status: 500 });
  }

  let result;
  try {
    result = await askCompass(question, sourceText);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
    } else {
      console.error("Claude didn't answer:", error);
    }
    return Response.json({ error: "Compass couldn't answer right now. Try again." }, { status: 503 });
  }

  // Students can't update questions rows (issue #29), so the server writes Compass's answer
  // with the secret key. It touches only the row this student just saved, and only if it
  // hasn't been answered yet.
  const { error: updateError } = await createAdminClient()
    .from("questions")
    .update({
      verdict: result.verdict,
      answer: result.answer,
      quote: result.quote,
      model: COMPASS_MODEL,
      answered_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("owner_id", user.id)
    .is("verdict", null);

  if (updateError) {
    // The student still gets the answer; it just won't be reused next time.
    console.error("Couldn't save the answer:", updateError.message);
  }

  return Response.json({ ...result, suggestedContact, reused: false });
}
