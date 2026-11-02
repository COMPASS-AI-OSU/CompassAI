import { Course, StudentProfile, RecentSession } from '../types';

export const STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 's1',
    name: 'Dylan Edwards',
    email: 'edwards.3401@osu.edu',
    major: 'Finance & Business Administration',
    year: 'Sophomore',
  },
  {
    id: 's2',
    name: 'Alex Miller',
    email: 'miller.4192@osu.edu',
    major: 'Operations Management',
    year: 'Sophomore',
  },
  {
    id: 's3',
    name: 'Carmen Buckeye',
    email: 'buckeye.1870@osu.edu',
    major: 'Marketing & Strategic Communication',
    year: 'Junior',
  },
];

export const INITIAL_RECENT_SESSION: RecentSession = {
  courseId: 'busmhr-2292',
  assignmentId: 'busmhr-crisis',
  lastActive: '5 mins ago',
  questionSnippet: 'Can our team use AI to brainstorm crisis communication strategies for the simulation?',
};

export const COURSES: Course[] = [
  {
    id: 'busmhr-2292',
    code: 'BUS-MHR 2292',
    name: 'Business Skills & Environment',
    professor: 'Prof. Ty Shepfer',
    department: 'Fisher College of Business',
    term: 'Autumn 2026',
    overallPolicy: 'Fisher College of Business Syllabus Policy (Prof. Ty Shepfer): “Artificial intelligence is a powerful tool that will play an invaluable role in our future. In this course, we will use AI tools as aids to enhance our learning experience. Building skills to understand and harness the power of AI tools will be a critical component to your success in the business world in the future. While these tools are at our disposal, it is paramount that their utilization remains prudent and aligned with the academic integrity of the course. Employing these tools as supplementary resources to foster deeper understanding and innovation within the subject matter is expected... Any suspected unauthorized misconduct must be reported to COAM (Section 3335-23-04).” Office Hours: Tuesdays 6:30–7:30 AM at Buckeye Donuts | Wednesdays 2:05–3:00 PM in Fisher Hall 352 (shepfer.2@osu.edu).',
    assignments: [
      {
        id: 'busmhr-quiz',
        title: 'Syllabus Quiz (5 pts)',
        dueDate: 'Aug 28, 2026 · 5:00 PM',
        dueDateTimestamp: 1787875200000, // Aug 28
        aiStatus: 'study_prep_only',
        aiStatusLabel: 'Open Note / Individual Completion',
        instructorComment: 'Open notes and taken virtually through Canvas. Designed to ensure students have read the syllabus. AI bots taking the quiz for you is strictly prohibited.',
        syllabusClause: 'Syllabus Page 9: “This quiz is open notes and will be taken virtually through Canvas. It is designed to ensure students have read the syllabus.”',
        quickPrompts: [
          {
            label: 'Can I have an AI answer syllabus quiz questions for me?',
            question: 'Can I paste the syllabus quiz questions into ChatGPT to generate the answers for me?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. You must read the syllabus and complete the quiz questions yourself. Having an AI bot take quizzes on CarmenCanvas violates Ohio State University academic integrity rules.',
              allowedUses: [
                'Reading the course syllabus document directly in Carmen',
                'Searching the syllabus PDF with Ctrl+F for specific policy sections'
              ],
              prohibitedUses: [
                'Pasting quiz questions into AI tools or bots to auto-generate answers',
                'Sharing quiz answers with other students'
              ],
              instructorQuote: '“This quiz is open notes and designed to ensure students have read the syllabus.”',
            }
          },
          {
            label: 'Can AI quiz me on the syllabus first?',
            question: 'Can I use AI to quiz me on the syllabus before I take the Syllabus Quiz myself?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. The course encourages AI as a supplementary study aid; only having AI take the quiz for you is prohibited.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Open notes and taken virtually through Canvas. Designed to ensure students have read the syllabus. AI bots taking the quiz for you is strictly prohibited.”',
            }
          },
          {
            label: 'What happens if I miss the 5:00 PM deadline on Friday?',
            question: 'Is there a grace period for the syllabus quiz due at 5:00 PM on Friday, August 28?',
            response: {
              verdict: 'Strict Course Late Policy',
              verdictType: 'caution',
              policySummary: 'Per course policy, late submissions receive a 50% deduction immediately; work not submitted within 24 hours receives a zero.',
              allowedUses: [
                'Submitting early on Friday to avoid technical glitches'
              ],
              prohibitedUses: [
                'Requesting informal deadline extensions'
              ],
              instructorQuote: '“Any assignment that is turned in late (including one minute late) will receive a 50% deduction.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-tophat',
        title: 'Weekly Top Hat Questions (22 pts total)',
        dueDate: 'Weekly on Wednesdays · Prior to Recitation',
        dueDateTimestamp: 1788220800000, // Starts Sep 02
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Study Aid (Independent Completion)',
        instructorComment: 'Embedded chapter reading questions. Must be completed prior to your recitation the following week. 2 points per chapter (22 points total). You may miss one week without penalty.',
        syllabusClause: 'Syllabus Page 10: “Each chapter’s questions will count for 2 points towards your final grade for a total of 22 points, giving you flexibility to miss one week of questions.”',
        quickPrompts: [
          {
            label: 'Can I use an AI bot to auto-answer Top Hat questions?',
            question: 'Can I use an automated browser extension or ChatGPT to solve my weekly Top Hat questions?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Using automated bots or AI solvers to answer Top Hat questions is strictly prohibited and constitutes academic misconduct under OSU Rule 3335-23-04.',
              allowedUses: [
                'Reading the digital interactive textbook on tophat.com',
                'Asking AI to explain challenging business definitions from the chapters for study comprehension'
              ],
              prohibitedUses: [
                'Using AI tools or browser scripts to answer Top Hat questions',
                'Sharing Top Hat question solutions in GroupMe or Discord'
              ],
              instructorQuote: '“Top Hat questions must correspond to lecture material and be completed prior to your recitation.”',
            }
          },
          {
            label: 'Can I make up missed Top Hat questions for half credit?',
            question: 'Can I submit missed Top Hat questions late for 50% credit like other assignments?',
            response: {
              verdict: 'NOT ALLOWED — No Late Top Hat Credit',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The syllabus explicitly states: “Note: Top Hat questions are not eligible for half credit.” However, you have the flexibility to miss one week without impacting your score.',
              allowedUses: [
                'Utilizing your one free dropped week of Top Hat questions if sick'
              ],
              prohibitedUses: [
                'Requesting late make-up submissions for Top Hat questions'
              ],
              instructorQuote: '“Top Hat questions are not eligible for half credit.”',
            }
          },
          {
            label: 'Can AI summarize the chapter for Top Hat?',
            question: 'Can I use AI to summarize the chapter before I answer the Top Hat questions myself?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus doesn’t say whether AI can be used for Top Hat reading questions. Check with your instructor.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Embedded chapter reading questions. Must be completed prior to your recitation the following week. 2 points per chapter (22 points total). You may miss one week without penalty.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-oral',
        title: 'Individual Oral Presentation (30 pts)',
        dueDate: 'Sep 02 / Sep 09, 2026 · In Recitation',
        dueDateTimestamp: 1788307200000, // Sep 02
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Timing & Outline Prep Only)',
        instructorComment: '2-minute presentation on your post-college plans (target company, graduate degree, or startup). AI permitted for timing and speech outlines. Reading an AI script verbatim is strictly prohibited.',
        syllabusClause: 'Syllabus Page 10: “You will be responsible for developing a 2-minute presentation pertaining to that organization.”',
        quickPrompts: [
          {
            label: 'Can an AI write my 2-minute speech script for me?',
            question: 'Can I have ChatGPT write my entire 2-minute speech script so I can read it during recitation?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Having an AI generate your speech script to read verbatim is strictly prohibited. The learning objective of this assessment is developing your authentic personal communication voice.',
              allowedUses: [
                'Asking AI to help structure an outline (Hook, Company Mission, Personal Value, Conclusion)',
                'Using a timer or speech pacing feedback to keep your talk under 2 minutes'
              ],
              prohibitedUses: [
                'Reading an AI-generated speech word-for-word in recitation',
                'Presenting insincere or fabricated career ambitions'
              ],
              instructorQuote: '“Speaking in front of a classroom of peers or a boardroom of business executives can be difficult and uncomfortable, however, with practice, nervous tendencies will lessen.”',
            }
          },
          {
            label: 'What happens if my presentation exceeds 2 minutes?',
            question: 'Will my recitation leader penalize me if I speak for longer than 2 minutes?',
            response: {
              verdict: 'Strict 2-Minute Constraint',
              verdictType: 'caution',
              policySummary: 'Yes. Executive conciseness is a core graded component. Recitation leaders will cut you off when you hit the 2-minute mark.',
              allowedUses: [
                'Practicing with a stopwatch to keep your delivery between 1:45 and 2:00 minutes'
              ],
              prohibitedUses: [
                'Exceeding the allotted time window'
              ],
              instructorQuote: '“You will be responsible for developing a 2-minute presentation.”',
            }
          },
          {
            label: 'Can AI help outline and time my speech?',
            question: 'Can AI help me outline my 2-minute speech and check its timing?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI is permitted for timing and speech outlines, as long as you don’t read an AI script word for word.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“2-minute presentation on your post-college plans (target company, graduate degree, or startup). AI permitted for timing and speech outlines. Reading an AI script verbatim is strictly prohibited.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-ethics',
        title: 'Team Grade: Ethics Presentation & Handout (40 pts)',
        dueDate: 'Sep 23, 2026 · Prior to Recitation',
        dueDateTimestamp: 1790121600000, // Sep 23
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Frameworks & Research Only)',
        instructorComment: 'Pre-assigned group researches and orally presents an example of ethical leadership or failure. Each team member must present. AI permitted for brainstorming case examples; handout and speech must be student-crafted.',
        syllabusClause: 'Syllabus Page 11: “Your pre-assigned group will select, research, and orally present an example of ethical leadership and decision making or the failure of such.”',
        quickPrompts: [
          {
            label: 'Can AI write our team’s one-page handout for the class?',
            question: 'Can our group prompt Claude or ChatGPT to write the complete one-page executive handout for our presentation?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Generating your team’s graded handout using AI is strictly prohibited. Your team must synthesize the ethical case takeaways, decision framework, and discussion questions yourselves.',
              allowedUses: [
                'Researching corporate ethical failure case examples across industries',
                'Reviewing ethical decision frameworks (e.g. Utilitarian, Deontological, Virtue Ethics) covered in Top Hat Chapter 10',
                'Using document design tools for clean executive layout'
              ],
              prohibitedUses: [
                'Generating the entire handout content with generative AI',
                'Having an AI write your team’s oral speaking scripts'
              ],
              instructorQuote: '“Each team member will be required to present. A more detailed scoring rubric with expectations will be provided during recitation.”',
              citationTip: 'Include a brief research footnote on your handout citing sources consulted.'
            }
          },
          {
            label: 'Does every team member have to speak during the presentation?',
            question: 'Can two team members present while the other two handle the handout?',
            response: {
              verdict: 'NOT ALLOWED — All Members Must Present',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The syllabus explicitly mandates: “Each team member will be required to present.” Individual speaking grades are assessed for every member.',
              allowedUses: [
                'Distributing speaking roles so every team member speaks during the presentation'
              ],
              prohibitedUses: [
                'Having silent or non-presenting team members during the oral presentation'
              ],
              instructorQuote: '“Each team member will be required to present.”',
            }
          },
          {
            label: 'Can AI help us brainstorm case examples?',
            question: 'Can our group use AI to brainstorm examples of ethical leadership for our case?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI is permitted for brainstorming case examples; the handout and speech must be your own.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Pre-assigned group researches and orally presents an example of ethical leadership or failure. Each team member must present. AI permitted for brainstorming case examples; handout and speech must be student-crafted.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-resume',
        title: 'Resume Draft Completion & Big Interview (2 pts)',
        dueDate: 'Sep 30, 2026 · Prior to Recitation',
        dueDateTimestamp: 1790726400000, // Sep 30
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed (Action Verbs & Polish)',
        instructorComment: 'Turn in first and second drafts electronically via Canvas and have it evaluated by Big Interview software. AI allowed for action verb suggestions and formatting.',
        syllabusClause: 'Syllabus Page 10: “Turn in a first and second draft of your resume electronically via Canvas and have it evaluated by a software called Big Interview.”',
        quickPrompts: [
          {
            label: 'Can I fabricate resume job achievements with AI?',
            question: 'Can I use an AI to invent bullet points and metrics for internships or jobs I did not have?',
            response: {
              verdict: 'NOT ALLOWED — Academic & Professional Misconduct',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Fabricating experiences, job titles, or metrics on your resume is considered academic falsification under university conduct rules and will result in a zero and COAM referral.',
              allowedUses: [
                'Using AI to suggest stronger action verbs (e.g. "spearheaded", "streamlined", "orchestrated")',
                'Refining concise bullet point formatting for real accomplishments you achieved'
              ],
              prohibitedUses: [
                'Inventing fictitious work experiences or inflated metrics',
                'Falsifying your GPA or credentials'
              ],
              instructorQuote: '“Practice the principles of written business communication while planning, editing, revising, and proofreading work consistent with professional standards.”',
            }
          },
          {
            label: 'Can AI format my resume before Big Interview?',
            question: 'Can AI help format my resume before Big Interview evaluates it?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI is allowed for action verb suggestions and formatting.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Turn in first and second drafts electronically via Canvas and have it evaluated by Big Interview software. AI allowed for action verb suggestions and formatting.”',
            }
          },
          {
            label: 'Can AI write my whole resume for me?',
            question: 'Can AI write my entire resume for me from scratch?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus allows AI for action verbs and formatting, but doesn’t say whether AI can write the whole resume. Check with your instructor.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Turn in first and second drafts electronically via Canvas and have it evaluated by Big Interview software. AI allowed for action verb suggestions and formatting.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-negotiation',
        title: 'Negotiation Strategy Document & Execution (5 pts)',
        dueDate: 'Oct 07, 2026 · Prior to Recitation',
        dueDateTimestamp: 1791331200000, // Oct 07
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Planning Prep Only)',
        instructorComment: 'Planning document submitted electronically to Canvas prior to recitation. Students negotiate head-to-head against counterparts in recitation. Real-time AI during negotiation is prohibited.',
        syllabusClause: 'Syllabus Page 11: “Students will negotiate head to head against their counterparts and will be assessed on their performance.”',
        quickPrompts: [
          {
            label: 'Can I use an AI tool during the live in-class negotiation?',
            question: 'Can I have ChatGPT or an AI chatbot open on my phone to tell me what to say during the live head-to-head negotiation in class?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Using AI assistance or electronic devices during the live head-to-head negotiation exercise is strictly prohibited. You must negotiate directly with your counterpart.',
              allowedUses: [
                'Using AI prior to class to review negotiation concepts (BATNA, Reservation Price, ZOPA) from Top Hat Chapter 5',
                'Synthesizing your planning strategy document before submission'
              ],
              prohibitedUses: [
                'Consulting AI in real time during the negotiation session',
                'Misrepresenting role constraints in violation of negotiation ethics'
              ],
              instructorQuote: '“Students will negotiate head to head against their counterparts and will be assessed on their performance.”',
            }
          },
          {
            label: 'Can AI help draft my planning document?',
            question: 'Can I use AI to help draft my negotiation planning document before recitation?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus only prohibits real-time AI during the negotiation. Check with your instructor about the planning document.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Planning document submitted electronically to Canvas prior to recitation. Students negotiate head-to-head against counterparts in recitation. Real-time AI during negotiation is prohibited.”',
            }
          },
          {
            label: 'Can I wear an AI earpiece while negotiating?',
            question: 'Can I wear an earpiece with an AI coach during the live negotiation?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. Real-time AI during the negotiation is prohibited.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Planning document submitted electronically to Canvas prior to recitation. Students negotiate head-to-head against counterparts in recitation. Real-time AI during negotiation is prohibited.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-linkedin',
        title: 'LinkedIn Profile Completion (5 pts)',
        dueDate: 'Oct 07, 2026 · Prior to Recitation',
        dueDateTimestamp: 1791331200001, // Oct 07
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed (Headline & Bio Polish)',
        instructorComment: 'Complete a professional LinkedIn profile and submit the link electronically to Canvas prior to recitation. AI permitted for headline and summary bio suggestions.',
        syllabusClause: 'Syllabus Page 10: “You will be required to complete a LinkedIn profile. Additional details will be provided during recitation and on Canvas.”',
        quickPrompts: [
          {
            label: 'Can I use AI to write my LinkedIn About / Summary bio?',
            question: 'Can I ask an AI to help write a compelling LinkedIn summary bio tailored to my Fisher College of Business major?',
            response: {
              verdict: 'Allowed Professional Practice',
              verdictType: 'allowed',
              policySummary: 'Yes! Using AI to suggest engaging phrasing for your professional summary bio and headline is an approved professional development practice.',
              allowedUses: [
                'Prompting: "Write a professional LinkedIn summary for a sophomore finance major at Ohio State Fisher College of Business"',
                'Tailoring headline keywords to your target career fields'
              ],
              prohibitedUses: [
                'Claiming fictitious honors or leadership titles on your profile'
              ],
              instructorQuote: '“Develop correspondence appropriate to the job search and career goals.”',
            }
          },
          {
            label: 'Can I submit a private or blank LinkedIn profile?',
            question: 'Will a private or incomplete LinkedIn account receive the 5 points?',
            response: {
              verdict: 'NOT ALLOWED — Complete Public Profile Required',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Your profile must be fully completed with headshot, education details, skills, and summary to receive credit.',
              allowedUses: [
                'Setting public viewability on so recitation leaders can evaluate your profile'
              ],
              prohibitedUses: [
                'Submitting a blank or unpopulated LinkedIn URL'
              ],
              instructorQuote: '“You will be required to complete a LinkedIn profile.”',
            }
          },
          {
            label: 'Can AI write my LinkedIn headline?',
            question: 'Can AI suggest a professional headline for my LinkedIn profile?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI is permitted for headline and summary bio suggestions.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Complete a professional LinkedIn profile and submit the link electronically to Canvas prior to recitation. AI permitted for headline and summary bio suggestions.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-exam1',
        title: 'Exam #1 (60 pts)',
        dueDate: 'Oct 21, 2026 · In Recitation',
        dueDateTimestamp: 1792540800000, // Oct 21
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited (Proctored)',
        instructorComment: 'Closed book and closed note multiple-choice exam taken during regularly scheduled recitation. Zero AI or electronic devices permitted. Exam cannot be dropped.',
        syllabusClause: 'Syllabus Page 10: “Both exams are closed book and closed note. Neither exam will be dropped from the final grade. Exams must be taken in a proctored environment.”',
        quickPrompts: [
          {
            label: 'Can I use an AI tool on my phone or laptop during Exam #1?',
            question: 'Can I access ChatGPT on my phone or browser during Exam #1 to look up multiple choice questions?',
            response: {
              verdict: 'NOT ALLOWED — Mandatory COAM Referral',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Exam #1 is strictly closed-book, closed-note, and proctored. Any access to AI tools or electronic devices during the exam is an immediate violation of university rules resulting in a mandatory COAM referral and course failure.',
              allowedUses: [
                'Using AI beforehand as a study tutor to review Top Hat chapters and lecture videos'
              ],
              prohibitedUses: [
                'Having any phone, smartwatch, or secondary device open during the exam',
                'Accessing AI tools or communication channels during exam hours'
              ],
              instructorQuote: '“I am obligated by University Rules to report my suspicions to COAM. See OSU Prohibited Conduct – Section 3335-23-04(A).”',
            }
          },
          {
            label: 'Can I drop Exam #1 if I do poorly?',
            question: 'Will Prof. Shepfer drop my Exam #1 score if Exam #2 is higher?',
            response: {
              verdict: 'NOT ALLOWED — Neither Exam Dropped',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The syllabus explicitly states: “Neither exam will be dropped from the final grade.” All 60 points count toward your final grade.',
              allowedUses: [
                'Preparing thoroughly using review materials before October 21'
              ],
              prohibitedUses: [
                'Skipping the exam with unexcused absences'
              ],
              instructorQuote: '“Neither exam will be dropped from the final grade.”',
            }
          },
          {
            label: 'Can I bring a smartwatch with AI to Exam #1?',
            question: 'Can I wear a smartwatch with an AI assistant during Exam #1?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. Zero AI or electronic devices are permitted during the exam.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Closed book and closed note multiple-choice exam taken during regularly scheduled recitation. Zero AI or electronic devices permitted. Exam cannot be dropped.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-leadership',
        title: 'Leadership Assessment Survey Results (3 pts)',
        dueDate: 'Oct 21, 2026 · Prior to Recitation',
        dueDateTimestamp: 1792540800001, // Oct 21
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Individual Self-Assessment',
        instructorComment: 'Complete the 360-degree Leadership Assessment Survey (approx 20 minutes) and upload survey results to Canvas using the course code.',
        syllabusClause: 'Syllabus Page 10: “Upload your Leadership Skills Assessment Survey results prior to recitation. Be sure to use the course code found in Canvas.”',
        quickPrompts: [
          {
            label: 'Can I have an AI fill out my leadership survey answers?',
            question: 'Can I have an AI automatically generate answers for the 360-degree leadership survey?',
            response: {
              verdict: 'NOT ALLOWED — Self-Reflection Assessment',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The survey evaluates your authentic self-awareness and personal strengths/weaknesses. Having an AI automate your responses defeats the core objective of the exercise.',
              allowedUses: [
                'Completing the 20-minute survey thoughtfully based on your personal experiences',
                'Inviting peer raters to evaluate your leadership skills'
              ],
              prohibitedUses: [
                'Falsifying survey responses with automated AI scripts'
              ],
              instructorQuote: '“To develop self-awareness around your personal strengths, weaknesses, and leadership skills.”',
            }
          },
          {
            label: 'Can AI take the leadership survey for me?',
            question: 'Can I ask an AI to take the 20-minute leadership survey in my place?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus doesn’t mention AI for the leadership survey. Check with your instructor; it’s meant to reflect you.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Complete the 360-degree Leadership Assessment Survey (approx 20 minutes) and upload survey results to Canvas using the course code.”',
            }
          },
          {
            label: 'Can I discuss my survey results with AI to find growth areas?',
            question: 'Can I paste my survey score report into an AI to get suggestions on developing leadership skills?',
            response: {
              verdict: 'Allowed Professional Reflection',
              verdictType: 'allowed',
              policySummary: 'Yes! Asking AI to suggest developmental goals and action steps based on your 360-degree leadership feedback is an approved reflection exercise.',
              allowedUses: [
                'Brainstorming actionable leadership development goals'
              ],
              prohibitedUses: [],
              instructorQuote: '“Fostering an environment that helps students critically think for themselves.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-career-mgmt',
        title: 'Appointment with Office of Career Management (3 pts)',
        dueDate: 'Oct 28, 2026 · Week 10',
        dueDateTimestamp: 1793145600000, // Oct 28
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'In-Person Human Appointment Required',
        instructorComment: 'Meet with a representative from the Fisher Office of Career Management. In-person meeting required; cannot be simulated or replaced with AI.',
        syllabusClause: 'Syllabus Page 10: “You will meet with a representative from the office of Career Management. Additional details will be provided during class.”',
        quickPrompts: [
          {
            label: 'Can I simulate this appointment with an AI career coach?',
            question: 'Can I use an AI interview tool instead of attending my appointment with the Office of Career Management?',
            response: {
              verdict: 'NOT ALLOWED — Human Advisor Required',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. You must meet directly with an official staff advisor from the Fisher Office of Career Management (Gerlach Hall) to receive these 3 points.',
              allowedUses: [
                'Booking an appointment through Handshake / FisherConnect',
                'Bringing your updated resume to review with the advisor'
              ],
              prohibitedUses: [
                'Claiming credit without completing the official appointment'
              ],
              instructorQuote: '“You will meet with a representative from the office of Career Management.”',
            }
          },
          {
            label: 'Can an AI attend my career meeting for me?',
            question: 'Can I send an AI avatar to my Career Management meeting instead of going myself?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. The meeting is in person and cannot be simulated or replaced with AI.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Meet with a representative from the Fisher Office of Career Management. In-person meeting required; cannot be simulated or replaced with AI.”',
            }
          },
          {
            label: 'Can I practice with AI before the meeting?',
            question: 'Can I use AI to practice interview answers before my Career Management meeting?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus only says the meeting can’t be replaced with AI. Check with your instructor about practicing with AI beforehand.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Meet with a representative from the Fisher Office of Career Management. In-person meeting required; cannot be simulated or replaced with AI.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-crisis',
        title: 'Team Grade: Crisis Case Preparation & Execution (60 pts)',
        dueDate: 'Nov 04, 2026 · Week 11 in Recitation',
        dueDateTimestamp: 1793750400000, // Nov 04
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed w/ Prudent Use',
        instructorComment: 'Leadership team in crisis simulation. AI tools welcomed as aids for exploring scenario dynamics, PR communication angles, and stakeholder matrices. Live presentation delivery and Q&A defense must be student-executed.',
        syllabusClause: 'Syllabus Page 8 & 11: “Student groups will undergo a week of a leadership team in crisis case that will culminate in a final presentation.”',
        quickPrompts: [
          {
            label: 'Can our team brainstorm crisis response strategies with AI?',
            question: 'Can our team use ChatGPT or Claude to simulate how different stakeholders will react to our crisis scenario?',
            response: {
              verdict: 'Expected & Encouraged — Supplementary Resource',
              verdictType: 'allowed',
              policySummary: 'Yes! Prof. Shepfer’s syllabus explicitly states: “Employing these tools as supplementary resources to foster deeper understanding and innovation within the subject matter is expected.” You may stress-test crisis scenarios and stakeholder reactions.',
              allowedUses: [
                'Brainstorming unintended consequences of crisis communication statements',
                'Simulating potential customer, shareholder, and regulator viewpoints',
                'Synthesizing crisis communication frameworks'
              ],
              prohibitedUses: [
                'Reading an AI-generated crisis script verbatim during your live recitation presentation',
                'Relying on an AI during live unscripted Q&A questions from your recitation leader'
              ],
              instructorQuote: '“Building skills to understand and harness the power of AI tools will be a critical component to your success in the business world in the future.”',
              citationTip: 'Include a 1-sentence note on your team slide deck: "Team consulted Claude 3.5 for crisis stakeholder scenario ideation."'
            }
          },
          {
            label: 'Can our team have AI generate our entire crisis response slides without student work?',
            question: 'Can we have an AI create our entire crisis presentation deck and talking points with no team input?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Generating the entire presentation without authentic student analysis is prohibited. While AI can assist your research, your team must own, craft, and defend every strategic decision during the crisis simulation.',
              allowedUses: [
                'Using AI as a supplementary brainstorming aid'
              ],
              prohibitedUses: [
                'Surrendering team strategic decision-making to an LLM',
                'Failing to disclose AI contributions on your presentation submission'
              ],
              instructorQuote: '“While these tools are at our disposal, it is paramount that their utilization remains prudent and aligned with the academic integrity of the course.”',
            }
          },
          {
            label: 'Can AI help us draft PR messages for the crisis?',
            question: 'Can our team use AI to explore different PR communication angles for our crisis response?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI tools are welcomed as aids for exploring scenario dynamics, PR communication angles, and stakeholder matrices; the live presentation and Q&A must be student-executed.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Leadership team in crisis simulation. AI tools welcomed as aids for exploring scenario dynamics, PR communication angles, and stakeholder matrices. Live presentation delivery and Q&A defense must be student-executed.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-quic',
        title: 'QUIC Modules Completion (3 pts)',
        dueDate: 'Nov 18, 2026 · Week 13',
        dueDateTimestamp: 1794960000000, // Nov 18
        aiStatus: 'study_prep_only',
        aiStatusLabel: 'Individual Completion Required',
        instructorComment: 'Complete the QUIC interview certification modules as assigned by the Office of Career Management. Automated quiz solving is prohibited.',
        syllabusClause: 'Syllabus Page 10: “You will be required to complete the QUIC modules as assigned by the Office of Career Management.”',
        quickPrompts: [
          {
            label: 'Can I use an AI bot to click through the QUIC modules?',
            question: 'Can I use an automated script or bot to complete the QUIC interview training modules for me?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The QUIC certification qualifies you for on-campus corporate recruiting at Fisher. Automating or bypassing the modules is strictly prohibited.',
              allowedUses: [
                'Watching the interactive module videos on behavioral interview techniques',
                'Practicing STAR (Situation, Task, Action, Result) interview responses'
              ],
              prohibitedUses: [
                'Using automated tools to skip or falsify module completion'
              ],
              instructorQuote: '“You will be required to complete the QUIC modules as assigned by Career Management.”',
            }
          },
          {
            label: 'Can AI explain a QUIC topic I missed?',
            question: 'Can AI explain a QUIC module topic I didn’t understand, if I complete the module myself?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes, as a study aid, as long as you complete the modules yourself. Automated quiz solving is prohibited.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Complete the QUIC interview certification modules as assigned by the Office of Career Management. Automated quiz solving is prohibited.”',
            }
          },
          {
            label: 'Can AI help me practice behavioral STAR responses for QUIC?',
            question: 'Can I ask an AI to simulate a mock behavioral interview and ask me STAR questions?',
            response: {
              verdict: 'Allowed & Recommended Study Aid',
              verdictType: 'allowed',
              policySummary: 'Yes! Prompting an AI to conduct a mock interview asking: "Ask me behavioral questions about teamwork and critique my answers" is an excellent way to prepare.',
              allowedUses: [
                'Simulating mock behavioral interview scenarios'
              ],
              prohibitedUses: [],
              instructorQuote: '“Building skills to understand and harness the power of AI tools is expected.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-pitch',
        title: 'Team Grade: Business Pitch Case Competition (40 pts)',
        dueDate: 'Dec 02, 2026 · Week 15 in Recitation',
        dueDateTimestamp: 1796169600000, // Dec 02
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed (Innovation Aid)',
        instructorComment: 'Pre-assigned group pitches a business solution to a current market challenge. AI encouraged for customer discovery ideation, market research trends, and pitch deck structuring. Your team must pitch and defend your original business solution.',
        syllabusClause: 'Syllabus Page 8 & 10: “Through thoughtful integration, we aim to maximize the benefits of AI while upholding standards of rigorous academic exploration.”',
        quickPrompts: [
          {
            label: 'Can we use AI for pitch deck design and competitive analysis?',
            question: 'Can our team use AI tools (e.g. Gamma or ChatGPT) to help structure our business pitch slides and analyze market competitors?',
            response: {
              verdict: 'Allowed & Supported',
              verdictType: 'allowed',
              policySummary: 'Yes! Harnessing AI for market analysis and slide communication is aligned with the syllabus objective of preparing students for modern business leadership.',
              allowedUses: [
                'Using AI to research existing market solutions and identify underserved customer segments',
                'Formatting pitch deck outline structures (Problem, Solution, Market Size, Business Model)',
                'Brainstorming revenue model options and go-to-market channels'
              ],
              prohibitedUses: [
                'Pitching an entirely fabricated AI business idea that your team cannot explain or defend',
                'Citing unverified AI market statistics without cross-referencing Fisher Library databases'
              ],
              instructorQuote: '“While these tools are at our disposal, it is paramount that their utilization remains prudent and aligned with the academic integrity of the course.”',
              citationTip: 'Add an acknowledgment bullet on your appendix slide: "Market landscape ideation assisted by AI computational tools."'
            }
          },
          {
            label: 'Can we generate an entire fake business plan with AI without verification?',
            question: 'Can our group have an AI generate the entire pitch deck numbers and claims without our team doing original research?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Presenting unverified or fabricated AI market claims without rigorous student analysis is strictly prohibited. Your team must personally validate all business assumptions.',
              allowedUses: [
                'Verifying data through Fisher Virtual Library databases (IBISWorld, Statista, Mintel)'
              ],
              prohibitedUses: [
                'Presenting unverified hallucinations as factual market data'
              ],
              instructorQuote: '“Upholding standards of rigorous academic exploration is expected.”',
            }
          },
          {
            label: 'Can AI help research market trends?',
            question: 'Can our team use AI to research market trends for our business pitch?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes. AI is encouraged for customer discovery ideation, market research trends, and pitch deck structuring.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Pre-assigned group pitches a business solution to a current market challenge. AI encouraged for customer discovery ideation, market research trends, and pitch deck structuring. Your team must pitch and defend your original business solution.”',
            }
          }
        ]
      },
      {
        id: 'busmhr-exam2',
        title: 'Exam #2 (40 pts)',
        dueDate: 'Dec 09, 2026 · Week 16 in Recitation',
        dueDateTimestamp: 1796774400000, // Dec 09
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited (Proctored)',
        instructorComment: 'Closed book and closed note multiple-choice exam taken during regularly scheduled recitation. Zero outside devices permitted. Final exam score cannot be dropped.',
        syllabusClause: 'Syllabus Page 10: “Both exams are closed book and closed note. Neither exam will be dropped from the final grade. Exams must be taken in a proctored environment.”',
        quickPrompts: [
          {
            label: 'Can I use an AI during Exam #2 in recitation?',
            question: 'Can I look up answers on ChatGPT or use AI smart glasses during Exam #2?',
            response: {
              verdict: 'NOT ALLOWED — Mandatory COAM Referral',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Exam #2 is strictly proctored, closed book, and closed note. Any unauthorized AI or device use during the exam results in an immediate academic misconduct referral to COAM.',
              allowedUses: [
                'Studying lecture concepts and Top Hat readings beforehand'
              ],
              prohibitedUses: [
                'Accessing any device or generative tool during the exam window'
              ],
              instructorQuote: '“Both exams are closed book and closed note. Exams must be taken in a proctored environment.”',
            }
          },
          {
            label: 'Can I use an AI calculator app on Exam #2?',
            question: 'Can I use a calculator app with AI features during Exam #2?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. Zero outside devices are permitted during the exam.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Closed book and closed note multiple-choice exam taken during regularly scheduled recitation. Zero outside devices permitted. Final exam score cannot be dropped.”',
            }
          },
          {
            label: 'Can AI make practice questions for Exam #2?',
            question: 'Can I use AI to make practice questions while I study for Exam #2?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus only says no outside devices during the exam. Check with your instructor about studying with AI beforehand.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Closed book and closed note multiple-choice exam taken during regularly scheduled recitation. Zero outside devices permitted. Final exam score cannot be dropped.”',
            }
          }
        ]
      }
    ]
  },
  {
    id: 'cse-2221',
    code: 'CSE 2221',
    name: 'Software I: Software Components',
    professor: 'Dr. Jeremy Morris',
    department: 'Computer Science & Engineering',
    term: 'Autumn 2026',
    overallPolicy: 'OSU COAM Policy: AI permitted strictly for deciphering compiler error traces and generic Java API syntax. Submitting AI-generated implementations for OSU components (NaturalNumber, XMLTree, Queue) is an immediate COAM academic misconduct referral.',
    assignments: [
      {
        id: 'cse2221-hw1',
        title: 'Homework 1: XML Parsing & Tree Traversal',
        dueDate: 'Sep 08, 2026',
        dueDateTimestamp: 1788825600000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited',
        instructorComment: 'Initial homework sets establish fundamental recursive reasoning. No LLM prompts or AI code generators allowed.',
        syllabusClause: 'COAM Syllabus Section 3: All early homework submissions are checked with automated AST similarity scripts.',
        quickPrompts: [
          {
            label: 'Can I ask AI to write recursive XML tree parsing code?',
            question: 'Can I ask an AI to write recursive tree traversal code for Homework 1?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Dr. Morris requires that recursion logic for XMLTree components be developed purely independently. Generating recursive methods with AI is prohibited.',
              allowedUses: [
                'Attending CSE tutoring hours in Caldwell Lab 112',
                'Reading the course lecture slide deck on XMLTree recursion',
                'Drawing recursion tree diagrams on paper'
              ],
              prohibitedUses: [
                'Pasting assignment prompts into ChatGPT, Claude, or Copilot',
                'Using AI to generate recursive base cases or traversal methods'
              ],
              instructorQuote: '“Homework 1 builds the intuition required for the midterm. Independent struggle is where mastery occurs.”',
            }
          },
          {
            label: 'What if I get stuck on an XMLTree method?',
            question: 'Where can I get legitimate help if I am completely stuck on XMLTree methods?',
            response: {
              verdict: 'Approved OSU Resources',
              verdictType: 'allowed',
              policySummary: 'Visit Caldwell Lab peer tutoring, post anonymously on CarmenCanvas Discussions, or attend instructor office hours.',
              allowedUses: [
                'Posting conceptual questions on course Piazza/Canvas',
                'Attending Caldwell Lab teaching assistant hours'
              ],
              prohibitedUses: [
                'Using external generative coding bots or Chegg'
              ],
              instructorQuote: '“TAs are available 6 days a week in Caldwell Lab. Come talk to us in person.”',
            }
          },
          {
            label: 'Can I ask AI to explain recursion first?',
            question: 'Can I ask an AI to explain recursion in general before I start Homework 1?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'This homework allows no LLM prompts or AI code generators; general study before you start isn’t covered. Check with your instructor.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Initial homework sets establish fundamental recursive reasoning. No LLM prompts or AI code generators allowed.”',
            }
          }
        ]
      },
      {
        id: 'cse2221-proj2',
        title: 'Project 2: NaturalNumber Calculator GUI',
        dueDate: 'Sep 24, 2026',
        dueDateTimestamp: 1790208000000,
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Syntax & Debugging Only)',
        instructorComment: 'Permitted for compiler error traces and Swing layout debugging. NaturalNumber mathematical method implementations must be student-authored.',
        syllabusClause: 'COAM Section 4.2: Error translation allowed. Algorithm generation banned.',
        quickPrompts: [
          {
            label: 'Debug Java Swing layout errors with AI',
            question: 'Can I paste my Swing JPanel grid layout code into an AI to fix visual alignment issues?',
            response: {
              verdict: 'Allowed — UI Syntax Debugging',
              verdictType: 'allowed',
              policySummary: 'Yes, asking AI to explain why a GridLayout or FlowLayout behaves unexpectedly is permitted.',
              allowedUses: [
                'Asking how Java Swing LayoutManagers work',
                'Fixing syntax on ActionListener button wiring'
              ],
              prohibitedUses: [
                'Generating the NaturalNumber addition, multiplication, or division kernels',
                'Allowing AI to write the controller state machine'
              ],
              instructorQuote: '“Swing GUI syntax is verbose and standard. You may consult AI for GUI layout errors, but calculator math must be yours.”',
              citationTip: 'Add comment: `// Swing button layout assistance consulted via ChatGPT. NaturalNumber logic authored independently.`'
            }
          },
          {
            label: 'Can I use Copilot to generate NaturalNumber math methods?',
            question: 'Is GitHub Copilot autocomplete allowed when implementing NaturalNumber methods?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Using inline AI code completion for NaturalNumber operations is considered unauthorized assistance and an Honor Code violation.',
              allowedUses: [
                'Typing code by hand in Eclipse with standard Eclipse IDE autocomplete'
              ],
              prohibitedUses: [
                'Using GitHub Copilot, Cursor AI, or Tabnine in your IDE'
              ],
              instructorQuote: '“Disable AI plugins in Eclipse while completing CSE 2221 projects.”',
            }
          },
          {
            label: 'How to cite AI in Project 2 submission',
            question: 'How do I document AI debugging help in the project submission zip file?',
            response: {
              verdict: 'Required Submission Disclosure',
              verdictType: 'allowed',
              policySummary: 'Include a brief note in your project doc comments specifying the date and tool consulted for syntax debugging.',
              allowedUses: [
                'Adding a 2-line disclosure in the file header comment block'
              ],
              prohibitedUses: [
                'Failing to disclose AI debugging queries'
              ],
              instructorQuote: '“Honesty in the comment block protects you from COAM inquiries.”',
              citationTip: 'Template: `/** AI Consultation: Consulted Claude 3.5 on Sep 20 to troubleshoot Java Swing GridBagConstraints syntax. */`'
            }
          }
        ]
      },
      {
        id: 'cse2221-proj3',
        title: 'Project 3: RSS Reader & Aggregator',
        dueDate: 'Oct 14, 2026',
        dueDateTimestamp: 1791936000000,
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Syntax & Debugging Only)',
        instructorComment: 'You may feed compiler error traces to explain bug messages. You may NOT prompt for XML tree parsing logic or HTML output generation loops.',
        syllabusClause: 'COAM Section 4.3: Permitted AI usage is limited to deciphering compiler error traces and generic language documentation.',
        quickPrompts: [
          {
            label: 'Explain NullPointerException in RSS Parser',
            question: 'Can I ask ChatGPT to explain why my XML tree search produces a NullPointerException?',
            response: {
              verdict: 'Allowed — Diagnostic Assistance',
              verdictType: 'allowed',
              policySummary: 'Yes! You are allowed to paste the compiler stack trace and ask what causes NullPointerExceptions in Java XML traversal.',
              allowedUses: [
                'Pasting isolated compiler stack trace lines to understand what the error means',
                'Asking conceptual questions like "What does XMLTree.child() return when index is out of bounds?"',
                'Reading official OSU component documentation in the course components.jar'
              ],
              prohibitedUses: [
                'Pasting your entire RSSReader.java file and asking "Fix this for me"',
                'Prompting AI to write the RSS channel item loops or HTML formatting',
                'Using GitHub Copilot autocomplete during the assignment'
              ],
              instructorQuote: '“Diagnostics and error trace translations are acceptable. Core XML parsing and HTML table loops must remain 100% student work.”',
              citationTip: 'Add comment in header: `// Diagnostic query on stack trace consulted via ChatGPT-4o. Logic authored independently.`'
            }
          },
          {
            label: 'Cite AI in Project README / Header',
            question: 'How should I cite AI in my Project 3 submission if I used it for a bug explanation?',
            response: {
              verdict: 'Required Citation Protocol',
              verdictType: 'allowed',
              policySummary: 'Your file header must include an "AI & External Tools Disclosure" section detailing date, tool, prompt, and how you applied the hint.',
              allowedUses: [
                'Including a brief 2-sentence summary in your class Javadoc header',
                'Linking to a shared prompt transcript if requested'
              ],
              prohibitedUses: [
                'Failing to disclose AI diagnostics in the file header'
              ],
              instructorQuote: '“Full transparency protects your academic integrity under OSU COAM rules.”',
              citationTip: 'Template: `Tool: ChatGPT-4o | Date: Oct 10 | Query: Explained Java NullPointerException trace | Code applied: Independently rewritten null-check conditional on line 74.`'
            }
          },
          {
            label: 'Can AI generate the HTML output template?',
            question: 'Can I ask an AI to write the HTML table boilerplate for formatting the RSS feed?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Formatting the output HTML file using SimpleWriter is one of the graded milestones in the assignment rubric and must be written by you.',
              allowedUses: [
                'Reviewing sample HTML outputs provided on the course website',
                'Using the SimpleWriter print methods covered in lecture'
              ],
              prohibitedUses: [
                'Generating HTML string concatenation loops via LLMs'
              ],
              instructorQuote: '“Generating the output HTML structure is a key component of the assignment grade.”',
            }
          }
        ]
      },
      {
        id: 'cse2221-quiz4',
        title: 'Lab Quiz 4: Interface vs Abstract Class',
        dueDate: 'Oct 28, 2026',
        dueDateTimestamp: 1793145600000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited',
        instructorComment: 'In-lab timed quiz. Zero outside assistance or AI allowed during CarmenCanvas quiz windows.',
        syllabusClause: 'COAM Section 5: Any browser extension or generative tool running during Carmen quizzes is flagged by Carmen analytics.',
        quickPrompts: [
          {
            label: 'Can I use AI to study before the lab quiz?',
            question: 'Can I prompt an AI to generate practice questions on Java Interfaces before the quiz?',
            response: {
              verdict: 'Allowed for Study Preparation',
              verdictType: 'allowed',
              policySummary: 'Yes, using AI as a study partner before the quiz window opens is permitted and encouraged.',
              allowedUses: [
                'Asking AI to quiz you on differences between Interfaces and Abstract Classes in Java',
                'Creating practice multiple-choice questions for study'
              ],
              prohibitedUses: [
                'Having AI tools open during the Carmen quiz period'
              ],
              instructorQuote: '“Study deeply with any tool beforehand. Once Carmen opens, you must rely solely on your own mind.”',
            }
          },
          {
            label: 'Can I keep an AI tab open during the quiz?',
            question: 'Can I keep an AI chat open in another browser tab during Lab Quiz 4?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. Zero outside assistance or AI is allowed during the quiz window.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“In-lab timed quiz. Zero outside assistance or AI allowed during CarmenCanvas quiz windows.”',
            }
          },
          {
            label: 'Can I look up quiz questions on ChatGPT during the quiz?',
            question: 'Can I copy a lab quiz question into ChatGPT during the 15-minute quiz?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Accessing any outside AI or website during the in-lab timed quiz is strictly prohibited and results in an automatic zero and COAM report.',
              allowedUses: [
                'Answering questions from memory based on lecture preparation'
              ],
              prohibitedUses: [
                'Pasting quiz questions into AI tools'
              ],
              instructorQuote: '“Once Carmen opens, you must rely solely on your own mind.”',
            }
          }
        ]
      },
      {
        id: 'cse2221-proj4',
        title: 'Project 4: Tag Cloud Generator in Java',
        dueDate: 'Nov 17, 2026',
        dueDateTimestamp: 1794873600000,
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Sorting Comparator Hints Only)',
        instructorComment: 'AI permitted for reviewing Java Comparator syntax and Map sorting concepts. Word frequency counting algorithm must be student-crafted.',
        syllabusClause: 'COAM Section 4.4: Sorting logic must be student work.',
        quickPrompts: [
          {
            label: 'Java Comparator syntax review with AI',
            question: 'Can I ask an AI how to write a custom String comparator that sorts alphabetically ignoring case?',
            response: {
              verdict: 'Allowed — Syntax Clarification',
              verdictType: 'allowed',
              policySummary: 'Yes, generic questions regarding `Comparator<Map.Pair<String, Integer>>` syntax are allowed.',
              allowedUses: [
                'Reviewing generic Java Comparator documentation',
                'Asking how compare() return values (-1, 0, 1) determine sort order'
              ],
              prohibitedUses: [
                'Generating the entire TagCloudGenerator class with an LLM'
              ],
              instructorQuote: '“Understanding comparator contracts in Java is essential. You may ask AI how comparators work in general.”',
              citationTip: 'Add citation comment in your Comparator class definition.'
            }
          },
          {
            label: 'Can AI write the word tokenization regex?',
            question: 'Can I prompt AI to generate a regular expression to split text into words and punctuation?',
            response: {
              verdict: 'NOT ALLOWED — Use Course Separator Methods',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. In CSE 2221, tokenization must be implemented using the course Set-based separator extraction methods taught in lecture, not external regexes.',
              allowedUses: [
                'Using the `nextWordOrSeparator` method demonstrated in lecture'
              ],
              prohibitedUses: [
                'Importing third-party AI-generated regex tokenizers'
              ],
              instructorQuote: '“Follow the design conventions taught in the course, not generic internet regexes.”',
            }
          },
          {
            label: 'Font size scaling formula in Tag Cloud',
            question: 'Can I ask AI for formulas to calculate proportional font sizes between min and max word counts?',
            response: {
              verdict: 'Allowed — Mathematical Formula Only',
              verdictType: 'allowed',
              policySummary: 'Yes, asking for standard linear interpolation mathematical formulas is permitted.',
              allowedUses: [
                'Reviewing linear interpolation math: `size = minSize + (count - minCount) * ...`'
              ],
              prohibitedUses: [
                'Copying full implementation files'
              ],
              instructorQuote: '“Math concepts are universal; implement the code yourself in Java.”',
            }
          }
        ]
      },
      {
        id: 'cse2221-final',
        title: 'Final Component Software Capstone',
        dueDate: 'Dec 09, 2026',
        dueDateTimestamp: 1796774400000,
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed w/ Disclosure Appendix',
        instructorComment: 'AI permitted for architectural ideation, boilerplate generation, and refactoring tips. All generated fragments must be documented in AI_DISCLOSURE.txt.',
        syllabusClause: 'COAM Section 6: Comprehensive capstone transparency requirement.',
        quickPrompts: [
          {
            label: 'Capstone AI Disclosure format',
            question: 'What is the required format for AI_DISCLOSURE.txt in the capstone submission?',
            response: {
              verdict: 'Mandatory Submission Item',
              verdictType: 'allowed',
              policySummary: 'Document tool name, date, prompt summary, and exact lines modified in `AI_DISCLOSURE.txt`.',
              allowedUses: [
                'Using AI for boilerplate getters, setters, and documentation comments',
                'Documenting all queries transparently'
              ],
              prohibitedUses: [
                'Submitting code you cannot explain during your live demo with the TA'
              ],
              instructorQuote: '“If an AI suggested a design pattern, declare it. You will defend your architecture in person.”',
              citationTip: 'Template: `AI_DISCLOSURE: ChatGPT-4o used on Dec 2 for advice on queue abstract state invariants.`'
            }
          },
          {
            label: 'Can I submit capstone code written entirely by AI?',
            question: 'Can I have an AI build my entire final capstone project from scratch?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Generating the entire capstone with an AI violates the core integrity rules of the course. You will undergo a live oral defense where you must explain every line.',
              allowedUses: [
                'Using AI for ideation and syntax checking'
              ],
              prohibitedUses: [
                'Delegating complete project authorship to an LLM'
              ],
              instructorQuote: '“If you cannot explain why a line exists, you did not author it.”',
            }
          },
          {
            label: 'Live oral defense expectations',
            question: 'Will I be asked about AI-assisted lines during the capstone review?',
            response: {
              verdict: 'Oral Code Defense Mandatory',
              verdictType: 'caution',
              policySummary: 'Yes. Teaching assistants will point to lines of code at random and ask you to explain invariants and time complexity.',
              allowedUses: [
                'Ensuring you understand 100% of the code submitted'
              ],
              prohibitedUses: [
                'Accepting AI suggestions you cannot explain line-by-line'
              ],
              instructorQuote: '“If you cannot explain why a line of code is present, it will not count towards your grade.”',
            }
          }
        ]
      }
    ]
  },
  {
    id: 'engl-1110',
    code: 'ENGL 1110.01',
    name: 'First-Year English Composition',
    professor: 'Prof. Margaret Hilliard',
    department: 'English Literature & Rhetoric',
    term: 'Autumn 2026',
    overallPolicy: 'OSU Writing Program AI Policy: Writing is cognitive discovery. Generative AI prose must not replace student authorship. Brainstorming, outline feedback, and counter-argument prompts are permitted with an attached Carmen chat transcript.',
    assignments: [
      {
        id: 'engl1110-a1',
        title: 'Essay 1: Literacy Narrative Draft',
        dueDate: 'Sep 15, 2026',
        dueDateTimestamp: 1789430400000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited (Authentic Voice)',
        instructorComment: 'Your personal lived experience cannot be outsourced to a machine. Zero generative AI prose permitted.',
        syllabusClause: 'Department Policy: Personal narrative essays must reflect authentic student voice without LLM intervention.',
        quickPrompts: [
          {
            label: 'Can I have AI write my personal literacy narrative?',
            question: 'Can ChatGPT or Claude write the paragraphs of my literacy narrative essay for me?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Having an AI generate prose for your personal narrative is strictly prohibited. Prof. Hilliard evaluates your authentic personal voice and reflection.',
              allowedUses: [
                'Writing freely in your natural personal voice',
                'Visiting the OSU Writing Center in Smith Lab for human peer feedback'
              ],
              prohibitedUses: [
                'Using ChatGPT, Claude, or QuillBot to draft sentences or paragraphs',
                'Generating narrative descriptions with AI'
              ],
              instructorQuote: '“The literacy narrative is about your journey with words. Let your real voice shine through.”',
            }
          },
          {
            label: 'Is Grammarly allowed on Essay 1?',
            question: 'Is standard spellcheck in Microsoft Word or Google Docs permitted?',
            response: {
              verdict: 'Standard Spellcheck Allowed',
              verdictType: 'allowed',
              policySummary: 'Basic typo and punctuation checkers are permitted. Generative style/tone rewrite modes are prohibited.',
              allowedUses: [
                'Standard red-underline typo corrections'
              ],
              prohibitedUses: [
                'Grammarly GO or AI generative paragraph rewrites'
              ],
              instructorQuote: '“Proofreading typos is fine; letting an algorithm rewrite your sentences is not.”',
            }
          },
          {
            label: 'Can AI fix grammar in my own narrative?',
            question: 'Can AI fix the grammar in a literacy narrative I wrote myself?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No. Zero generative AI prose is permitted in this essay.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Your personal lived experience cannot be outsourced to a machine. Zero generative AI prose permitted.”',
            }
          }
        ]
      },
      {
        id: 'engl1110-a2',
        title: 'Essay 2: Rhetorical Analysis of Campus Discourse',
        dueDate: 'Oct 06, 2026',
        dueDateTimestamp: 1791244800000,
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Brainstorming & Critique Only',
        instructorComment: 'AI may be prompted to identify counter-arguments or critique your thesis. Zero AI-generated prose may appear in your draft.',
        syllabusClause: 'COAM Section 2: Brainstorming permitted with transcript link.',
        quickPrompts: [
          {
            label: 'Prompt AI to challenge my working thesis',
            question: 'Can I prompt an AI to play devil’s advocate against my rhetorical thesis statement?',
            response: {
              verdict: 'Allowed & Encouraged',
              verdictType: 'allowed',
              policySummary: 'Yes! Prof. Hilliard encourages testing arguments: "Identify 3 counterarguments a skeptic might raise to my thesis."',
              allowedUses: [
                'Using AI to pressure-test rhetorical strengths and weaknesses',
                'Brainstorming ethos, pathos, and logos connections'
              ],
              prohibitedUses: [
                'Copying AI-generated sentences into your draft',
                'Asking AI to draft your introductory paragraph'
              ],
              instructorQuote: '“Use AI as a sparring partner to test your ideas, but write every sentence yourself.”',
              citationTip: 'Add chat share link at the end of your Works Cited page.'
            }
          },
          {
            label: 'Can I paste an AI generated paragraph into my draft?',
            question: 'Can I copy an AI-generated paragraph explaining ethos into my essay draft?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Copying any AI-generated prose into your draft is strictly prohibited under the course policy. You must compose all text in your own words.',
              allowedUses: [
                'Reading conceptual explanations of rhetorical appeals'
              ],
              prohibitedUses: [
                'Copying AI sentences or paragraphs into submitted drafts'
              ],
              instructorQuote: '“Zero AI-generated prose may appear in your submitted draft.”',
            }
          },
          {
            label: 'Attaching Carmen chat share link',
            question: 'How do I attach my AI brainstorming transcript link to Essay 2?',
            response: {
              verdict: 'Mandatory Submission Step',
              verdictType: 'allowed',
              policySummary: 'Add an "AI Consultation Note" on the last page of your Word/PDF document with the public share link.',
              allowedUses: [
                'Generating a share link from ChatGPT/Claude and pasting it below Works Cited'
              ],
              prohibitedUses: [
                'Concealing AI brainstorming sessions'
              ],
              instructorQuote: '“Academic transparency is a core skill taught in First-Year Writing.”',
            }
          }
        ]
      },
      {
        id: 'engl1110-a3',
        title: 'Annotated Bibliography: Ohio Environmental Policy',
        dueDate: 'Oct 27, 2026',
        dueDateTimestamp: 1793059200000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited for Citations',
        instructorComment: 'LLMs hallucinate academic DOIs, journal volumes, and author quotes. All sources must be verified via OSU University Libraries search.',
        syllabusClause: 'COAM Section 3.4: Fabricated citations trigger mandatory COAM academic falsification review.',
        quickPrompts: [
          {
            label: 'Can AI find scholarly articles for me?',
            question: 'Can I ask ChatGPT to give me 5 scholarly articles on Lake Erie water quality?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Generative LLMs routinely invent plausible-sounding academic papers and non-existent DOIs. You must use Thompson Library research databases.',
              allowedUses: [
                'Searching library.osu.edu or Google Scholar',
                'Meeting with a Thompson Library research librarian'
              ],
              prohibitedUses: [
                'Using LLMs to generate citations or article summaries'
              ],
              instructorQuote: '“Citing a non-existent source is considered academic falsification under university rules.”',
            }
          },
          {
            label: 'Formatting MLA citations with AI',
            question: 'Can I paste verified article data into AI to format it into MLA 9 style?',
            response: {
              verdict: 'Allowed for Mechanical Formatting',
              verdictType: 'allowed',
              policySummary: 'Yes, formatting real verified source metadata into MLA 9 indentation is allowed. Double-check punctuation against Purdue OWL.',
              allowedUses: [
                'Checking MLA 9 hanging indents and italics',
                'Alphabetizing your bibliography entries'
              ],
              prohibitedUses: [
                'Allowing AI to write the critical annotation summary'
              ],
              instructorQuote: '“Mechanical formatting assistance is fine; annotation critique must be your own work.”',
            }
          },
          {
            label: 'Can I use AI-suggested sources if verified?',
            question: 'Can I use sources an AI suggested if I verify each one through OSU University Libraries?',
            response: {
              verdict: 'Permitted Within Course Rules',
              verdictType: 'allowed',
              policySummary: 'Yes, if you verify every source through OSU University Libraries, as the syllabus requires.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“LLMs hallucinate academic DOIs, journal volumes, and author quotes. All sources must be verified via OSU University Libraries search.”',
            }
          }
        ]
      },
      {
        id: 'engl1110-a4',
        title: 'Peer Review & Revision Plan',
        dueDate: 'Nov 10, 2026',
        dueDateTimestamp: 1794268800000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Human Peer Review Only',
        instructorComment: 'Peer feedback must be exchanged between registered OSU students in Carmen groups. Automated AI peer reviews are not accepted.',
        syllabusClause: 'Department Policy: Peer workshops require authentic community exchange.',
        quickPrompts: [
          {
            label: 'Can I upload a classmate’s paper to an AI?',
            question: 'Can I upload my peer review partner’s essay into an AI to generate feedback for them?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Uploading another student’s draft to a commercial AI model violates their intellectual property rights and course confidentiality rules.',
              allowedUses: [
                'Reading your partner’s essay and providing handwritten or typed comments directly in Carmen'
              ],
              prohibitedUses: [
                'Feeding a classmate’s writing into external AI servers'
              ],
              instructorQuote: '“Respect your peers’ intellectual property. Never upload a classmate’s work to an AI.”',
            }
          },
          {
            label: 'Can AI check my revision plan for typos?',
            question: 'Can I use AI to check my own revision plan for typos?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus only says automated AI peer reviews aren’t accepted. Check with your instructor about using AI on your own revision plan.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Peer feedback must be exchanged between registered OSU students in Carmen groups. Automated AI peer reviews are not accepted.”',
            }
          },
          {
            label: 'Can I run my partner’s draft through an AI detector?',
            question: 'Can I run my peer review partner’s draft through an AI detector?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus doesn’t cover AI detectors. Check with your instructor before uploading a classmate’s work anywhere.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“Peer feedback must be exchanged between registered OSU students in Carmen groups. Automated AI peer reviews are not accepted.”',
            }
          }
        ]
      },
      {
        id: 'engl1110-a5',
        title: 'Final Researched Argument Term Paper',
        dueDate: 'Dec 02, 2026',
        dueDateTimestamp: 1796169600000,
        aiStatus: 'partial_allowed',
        aiStatusLabel: 'Partial (Polishing & Review)',
        instructorComment: 'Proofreading suggestions allowed. Use MLA AI citation guidelines if any AI assistance was consulted.',
        syllabusClause: 'COAM Section 4: Final synthesis paper requires standard MLA 9 AI disclosure.',
        quickPrompts: [
          {
            label: 'Official MLA 9 AI citation format for term paper',
            question: 'What is the exact MLA 9 format if I consulted Claude or ChatGPT for paper structuring?',
            response: {
              verdict: 'Standard Citation Required',
              verdictType: 'allowed',
              policySummary: 'MLA 9 format: "Title of prompt." ChatGPT, 4o version, OpenAI, 24 Nov. 2026, chatgpt.com. In-text: ("Title of prompt").',
              allowedUses: [
                'Providing the standard MLA 9 Works Cited entry',
                'Describing the scope of assistance in your introductory notes'
              ],
              prohibitedUses: [
                'Listing AI as a co-author on your paper'
              ],
              instructorQuote: '“Citing AI properly demonstrates scholarly integrity under OSU writing standards.”',
              citationTip: 'Example: "Brainstorming transitions for section 2." Claude 3.5 Sonnet, Anthropic, 18 Nov. 2026, claude.ai/chat/xyz.'
            }
          },
          {
            label: 'Can I have AI generate my final term paper?',
            question: 'Can ChatGPT write the 8-page final researched argument paper for me?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Generating any portion of your term paper with AI is strictly prohibited and constitutes academic misconduct under university rules.',
              allowedUses: [
                'Testing transitions and checking paragraph flow with diagnostics'
              ],
              prohibitedUses: [
                'Allowing AI to draft paragraphs or compose arguments'
              ],
              instructorQuote: '“The final term paper must reflect your original critical thinking and scholarly voice.”',
            }
          },
          {
            label: 'Can AI review paragraph cohesion?',
            question: 'Can I ask an AI: "Are the transitions between my third and fourth paragraph smooth?"',
            response: {
              verdict: 'Allowed — Diagnostic Feedback',
              verdictType: 'allowed',
              policySummary: 'Yes, asking for feedback on cohesion is permitted as long as you write the revised sentences yourself.',
              allowedUses: [
                'Asking whether arguments flow logically between paragraphs',
                'Identifying where topic sentences could be clarified'
              ],
              prohibitedUses: [
                'Letting the AI write the transition sentences for you'
              ],
              instructorQuote: '“Listen to the critique, but craft the words yourself.”',
            }
          }
        ]
      }
    ]
  },
  {
    id: 'stat-3470',
    code: 'STAT 3470',
    name: 'Intro to Probability & Statistics for Engineers',
    professor: 'Dr. Darryl Woods',
    department: 'Department of Statistics',
    term: 'Autumn 2026',
    overallPolicy: 'OSU Statistics AI Policy: Modern engineers utilize coding assistants for R and Python plotting. Statistical interpretation, hypothesis test conclusions, and calculation derivations must be original student work.',
    assignments: [
      {
        id: 'stat3470-hw2',
        title: 'Homework 2: Discrete Probability Distributions',
        dueDate: 'Sep 18, 2026',
        dueDateTimestamp: 1789689600000,
        aiStatus: 'strictly_prohibited',
        aiStatusLabel: 'Strictly Prohibited (Show All Work)',
        instructorComment: 'All binomial and Poisson formulas must show complete handwritten algebraic derivations. AI solutions without work receive zero credit.',
        syllabusClause: 'COAM Section 2: Handwritten algebraic steps required.',
        quickPrompts: [
          {
            label: 'Can I copy AI solutions for my homework problems?',
            question: 'Can I paste my statistics homework problems into AI and copy the solutions to submit?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Copying AI solutions for homework problem sets is strictly prohibited. You must show handwritten derivations for all calculations.',
              allowedUses: [
                'Double-checking manual calculation results with a calculator or LLM after solving on paper',
                'Visiting Cockins Hall 132 Statistics Help Room for guidance'
              ],
              prohibitedUses: [
                'Copying AI-generated steps or submitting work you did not calculate yourself'
              ],
              instructorQuote: '“Show all work. A bare final answer with no intermediate handwritten steps receives zero credit.”',
            }
          },
          {
            label: 'Can AI solve the word problems for me?',
            question: 'Can I upload a screenshot of a textbook probability question to an AI?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Delegating word problem mathematical modeling to an AI circumvents the primary learning objective of STAT 3470.',
              allowedUses: [
                'Attending Statistics Help Room hours in Cockins Hall 132'
              ],
              prohibitedUses: [
                'Pasting problem set questions into LLMs'
              ],
              instructorQuote: '“Formulating probability models from word descriptions is what engineers are paid to do.”',
            }
          },
          {
            label: 'Can AI check my handwritten derivation?',
            question: 'Can AI check my handwritten derivation for mistakes after I finish it myself?',
            response: {
              verdict: 'Ask Your Instructor',
              verdictType: 'contact_instructor',
              policySummary: 'The syllabus requires full handwritten derivations and gives zero credit for AI solutions without work. Check with your instructor about AI checking your work.',
              allowedUses: [],
              prohibitedUses: [],
              instructorQuote: '“All binomial and Poisson formulas must show complete handwritten algebraic derivations. AI solutions without work receive zero credit.”',
            }
          }
        ]
      },
      {
        id: 'stat3470-lab3',
        title: 'R Lab 3: Central Limit Theorem Simulation',
        dueDate: 'Oct 09, 2026',
        dueDateTimestamp: 1791504000000,
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed (Coding & Plotting Assistance)',
        instructorComment: 'AI allowed for ggplot2 visualization and debugging R simulation loops. Written conclusions explaining convergence must be written by you.',
        syllabusClause: 'COAM Section 3.2: R syntax assistance allowed with code comment header.',
        quickPrompts: [
          {
            label: 'Ask AI for R ggplot simulation code',
            question: 'Can I ask ChatGPT to write the R code for plotting histogram overlays of sample means?',
            response: {
              verdict: 'Allowed with Code Comment',
              verdictType: 'allowed',
              policySummary: 'Yes! Generating ggplot2 code is fully approved. Add a comment above the code block indicating the tool used.',
              allowedUses: [
                'Prompting for R ggplot syntax, scale transformations, and legend styling',
                'Debugging tidyverse pipe `%>%` error traces',
                'Annotating code blocks with `# Generated with ChatGPT-4o, verified by [Name]`'
              ],
              prohibitedUses: [
                'Allowing AI to write the written interpretation of whether the Central Limit Theorem holds for skewed distributions',
                'Copying AI conclusions regarding standard error behavior'
              ],
              instructorQuote: '“Coding is a tool; interpretation is the engineering science. Use AI to plot the chart, but explain what it means in your own words.”',
              citationTip: 'Code comment: `# Code snippet adapted via ChatGPT-4o on Oct 07, 2026`'
            }
          },
          {
            label: 'Can AI interpret what my p-value means?',
            question: 'Can I ask an AI to write the final discussion paragraph interpreting my simulation results?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Having AI compose your statistical interpretation is strictly prohibited. The graded outcome is your ability to interpret statistical convergence in plain engineering terms.',
              allowedUses: [
                'Reviewing lecture slides on Central Limit Theorem conditions'
              ],
              prohibitedUses: [
                'Copy-pasting AI-generated discussion or conclusion text into your report'
              ],
              instructorQuote: '“If an AI writes your statistical interpretation, you will not receive credit for the analysis section.”',
            }
          },
          {
            label: 'Do I need to paste my R chat log in Carmen?',
            question: 'Do I need to include my entire R debugging chat in my knitted R Markdown PDF?',
            response: {
              verdict: 'Brief Comment Sufficient',
              verdictType: 'allowed',
              policySummary: 'No need for full chat transcripts for routine R syntax bugs. A single-sentence disclosure header at the top of your Rmd file is sufficient.',
              allowedUses: [
                'Adding a YAML header note: `ai_tools_used: "ChatGPT for ggplot theme debugging"`'
              ],
              prohibitedUses: [
                'Hiding substantial code generation'
              ],
              instructorQuote: '“A simple honest disclosure line at the top of your lab report is all we ask.”',
            }
          }
        ]
      },
      {
        id: 'stat3470-lab4',
        title: 'R Lab 4: Hypothesis Testing & ANOVA',
        dueDate: 'Oct 30, 2026',
        dueDateTimestamp: 1793318400000,
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed w/ Disclosure',
        instructorComment: 'AI permitted for ANOVA F-test plotting and R script troubleshooting. Stating null/alternative hypotheses and failure-to-reject rationales must be student work.',
        syllabusClause: 'COAM Section 3.4: R code assistance approved with comment tag.',
        quickPrompts: [
          {
            label: 'Ask AI for ANOVA Tukey HSD plot syntax',
            question: 'Can I ask an AI to generate the Tukey HSD post-hoc confidence interval plot in R?',
            response: {
              verdict: 'Allowed with Code Comment',
              verdictType: 'allowed',
              policySummary: 'Yes, generating plotting scripts for Tukey pairwise comparisons is allowed with a comment tag.',
              allowedUses: [
                'Prompting for R plot styling and axis labels'
              ],
              prohibitedUses: [
                'Letting AI decide which factor groups show statistically significant differences'
              ],
              instructorQuote: '“Generate the visualization with computational tools; state the engineering decision yourself.”',
            }
          },
          {
            label: 'Can an AI write my conclusion on metal tensile strength?',
            question: 'Can an AI write my conclusion regarding whether the metal tensile strength means differ?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Deciding whether to reject H0 based on alpha = 0.05 and interpreting real-world engineering consequences must be your original work.',
              allowedUses: [
                'Comparing the test statistic against the critical value from the F-table'
              ],
              prohibitedUses: [
                'Copying AI paragraphs on hypothesis conclusions'
              ],
              instructorQuote: '“Engineers make the call on material safety, not large language models.”',
            }
          },
          {
            label: 'Proper Rmd disclosure tag for Lab 4',
            question: 'Where do I put the AI disclosure in R Markdown?',
            response: {
              verdict: 'Standard Rmd Placement',
              verdictType: 'allowed',
              policySummary: 'Place it directly in the introductory markdown section before Question 1.',
              allowedUses: [
                'Writing: `*AI Disclosure: Claude 3.5 was consulted for R aov() and TukeyHSD() plotting syntax.*`'
              ],
              prohibitedUses: [
                'Submitting with zero disclosure'
              ],
              instructorQuote: '“Transparency in technical documentation is good engineering practice.”',
            }
          }
        ]
      },
      {
        id: 'stat3470-midterm2',
        title: 'Midterm 2 Practice & Diagnostics',
        dueDate: 'Nov 06, 2026',
        dueDateTimestamp: 1793923200000,
        aiStatus: 'study_prep_only',
        aiStatusLabel: 'Study Prep & Socratic Tutor Only',
        instructorComment: 'AI encouraged for generating extra practice problems and concept reviews. Exam itself is strictly closed-book with approved formula sheets.',
        syllabusClause: 'COAM Section 5: Study partner permitted; exams strictly proctored.',
        quickPrompts: [
          {
            label: 'Generate practice questions for Midterm 2',
            question: 'Can I ask an AI to create extra practice problems on two-sample t-tests?',
            response: {
              verdict: 'Allowed & Recommended',
              verdictType: 'allowed',
              policySummary: 'Yes, using AI to generate customized study drills on pooled vs Welch t-tests is approved.',
              allowedUses: [
                'Asking AI: "Generate 3 engineering practice problems testing two-sample hypothesis tests"'
              ],
              prohibitedUses: [
                'Accessing any device during the proctored midterm exam'
              ],
              instructorQuote: '“Generating extra practice problems is a fantastic way to prepare for exam day.”',
            }
          },
          {
            label: 'Can I use a smart device or AI during Midterm 2?',
            question: 'Can I bring a phone or smartwatch with AI capabilities into the midterm room?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. Midterm 2 is strictly closed-technology. Only approved scientific calculators (e.g. TI-30X IIS) are permitted.',
              allowedUses: [
                'Using the approved TI-30X IIS calculator'
              ],
              prohibitedUses: [
                'Smartwatches, phones, or programmable calculators'
              ],
              instructorQuote: '“Approved non-programmable calculators only in the examination room.”',
            }
          },
          {
            label: 'Explain Type I vs Type II errors with an analogy',
            question: 'Can I ask AI for intuitive analogies to remember Type I vs Type II errors?',
            response: {
              verdict: 'Allowed — Conceptual Learning',
              verdictType: 'allowed',
              policySummary: 'Yes! Conceptual analogies (e.g. courtroom trials, fire alarms) are great ways to master statistical definitions.',
              allowedUses: [
                'Asking for simplified conceptual breakdowns of alpha and beta risk'
              ],
              prohibitedUses: [
                'Relying solely on analogies without knowing the mathematical definitions'
              ],
              instructorQuote: '“Understanding error types conceptually prevents critical engineering mistakes.”',
            }
          }
        ]
      },
      {
        id: 'stat3470-proj',
        title: 'Final Engineering Regression Project',
        dueDate: 'Dec 07, 2026',
        dueDateTimestamp: 1796601600000,
        aiStatus: 'allowed_with_disclosure',
        aiStatusLabel: 'Allowed w/ Methodology Statement',
        instructorComment: 'Include a 1-paragraph AI Transparency disclosure stating which tools were used and for what phase (e.g. data wrangling, styling).',
        syllabusClause: 'COAM Section 6: Full methodology statement required in final report.',
        quickPrompts: [
          {
            label: 'Sample OSU COAM AI Transparency Statement',
            question: 'What does an official AI Transparency statement look like for our final regression report?',
            response: {
              verdict: 'Template Provided',
              verdictType: 'allowed',
              policySummary: 'Place a 1-paragraph statement before your References section detailing software, prompts, and verification methodology.',
              allowedUses: [
                'Using the official course template in your report appendix',
                'Using AI to assist in regex data wrangling and outlier filtering scripts'
              ],
              prohibitedUses: [
                'Generating fake regression tables or synthetic sample metrics'
              ],
              instructorQuote: '“Transparent documentation is a cornerstone of responsible open science.”',
              citationTip: 'Template: "AI Transparency: GitHub Copilot assisted with tidyr data reshaping. Claude 3.5 was consulted to verify linear model assumptions. All model interpretations and final conclusions are the original work of the author."'
            }
          },
          {
            label: 'Can AI draft my 1-page executive summary?',
            question: 'Can AI draft my 1-page executive summary based on my completed regression findings?',
            response: {
              verdict: 'NOT ALLOWED — Prohibited Activity',
              verdictType: 'prohibited',
              policySummary: 'No, this is not allowed. The executive summary tests your synthesis of engineering implications and stakeholder communication. It must be written by you.',
              allowedUses: [
                'Writing the summary yourself and asking a human classmate to peer-review for clarity'
              ],
              prohibitedUses: [
                'Prompting an AI to write the executive summary or abstract'
              ],
              instructorQuote: '“The executive summary is the most critical communication piece of the project. You must craft it yourself.”',
            }
          },
          {
            label: 'Clean messy CSV datasets with AI',
            question: 'Can I use an LLM or Python script generator to fix inconsistent dates and formatting in my dataset?',
            response: {
              verdict: 'Allowed — Data Wrangling',
              verdictType: 'allowed',
              policySummary: 'Yes, data tidying and datetime parsing are approved uses of AI, provided you inspect the cleaned dataframe for data loss.',
              allowedUses: [
                'Generating regex patterns for text normalization',
                'Writing R scripts to impute or drop missing values with explicit justification'
              ],
              prohibitedUses: [
                'Fabricating or imputing data points using generative hallucination'
              ],
              instructorQuote: '“Always run summary() on your dataframe to verify that automated cleaning did not drop valid observations.”',
            }
          }
        ]
      }
    ]
  }
];
