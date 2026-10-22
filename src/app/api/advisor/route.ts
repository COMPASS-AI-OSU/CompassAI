import type { Assignment, Course } from "@/types";
import { generatePolicyAdvice } from "@/utils/policyAdvisor";
import { getCurrentUser } from "@/lib/auth";

/**
 * Syllabus policy advisor endpoint used by the Compass chat screen.
 * For now it answers with the local rule-based policy engine only;
 * no AI model is connected yet.
 */
export async function POST(request: Request) {
  // Roles table: asking Compass needs sign-in.
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Sign in to ask Compass." }, { status: 401 });
  }

  const { question, course, assignment, studentName } = (await request.json()) as {
    question?: string;
    course?: Course;
    assignment?: Assignment;
    studentName?: string;
  };

  if (!question || !course || !assignment) {
    return Response.json(
      { error: "Missing required question, course, or assignment data" },
      { status: 400 }
    );
  }

  const advice = generatePolicyAdvice(question, course, assignment, studentName || "Student");

  return Response.json({
    answer: advice.policySummary,
    sourceReliedOn:
      advice.sourceReliedOn ||
      advice.instructorQuote ||
      assignment.syllabusClause ||
      course.overallPolicy,
    isSure:
      advice.isSure !== undefined
        ? advice.isSure
        : advice.verdictType !== "contact_instructor" && advice.verdictType !== "out_of_scope",
    sureReason:
      advice.sureReason ||
      (advice.verdictType === "contact_instructor"
        ? "The syllabus does not cover study coaching or tutoring"
        : "Grounded in course syllabus policy"),
    suggestedContact: advice.suggestedContact || `${course.professor} or your recitation TA`,
    verdictType: advice.verdictType,
    allowedUses: advice.allowedUses || [],
    prohibitedUses: advice.prohibitedUses || [],
  });
}
