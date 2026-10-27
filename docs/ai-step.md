# AI step: Ask Compass (#17)

> Draft written from our issues and the sample syllabus data. Check it against our Foundations 1 spec and fix anything that differs.

## What it does

A signed-in student asks whether they can use AI in a certain way on one assignment. Compass answers from that assignment's syllabus text only, with one verdict, a short answer, and the exact syllabus line it relied on.

| | |
| --- | --- |
| **Input** | The student's question (up to 500 characters) and one assignment: the course's AI policy, the assignment's syllabus clause, and the instructor's comment. |
| **Output** | `verdict`: Allowed, Not allowed, or Ask your instructor. `answer`: one or two sentences. `quote`: the exact syllabus line relied on. |
| **Model** | Claude Haiku 4.5 (`claude-haiku-4-5`), called only from server code (`/api/advisor`), with short replies (`max_tokens` 400). |
| **Trigger** | The Ask button or a quick-question card, only when signed in. Never a page load. |
| **Saved** | Each question is saved to the `questions` table with the student's ID *before* the model is called. The answer is saved in the same row. |
| **Reused** | Asking the same question about the same assignment again returns the saved answer with no model call. A new answer is made only when the question or the syllabus text changes. |

## Guardrails

- **Cite the source.** Every Allowed or Not allowed answer quotes a syllabus line. Plain code checks that the quote really appears in the syllabus text; if it doesn't, the verdict becomes Ask your instructor.
- **Say when unsure.** When the syllabus text doesn't cover the question, the verdict is Ask your instructor.
- **Hand off to a person.** Ask your instructor names who to contact: the professor or the recitation TA.
- **Only the syllabus.** Compass never answers from general knowledge or outside the given text. Off-topic questions are #18.

## What plain code does instead of AI

Sign-in and role checks, finding the course and assignment, building the syllabus text, checking the quote, looking up saved answers, and the card's colors and labels.

## Test cases

Course: BUS-MHR 2292 (sample data in `src/data/courses.ts`). Write the expected answer before running each one.

Run on 2026-10-27, signed in as a student on localhost, prompt version 3, `claude-haiku-4-5`. Each answer took 2–6 seconds (limit: 10).

| # | Assignment | Question | Expected | Claude's answer | Pass? |
| --- | --- | --- | --- | --- | --- |
| 1 | Syllabus Quiz | Can I paste the quiz questions into ChatGPT to get the answers? | Not allowed — "AI bots taking the quiz for you is strictly prohibited." | Not allowed — quoted "AI bots taking the quiz for you is strictly prohibited." | Y |
| 2 | Crisis Case | Can we use Claude to map how stakeholders might react? | Allowed — "AI tools welcomed as aids for exploring scenario dynamics, PR communication angles, and stakeholder matrices." | Allowed — quoted the same line | Y |
| 3 | Crisis Case | Can AI deliver our live presentation and answer the Q&A for us? | Not allowed — "Live presentation delivery and Q&A defense must be student-executed." | Not allowed — quoted the same line (the old keyword rules said Allowed) | Y |
| 4 | Exam #1 | Can I use an AI app on my phone during the exam? | Not allowed — "Zero AI or electronic devices permitted." | Not allowed — quoted the same line | Y |
| 5 | Resume Draft | Can AI suggest stronger action verbs for my resume? | Allowed — "AI allowed for action verb suggestions and formatting." | Allowed — quoted the same line | Y |
| Edge | LinkedIn Profile | Can I use AI to grade my teammate's LinkedIn profile? | Ask your instructor — the syllabus doesn't cover grading someone else's work. | Ask your instructor — closest line "AI permitted for headline and summary bio suggestions." | Y |

**What we fixed to pass the edge case:** on the first two runs, Claude answered Not allowed, reading "AI permitted for headline and summary bio suggestions" as "only those." A prompt instruction alone didn't fix it. Now Claude also says whether its quoted line *permits* or *forbids* the use, and plain code turns any verdict that its own quote doesn't back into Ask your instructor.

**Other checks (same day):**
- Logged out, `/api/advisor` returns 401 "Sign in to ask Compass."
- Asking test 3 again (different capitals and spacing) returned the saved answer in 0.5 s, with no new row and no model call.
- Logged out, the database returns no `questions` rows and refuses inserts (row-level security).
- Every saved row has the student's `owner_id`, the question, the answer and the model.
- Not yet checked: a second student account can't see the first one's rows (needs a second account), and the Claude Console request count.
