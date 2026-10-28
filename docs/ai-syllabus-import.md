# AI step: Import a course from a syllabus (#6, with #7 and #8)

> Written from issues #6–#8 and the sample BUS-MHR 2292 syllabus. Check it against our Foundations 1 spec and fix anything that differs.

## What it does

An instructor uploads their syllabus PDF. Compass reads it and fills in the course (code, name, term, professor, office hours, course-wide AI policy) and every graded assignment (name, due date, points, AI level, the instructor's comment, and the syllabus sentence the AI level came from). Everything is saved as a **Draft**, and every assignment starts as **Needs review**, so the instructor checks each one before students see anything.

| | |
| --- | --- |
| **Input** | One PDF, up to 10 MB, uploaded straight to the private `syllabi` storage bucket in the instructor's own folder. |
| **Output** | `is_syllabus`; `course` {code, name, term, professor, office_hours, overall_policy}; `assignments` [{title, due_date, due_text, points, ai_level, instructor_comment, syllabus_quote}]. AI level is one of Allowed, Allowed with disclosure, Partial, Prohibited, or empty when the syllabus doesn't say. |
| **Model** | Claude Haiku 5.5 (`claude-haiku-5-5`), effort `medium`, structured output checked against a Zod schema. Called only from server code (`/api/courses/import`). Haiku has no server-side refusal fallback, so a refusal shows the instructor a plain message. |
| **Trigger** | The "Upload and read syllabus" button, only for signed-in instructors. Never a page load. "Try again" reuses the uploaded PDF. |
| **Saved** | The course in `courses` and each assignment in `assignments`, both with the instructor's `owner_id`. The PDF stays in storage (`courses.syllabus_path`). |
| **Cost and time** | One call per upload: under 1 cent and 3–30 seconds for a normal syllabus. The route allows up to 300 seconds. |

## Guardrails

- **Only the syllabus.** The prompt says to use only the attached PDF and to leave a field empty rather than guess.
- **Prohibited only when written.** Claude picks Prohibited only when the syllabus itself forbids AI for that assignment.
- **Show the source.** Each assignment with an AI level carries the syllabus sentence it relied on, shown on the review card.
- **A person checks everything.** Nothing is published by this step. Each assignment must be confirmed by the instructor, and a confirmed assignment must have an AI level (enforced in the database).
- **Not a syllabus.** If the PDF isn't a syllabus, nothing is saved and the instructor is told.

## What plain code does instead of AI

Sign-in and role checks; checking the file is a PDF under 10 MB in the instructor's own folder; trimming and length-limiting every field; checking dates are real dates and points are 0–100,000; refusing a duplicate course code + term; saving rows; and every error message.

## Test cases

PDFs were made from our sample data (`src/data/courses.ts`). Expected results were written before running.

Run on 2026-10-27 from localhost, prompt version 2, `claude-haiku-5-5`. (Version 1 used `claude-opus-5-5`; it also passed all three, in 35 s for test 1.)

| # | PDF | Expected | Result | Pass? |
| --- | --- | --- | --- | --- |
| 1 | BUS-MHR 2292 sample syllabus (14 assignments) | Course BUS-MHR 2292, Business Skills & Environment, Autumn 2026, with office hours and the AI policy. All 14 assignments. Exam #1 and Exam #2 Prohibited, quoting "Zero AI…" lines. | All of it, in 23 s. 14 of 14 assignments with points (pulled out of the titles) and dates where the syllabus gave them. Both exams, the Syllabus Quiz and the in-person career appointment are Prohibited, each with a matching quote. | Y |
| 2 | STAT 1450 page with grading but no AI policy | Course found; 3 assignments with dates and points; AI level empty for all; no course AI policy. | Exactly that, in 2.7 s. | Y |
| 3 | A banana bread recipe | Not a syllabus: nothing saved, a clear message. | "This PDF doesn't look like a course syllabus." | Y |

**Worth a look on review:** in test 1, two assignments with no rule of their own (Weekly Top Hat, Leadership Assessment) came back with no AI level, though the prompt says to apply the course-wide policy; the instructor picks one before confirming. Opus 5.5 gave both Allowed. These are judgment calls, which is why every assignment needs the instructor's confirmation.

**Not yet checked:** a real scanned PDF (no text layer), a 10 MB PDF on the live site, and a syllabus over ~100 pages.

**Prompt version 3 (2026-10-28):** also extracts the professor's name for #11's course search. Re-ran test 1: "Prof. Ty Shepfer", all 14 assignments, 28 s.
