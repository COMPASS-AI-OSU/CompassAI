# CompassAI: our one-page plan

*BUSADM 2802 · Session 18 · Nov 18, 2026. Numbers are from our live database that morning; test rows are left out. A guess is marked as a guess.*

## 1. The problem, in their words

Ohio State students can't tell if AI is allowed on a given assignment: each instructor writes their own rule, and it often changes by assignment (one econ syllabus allows AI for studying and for notes on lecture videos, but not on any test or quiz). A wrong guess is a violation of course rules, and instructors must report every suspected case to COAM (Faculty Rule 3335-5-48.7). So students either skip AI that was allowed or risk a misconduct case. *Guess: we don't have a student saying this in their own words yet.*

## 2. Who it's for first, and who's next

First: undergraduates in the 4 courses whose instructors have published rules in Compass. Next: more courses in those same departments. The instructor sets it up (uploads and confirms the syllabus), students use it, and nobody pays yet. *Guess: a department pays.*

## 3. What we built, and why it's different

Compass reads a syllabus into an assignment-by-assignment table of AI rules that the instructor confirms. Students then ask about their exact use and get Allowed, Not allowed or Ask your instructor, with the syllabus line the answer is based on. Today they Ctrl+F the syllabus, email a TA, or ask ChatGPT, which answers from general knowledge, not from their syllabus.

## 4. Where AI does the work, and how we keep it honest

- **Where, and why AI:** reading a syllabus PDF into each assignment's AI rule (every syllabus is written differently, so fixed rules can't parse them), and answering a student's free-text question against one assignment's rule. Everything else is plain code. Details: [`docs/ai-syllabus-import.md`](docs/ai-syllabus-import.md), [`docs/ai-step.md`](docs/ai-step.md).
- **What it can get wrong:** saying Allowed when the syllabus doesn't allow it hurts most, because the student could end up in a COAM case. The import can also miss an assignment or set the wrong AI level.
- **How users can tell:** every Allowed or Not allowed answer shows the exact syllabus line, and code checks that line is really in the syllabus; if not, the answer becomes Ask your instructor, with who to ask. Instructors see the source sentence beside each imported assignment and must confirm every one before students see it.
- **How we check it:** 164 answers so far (43 Allowed, 54 Not allowed, 32 Ask your instructor, 35 off-topic); 6 of 6 answer test cases and 3 of 3 import test cases passed; instructors confirmed 50 of 57 AI drafts. Not counted yet: how many drafts instructors changed before confirming (#67).
- **What goes to the model:** from our server only, the syllabus PDF, or the student's question plus that one assignment's syllabus text, AI level and instructor comment. Never names, emails, student IDs, passwords, account IDs or other students' questions.

## 5. How it reaches them

Community-led. One channel first: r/OSU, with a tagged link (`?ref=reddit-osu`). Messages sent: 0; replies: 0 so far (post drafted, #59). One user brings the next: an instructor publishes a course and shares its code with the class, so each instructor brings a whole section of students.

## 6. How we'll know

**North Star:** students who got a Compass answer about their own assignment in the last 30 days.
**Objective:** get OSU students outside our team to check their AI rules in Compass before they use AI on an assignment.

| Step | Key result | Today | Dec 2 target |
| --- | --- | --- | --- |
| Top: who reaches us | Sign-ups that came through a tagged channel | 0 of 1 tracked sign-up (45 visitors since Nov 10, none tagged) | 5 |
| Middle: who gets through setup | Students who saved a course to My Courses | 1 of 5 student accounts | 6 |
| Bottom: North Star | Students who got a Compass answer about their own assignment, last 30 days | 2 of 5 student accounts (both on our team) | 8, at least 5 from outside our team |
| Buyers | An instructor outside our team publishes a course | 0 of 2 instructors (both ours) | 1 |

Headline experiment (#57): A 5 people, B 7 so far. We don't compare the versions until Mon, Nov 30.
