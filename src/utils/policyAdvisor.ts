import type { Course, Assignment } from '../types';

export interface GeneratedAdvice {
  verdict: string;
  verdictType: 'allowed' | 'prohibited' | 'caution' | 'out_of_scope' | 'contact_instructor';
  policySummary: string;
  allowedUses: string[];
  prohibitedUses: string[];
  instructorQuote: string;
  citationTip?: string;
  sourceReliedOn?: string;
  isSure?: boolean;
  sureReason?: string;
  suggestedContact?: string;
}

export function finalizeAdvice(
  advice: GeneratedAdvice,
  course: Course,
  assignment: Assignment
): GeneratedAdvice {
  if (advice.verdictType === 'prohibited') {
    advice.verdict = 'NOT ALLOWED — Prohibited Activity';
    if (
      !advice.policySummary.startsWith('No, this is not allowed') &&
      !advice.policySummary.startsWith('This is not allowed')
    ) {
      advice.policySummary = `No, this is not allowed. ${advice.policySummary}`;
    }
  }

  if (advice.verdictType === 'contact_instructor') {
    advice.isSure = false;
    advice.sureReason = 'The course syllabus does not cover study coaching or subject tutoring';
    advice.sourceReliedOn = 'The syllabus establishes policy and integrity expectations, but does not provide study coaching or conceptual tutoring.';
    advice.suggestedContact = `${course.professor} (${course.code} instructor) or your recitation TA`;
  } else if (advice.verdictType === 'out_of_scope') {
    advice.isSure = false;
    advice.sureReason = 'This question is not related to course policy or syllabus rules';
    advice.sourceReliedOn = 'The course syllabus does not cover general non-academic inquiries.';
    advice.suggestedContact = `${course.professor} for course inquiries`;
  } else {
    advice.isSure = true;
    advice.sureReason = `Directly grounded in ${course.code} syllabus policy clause`;
    advice.sourceReliedOn =
      advice.instructorQuote ||
      assignment.syllabusClause ||
      course.overallPolicy;
    advice.suggestedContact = `${course.professor} (${course.code} instructor) or TA`;
  }

  return advice;
}

/**
 * Checks if a question is related to the course subject or studying,
 * but asks for pedagogical / tutoring / study strategy coaching that CompassAI
 * cannot assist with (CompassAI only handles policy & AI rules).
 * Example: "How do I study for this?", "Can you explain this concept?", "How do I get an A?"
 */
function isSubjectTutoringOrStudyAdvice(query: string): boolean {
  const q = query.toLowerCase().trim();

  // If asking specifically about AI permission ("can I use AI to study", "is AI allowed for study"),
  // that's an AI policy query handled by syllabus guidelines.
  const isExplicitAIPermission =
    /\b(can i use (ai|chatgpt|claude|copilot|tools)|is (ai|chatgpt|claude) (allowed|permitted))\b/.test(
      q
    );
  if (isExplicitAIPermission) return false;

  // Study coaching / preparation queries:
  const isStudyQuestion =
    /\b(how do i study|how to study|how should i study|how can i study|best way to study|tips for study|study tips|how to prepare|how do i prepare|how should i prepare|how can i prepare)\b/.test(
      q
    ) ||
    /\b(how do i pass|how to pass|how do i get an a|how to do well|how can i succeed|tips to pass|how to ace)\b/.test(
      q
    ) ||
    /\b(how hard is (this|the)|is (this|the) (exam|test|class|course|midterm|quiz) (hard|difficult|easy))\b/.test(
      q
    );

  // Subject tutoring / conceptual explanation queries:
  const isTutoringQuestion =
    /\b(can you explain|explain to me|help me understand|teach me|can you teach|tutor me|can you tutor|what does .+ mean in lecture|how do i solve problem|why is my answer)\b/.test(
      q
    ) ||
    /\b(what should i write about|what topic should i choose|help me pick a topic)\b/.test(
      q
    );

  return isStudyQuestion || isTutoringQuestion;
}

/**
 * Checks if a question is outside the scope of CompassAI.
 * CompassAI is designed specifically for course policies, syllabi,
 * permitted/prohibited AI use, assignment expectations, and academic integrity.
 *
 * CRITICAL RULE: Even if a question mentions "Ohio State", "OSU", or "Buckeyes",
 * if it is about food, sports, weather, campus life, trivia, or non-academic topics,
 * it MUST be flagged as OUT OF SCOPE.
 */
function isUnrelatedToAppFunction(
  query: string,
  course: Course,
  assignment: Assignment
): boolean {
  const q = query.toLowerCase().trim();

  // If extremely short or empty
  if (q.length < 2) return true;

  // 1. Strict Unrelated Topic Veto
  // Any query touching these domains is immediately out of scope,
  // regardless of whether "Ohio State", "OSU", or "Buckeye" appears in the sentence.

  // A. Food, Cooking, Eating, Recipes, Restaurants, Snacks
  const isFoodOrCooking =
    /\b(sandwich|sandwiches|burger|burgers|pizza|pizzas|salad|salads|recipe|recipes|bake|baking|baked|cook|cooking|cooked|food|foods|eat|eating|meal|meals|snack|snacks|lunch|dinner|breakfast|dessert|desserts|cookie|cookies|candy|candies|bread|taco|tacos|sushi|pasta|meat|cheese|soup|drink|drinks|beverage|cocktail|smoothie|taste|tastes|flavor|flavors|chef|kitchen|ingredient|ingredients)\b/.test(
      q
    ) &&
    // Exception: specifically asking about Prof. Shepfer's office hours at Buckeye Donuts
    !((q.includes('office hour') || q.includes('office hours') || q.includes('shepfer')) && q.includes('donut'));

  if (isFoodOrCooking) return true;

  // B. Sports, Athletics, Scores, Games, Football, Mascots
  const isSports =
    /\b(football|basketball|baseball|hockey|soccer|tennis|golf|volleyball|quarterback|touchdown|stadium|tailgate|athletics|athlete|athletes|coach|ryan day|super bowl|nba|nfl|mlb|world cup|olympics|game score|who won|score of the game|championship|mascot|brutus)\b/.test(
      q
    );

  if (isSports) return true;

  // C. Weather, Forecast, Meteorology
  const isWeather =
    /\b(weather|forecast|temperature|rain|raining|snow|snowing|sunny|cloudy|humidity|degrees|storm|tornado|hurricane|wind|windy|umbrella)\b/.test(
      q
    );

  if (isWeather) return true;

  // D. Pop Culture, Entertainment, Music, Movies, Celebrities, Video Games
  const isPopCulture =
    /\b(movie|movies|film|films|cinema|actor|actors|actress|actresses|celebrity|celebrities|singer|singers|song|songs|music|band|album|concert|taylor swift|drake|kanye|hollywood|netflix|hulu|spotify|video game|video games|gaming|playstation|xbox|nintendo|fortnite|minecraft)\b/.test(
      q
    );

  if (isPopCulture) return true;

  // E. Casual Chit-Chat, Jokes, Personal questions to the bot
  const isChitChatOrJoke =
    /\b(tell me a joke|tell a joke|make me laugh|knock knock|how are you|how is it going|what's up|how're you doing|are you human|are you real|do you love me|sing a song|tell a story|what is your favorite|favorite movie|favorite food|favorite color|favorite song|marry me|do you like)\b/.test(
      q
    );

  if (isChitChatOrJoke) return true;

  // F. Non-academic Campus Life, Housing, Parking, Financial Aid, Admissions
  const isCampusServices =
    /\b(dorm|dorms|dormitory|roommate|roommates|housing|dining hall|meal plan|gym|rpac|workout|parking permit|parking pass|park on campus|tuition|financial aid|scholarship|scholarships|admissions|apply to osu|fraternity|sororities|sorority|greek life|cabs bus|bus route|campus transit)\b/.test(
      q
    );

  if (isCampusServices) return true;

  // G. Commerce, Shopping, Travel, Personal relationships
  const isCommerceOrTravel =
    /\b(book a flight|hotel reservation|buy tickets|merchandise|merch|jersey|jerseys|bookstore|cryptocurrency|bitcoin|crypto|stock market|dating|relationship|romance)\b/.test(
      q
    );

  if (isCommerceOrTravel) return true;

  // H. Creative writing unrelated to coursework
  const isCreativeWriting =
    /\b(write a poem|write a song|write a rap|write a bedtime story|write a fiction)\b/.test(
      q
    );

  if (isCreativeWriting) return true;

  // I. General World Trivia & Facts
  const isGeneralTrivia =
    /\b(capital of|president of|prime minister|speed of light|distance to|how tall is|who invented|who discovered|population of|currency of)\b/.test(
      q
    );

  if (isGeneralTrivia) return true;

  // J. General Math equations / riddles
  if (/^what is \d+\s*[\+\-\*\/]\s*\d+/.test(q) || /^solve \d+x/.test(q)) {
    return true;
  }

  // 2. Positive Verification: Does the query contain genuine academic course/AI policy intent?
  // Simply containing "ohio state" or "osu" or "how do i" is NOT sufficient!

  // A. Mentions AI or computational tool
  const hasAIIntent =
    /\b(ai|artificial intelligence|chatgpt|gpt|claude|gemini|copilot|llm|bot|bots|quillbot|grammarly|turnitin|chegg|generator|generative|prompt|prompts|prompting|autocomplete|dall-e|midjourney|sora)\b/.test(
      q
    );

  // B. Mentions course syllabus, policies, rules, integrity, or COAM
  const hasPolicyOrIntegrityIntent =
    /\b(syllabus|policy|policies|rule|rules|guideline|guidelines|coam|integrity|misconduct|plagiarism|cheat|cheating|honor code|dishonesty|violation|penalty|penalties|consequence|referral|unauthorized)\b/.test(
      q
    );

  // C. Direct coursework permission queries ("allowed", "permitted", "prohibited", "banned", "can I use", etc.)
  const hasPermissionIntent =
    /\b(allowed|allow|permitted|permit|prohibited|prohibit|banned|ban)\b/.test(q) ||
    /\b(can i use|can we use|is it allowed|am i allowed|are we allowed|is it ok to use|can i submit|can we submit|can i copy|can we copy|can i turn in)\b/.test(
      q
    );

  // D. Academic citation & disclosure
  const hasCitationIntent =
    /\b(cite|citation|citations|disclose|disclosure|disclosures|transparency|mla|apa|readme|works cited|bibliography|appendix|footnote)\b/.test(
      q
    );

  // E. Course grading, deadlines, office hours, logistics
  const hasCourseLogisticsIntent =
    /\b(due date|due dates|when is it due|when is due|deadline|deadlines|late penalty|grace period|rubric|points|point|deduction|office hour|office hours|recitation|carmen|canvas|carmencanvas|top hat|tophat|grade|grades|grading|drop|dropped|makeup|make-up)\b/.test(
      q
    );

  // F. Specific coursework assignment terms combined with academic intent
  const currentAssignmentWords = assignment.title.toLowerCase().split(/[\s:()]+/);
  let matchesAssignment = false;
  for (const word of currentAssignmentWords) {
    if (word.length >= 4 && q.includes(word)) {
      matchesAssignment = true;
      break;
    }
  }

  const hasAssignmentContext =
    matchesAssignment ||
    /\b(assignment|homework|hw|project|lab|quiz|exam|midterm|final|test|paper|essay|draft|speech|presentation|handout|resume|interview|negotiation|linkedin|survey|pitch|case study|problem set)\b/.test(
      q
    );

  // A query is valid ONLY if it expresses at least one valid course/policy intent
  if (
    hasAIIntent ||
    hasPolicyOrIntegrityIntent ||
    hasPermissionIntent ||
    hasCitationIntent ||
    hasCourseLogisticsIntent ||
    (hasAssignmentContext &&
      /\b(when|what|how|why|can|instructions|help|rules|scoring|points|criteria|submission|format|guide|turn in|due)\b/.test(
        q
      ))
  ) {
    return false; // Valid, within scope of CompassAI!
  }

  // If no course policy or academic intent was found, it is OUT OF SCOPE
  return true;
}

export function generatePolicyAdvice(
  question: string,
  course: Course,
  assignment: Assignment,
  studentName: string
): GeneratedAdvice {
  const q = question.toLowerCase();

  // 1. Check matching quick prompts first
  if (Array.isArray(assignment?.quickPrompts)) {
    for (const qp of assignment.quickPrompts) {
      if (
        q.includes(qp.label.toLowerCase()) ||
        q.includes(qp.question.toLowerCase().slice(0, 20))
      ) {
        let advice: GeneratedAdvice = { ...qp.response };
        return finalizeAdvice(advice, course, assignment);
      }
    }
  }

  // 2. Check if the question is related to the course subject, but asks for study coaching / tutoring that CompassAI cannot provide
  // (e.g. "how do I study for this?", "how to get an A?", "can you explain this topic?")
  if (isSubjectTutoringOrStudyAdvice(question)) {
    return finalizeAdvice(
      {
        verdict: 'Ask Professor or TA — Subject Query',
        verdictType: 'contact_instructor',
        policySummary:
          `I am unsure how to help with this question. While this is related to your course subject, CompassAI is specifically designed to clarify syllabus policies and AI boundaries, rather than provide study coaching or subject-matter tutoring.\n\nFor study strategies, exam preparation, and conceptual tutoring for ${course.code}, please reach out directly to ${course.professor} or your recitation teaching assistants.\n\nRecommended next steps:\n• Attend office hours: ${
            course.id === 'busmhr-2292'
              ? 'Prof. Shepfer holds office hours Tuesdays 6:30–7:30 AM (Buckeye Donuts) and Wednesdays 2:05–3:00 PM (Fisher Hall 352)'
              : `Check Carmen for ${course.professor}’s posted office hour times and locations`
          }\n• Ask your recitation leader / TA during recitation or lab sessions\n• Post questions on the CarmenCanvas discussion board or visit campus academic resources (e.g. Dennis Learning Center for study strategies)`,
        allowedUses: [
          `Attending instructor or TA office hours for one-on-one study guidance`,
          `Asking your recitation leader for recommended study strategies for ${assignment.title}`,
          `Forming study groups with classmates enrolled in ${course.code}`
        ],
        prohibitedUses: [],
        instructorQuote: `“CompassAI is focused on academic policy. For subject-matter learning and study strategies, your professor and TAs are your best resource.”`,
      },
      course,
      assignment
    );
  }

  // 3. Check if the question is unrelated to the function of CompassAI
  // This explicitly catches "how to make an ohio state sandwich", weather, sports, etc.
  if (isUnrelatedToAppFunction(question, course, assignment)) {
    return finalizeAdvice(
      {
        verdict: 'OUT OF SCOPE — Not Related to App Function',
        verdictType: 'out_of_scope',
        policySummary:
          `This app does not answer those types of questions. CompassAI is specifically designed to help students navigate course syllabi, verify instructor AI policies, and understand assignment guidelines and COAM academic integrity rules for your enrolled courses.\n\nEven if a question mentions Ohio State or general university topics (such as dining, sports, or campus life), CompassAI only answers questions regarding course policies, permitted AI tools, assignment requirements, and academic integrity for ${course.code} (${course.name}).\n\nPlease ask questions related to your syllabus or assignments, such as whether AI is permitted for drafting, coding, or brainstorming, or how to cite tools under course rules.`,
        allowedUses: [
          `Checking whether AI is permitted for ${assignment.title}`,
          `Asking how to properly disclose or cite AI tools under Ohio State COAM rules`,
          `Verifying instructor expectations, deadlines, and submission rules for ${course.code}`,
          `Asking what counts as unauthorized academic assistance or misconduct`
        ],
        prohibitedUses: [],
        instructorQuote: `“CompassAI is dedicated to keeping you compliant with Ohio State academic integrity rules and ${course.professor}’s course syllabus.”`,
        citationTip: `Tip: Try asking "Can I use AI to brainstorm ideas for ${assignment.title}?" or "How do I cite ChatGPT under COAM rules?"`
      },
      course,
      assignment
    );
  }

  // 4. Explicit check: Did the student ask the AI to do their work, cheat, or bypass rules?
  const asksToCheatOrGenerateWholeWork =
    q.includes('write my') ||
    q.includes('do my') ||
    q.includes('solve my') ||
    q.includes('take my') ||
    q.includes('build my') ||
    q.includes('generate my') ||
    q.includes('can you do') ||
    q.includes('can you write') ||
    q.includes('can you solve') ||
    q.includes('can you build') ||
    q.includes('can i copy') ||
    q.includes('give me the answers') ||
    q.includes('give me answers') ||
    q.includes('cheat') ||
    q.includes('bypass') ||
    q.includes('hide ai') ||
    q.includes('turnitin');

  if (asksToCheatOrGenerateWholeWork) {
    return {
      verdict: 'NOT ALLOWED — Prohibited Activity',
      verdictType: 'prohibited',
      policySummary: `No, this is not allowed. You cannot have AI write, solve, build, or complete your assignment for you. Under Ohio State University COAM rules (Section 3335-23-04) and ${course.professor}’s syllabus, all submitted work, presentations, calculations, code, and answers must be authored by you.`,
      allowedUses: [
        'Brainstorming ideas, outlines, and pressure-testing concepts',
        'Visiting course office hours or campus academic resources for human assistance',
        'Formulating your own arguments and writing every sentence yourself'
      ],
      prohibitedUses: [
        'Having an AI write your paper, case analysis, or speech script',
        'Copy-pasting AI output into your submission',
        'Using paraphrasing software (e.g. QuillBot) to mask AI-generated text',
        'Submitting work you cannot explain or defend in person'
      ],
      instructorQuote: `“${course.professor}: Employing these tools as supplementary aids is one thing, but outsourcing your coursework is strictly prohibited and subject to COAM referral.”`,
      citationTip: 'If you use AI for ideation, be transparent and disclose it in your submission notes.'
    };
  }

  // 5. Check for exam / quiz during proctoring queries
  if (
    q.includes('exam') ||
    q.includes('test') ||
    q.includes('midterm') ||
    q.includes('quiz')
  ) {
    if (
      q.includes('during') ||
      q.includes('while taking') ||
      q.includes('in exam') ||
      q.includes('answers') ||
      q.includes('cheat') ||
      q.includes('phone') ||
      q.includes('smartwatch')
    ) {
      return {
        verdict: 'NOT ALLOWED — Prohibited Activity',
        verdictType: 'prohibited',
        policySummary: `No, this is not allowed. Using AI or any outside device during exams or quizzes is strictly not allowed. All exams and quizzes in ${course.code} are closed-book and proctored. Any unauthorized device or AI usage results in immediate referral to COAM.`,
        allowedUses: [
          'Using AI beforehand as a study tutor to create practice flashcards or conceptual drills'
        ],
        prohibitedUses: [
          'Opening AI tools, secondary tabs, or devices during any quiz or exam session',
          'Attempting to look up exam questions with AI'
        ],
        instructorQuote: `“${course.professor}: Exams are closed book and closed note in a proctored environment. Zero unauthorized aids permitted.”`
      };
    }

    // General exam study inquiry
    return {
      verdict: 'Study Preparation Allowed / In-Exam Use NOT ALLOWED',
      verdictType: 'caution',
      policySummary: `AI can serve as an interactive practice tutor prior to the exam, but during the exam itself, AI is strictly NOT allowed.`,
      allowedUses: [
        'Prompting AI to generate practice questions testing syllabus topics',
        'Asking for step-by-step conceptual explanations during study sessions',
        'Using Socratic tutoring prompts to test your retention'
      ],
      prohibitedUses: [
        'Accessing any AI or connected device during exam testing periods',
        'Sharing exam questions or prompts to AI platforms during test windows'
      ],
      instructorQuote: `“${course.professor}: AI is a helpful study partner, but exams evaluate what you have retained in your own memory.”`
    };
  }

  // 6. Check for citation / disclosure queries
  if (
    q.includes('cite') ||
    q.includes('citation') ||
    q.includes('disclose') ||
    q.includes('transparency') ||
    q.includes('readme')
  ) {
    return {
      verdict: 'Required Transparency Protocol',
      verdictType: 'allowed',
      policySummary: `For ${course.code} (${assignment.title}), all permitted AI assistance must be explicitly documented with date, tool name, and purpose.`,
      allowedUses: [
        'Including an AI disclosure note or appendix in your submission',
        'Stating exactly which prompts were run and which suggestions were adapted',
        'Saving your chat history links or screenshots as proof of honest process'
      ],
      prohibitedUses: [
        'Hiding or obscuring the use of generative AI tools',
        'Falsely claiming AI-generated output as 100% unaided independent work'
      ],
      instructorQuote: `“${course.professor}: Transparency is the foundation of academic trust. Disclosing your tool usage protects you from Ohio State COAM review.”`,
      citationTip: `Template: "Assisted by [Tool Name] on [Date] for [purpose, e.g., debugging/brainstorming]. All core logic was independently written by ${studentName}."`
    };
  }

  // 7. Check for text spinning / QuillBot / rewrite tools
  if (
    q.includes('quillbot') ||
    q.includes('spin') ||
    q.includes('paraphras') ||
    q.includes('rewrite my whole') ||
    q.includes('bypass turnitin')
  ) {
    return {
      verdict: 'NOT ALLOWED — Prohibited Activity',
      verdictType: 'prohibited',
      policySummary: `No, this is not allowed. Using QuillBot or automated paraphrasing tools to disguise text or rewrite sentences is strictly not allowed and triggers immediate academic misconduct reviews under OSU COAM policies.`,
      allowedUses: [
        'Standard spellcheck (red squiggly lines) in Google Docs or Microsoft Word',
        'Basic punctuation and capitalization corrections'
      ],
      prohibitedUses: [
        'QuillBot or automated text-spinners',
        'AI generative sentence restructuring tools',
        'Using tools to bypass AI detection software'
      ],
      instructorQuote: `“${course.professor}: Mechanical spellcheck is acceptable; using automated style spinners alters your authentic voice and violates integrity rules.”`
    };
  }

  // 8. Check for writing / text generation
  if (
    q.includes('write') ||
    q.includes('essay') ||
    q.includes('paragraph') ||
    q.includes('draft') ||
    q.includes('sentences')
  ) {
    if (assignment.aiStatus === 'strictly_prohibited') {
      return {
        verdict: 'NOT ALLOWED — Prohibited Activity',
        verdictType: 'prohibited',
        policySummary: `No, this is not allowed. Under ${course.code} course regulations and OSU COAM rules, generative prose is strictly not allowed for ${assignment.title}. Every sentence must be written by you.`,
        allowedUses: [
          'Developing your own thesis and outline by hand',
          'Attending professor office hours or the OSU Writing Center (Smith Lab)',
          'Using lecture notes and approved primary/secondary readings'
        ],
        prohibitedUses: [
          'Using ChatGPT, Claude, Gemini, or any LLM to draft sentences or paragraphs',
          'Using AI spinning or automated paraphrasing tools (e.g. QuillBot)',
          'Copying AI summaries into your paper'
        ],
        instructorQuote: `“${course.professor}: The entire purpose of this assignment is developing your intellectual voice. Outsourcing the writing violates OSU academic integrity standards.”`
      };
    } else {
      return {
        verdict: 'Caution — Ideation Permitted, Generative Text NOT ALLOWED',
        verdictType: 'caution',
        policySummary: `You may bounce ideas or pressure-test arguments, but having AI generate text for your final submission is NOT allowed. You must write every sentence yourself.`,
        allowedUses: [
          'Prompting for counter-arguments or alternate perspectives',
          'Testing outline hierarchy and logical progression',
          'Asking: "What questions might a skeptical reader ask about this argument?"'
        ],
        prohibitedUses: [
          'Pasting AI-generated text directly into your draft',
          'Using AI tools to expand bullet points into paragraphs'
        ],
        instructorQuote: `“${course.professor}: Use AI as a sounding board, not a ghostwriter. You must compose every line of text yourself.”`,
        citationTip: 'Disclose your ideation session in your bibliography or submission notes.'
      };
    }
  }

  // 9. Check for coding / debugging queries
  if (
    q.includes('code') ||
    q.includes('debug') ||
    q.includes('error') ||
    q.includes('syntax') ||
    q.includes('loop') ||
    q.includes('function') ||
    q.includes('bug')
  ) {
    if (assignment.aiStatus === 'strictly_prohibited') {
      return {
        verdict: 'NOT ALLOWED — Prohibited Activity',
        verdictType: 'prohibited',
        policySummary: `No, this is not allowed. For ${assignment.title}, all algorithmic logic and debugging must be performed independently without automated code generators.`,
        allowedUses: [
          'Adding manual print / log statements to track variable states',
          'Visiting teaching assistant office hours or peer tutors in Caldwell Lab',
          'Reviewing course lecture slides on syntax'
        ],
        prohibitedUses: [
          'Pasting code into an LLM and asking to fix bugs',
          'Using GitHub Copilot or AI code autocompletion',
          'Prompting for algorithm implementations'
        ],
        instructorQuote: `“${course.professor}: Building the cognitive muscle to trace bugs is the primary objective of this project.”`
      };
    } else {
      return {
        verdict: 'Allowed for Error Diagnosis & Syntax Clarification',
        verdictType: 'allowed',
        policySummary: `You may feed error traces and syntax questions to AI to understand compiler feedback, but having AI write core algorithms or methods is NOT allowed.`,
        allowedUses: [
          'Pasting compiler stack traces to understand error definitions',
          'Asking: "What causes this specific error in standard library methods?"',
          'Reviewing syntax for built-in standard data structures'
        ],
        prohibitedUses: [
          'Asking AI to implement the assignment’s core logic or game mechanics',
          'Letting AI generate the full class structure or algorithm',
          'Submitting code you cannot verbally explain in office hours'
        ],
        instructorQuote: `“${course.professor}: Error diagnostics are fine. However, you must write the actual fix and logic yourself.”`,
        citationTip: 'Add an inline comment: `// Diagnostic query on error trace consulted via AI. Logic authored independently.`'
      };
    }
  }

  // 10. Check for spellcheck / grammar queries
  if (
    q.includes('grammar') ||
    q.includes('spell') ||
    q.includes('grammarly') ||
    q.includes('proofread')
  ) {
    return {
      verdict: 'Caution — Mechanical Spellcheck OK, Generative Rephrase NOT ALLOWED',
      verdictType: 'caution',
      policySummary: `Basic typo and spelling checks are accepted across all courses. Generative rewriting or tone changes are NOT allowed.`,
      allowedUses: [
        'Standard spellcheck (red squiggly lines) in Google Docs or Microsoft Word',
        'Basic punctuation and capitalization corrections'
      ],
      prohibitedUses: [
        'Using "Rewrite in Academic Tone" or "Fluency Enhancer" AI filters',
        'QuillBot or text-spinners'
      ],
      instructorQuote: `“${course.professor}: Mechanical corrections are acceptable; changing your phrasing with AI alters your rhetorical authenticity.”`
    };
  }

  // 11. Default tailored advice based on assignment policy
  let fallbackAdvice: GeneratedAdvice;

  if (assignment.aiStatus === 'strictly_prohibited') {
    fallbackAdvice = {
      verdict: 'NOT ALLOWED — Prohibited for This Assignment',
      verdictType: 'prohibited',
      policySummary: `No, this is not allowed. For ${course.code} - ${assignment.title}, the syllabus explicitly prohibits all generative AI usage. This assignment evaluates independent student mastery.`,
      allowedUses: [
        'Consulting textbook chapters and primary course lecture materials',
        'Attending professor and TA office hours for direct human coaching',
        'Working through problems with pencil and paper'
      ],
      prohibitedUses: [
        'Any generative LLM prompts (ChatGPT, Claude, Gemini, Copilot)',
        'AI-based summarization, outline creation, or problem solving',
        'Paraphrasing or modifying AI outputs'
      ],
      instructorQuote: `“${course.professor}: ${assignment.instructorComment}”`,
      citationTip: 'If you have questions about specific tools, contact your instructor or recitation leader directly.'
    };
  } else if (assignment.aiStatus === 'study_prep_only') {
    fallbackAdvice = {
      verdict: 'Socratic Study & Practice Permitted',
      verdictType: 'allowed',
      policySummary: `For ${course.code} - ${assignment.title}, AI is permitted exclusively as a study tutor or hint coach, but generating graded submissions with AI is NOT allowed.`,
      allowedUses: [
        'Asking AI to quiz you or ask guiding conceptual questions',
        'Requesting simplified analogies for challenging course theories',
        'Generating extra practice problems for self-assessment'
      ],
      prohibitedUses: [
        'Requesting direct answers to homework or problem set items',
        'Copying AI solutions into your submitted work'
      ],
      instructorQuote: `“${course.professor}: ${assignment.instructorComment}”`
    };
  } else {
    fallbackAdvice = {
      verdict: 'Permitted with Policy Guidelines & Disclosure',
      verdictType: 'allowed',
      policySummary: `For ${course.code} - ${assignment.title}, AI usage is permitted within defined bounds as an innovation and supplementary aid. Be sure to follow required citation and transparency steps.`,
      allowedUses: [
        'Idea generation, brainstorming, and structuring frameworks',
        'Syntax checking and debugging error explanations',
        'Documenting prompts in your submission disclosure'
      ],
      prohibitedUses: [
        'Uncredited copy-pasting of AI outputs',
        'Passing off generative AI work as personal original insight'
      ],
      instructorQuote: `“${course.professor}: ${assignment.instructorComment}”`,
      citationTip: `Include an AI disclosure note stating tool, prompt, and date in your final submission.`
    };
  }

  // Universal guarantee: If any prohibited verdict is returned, ensure it explicitly says "No, this is not allowed."
  if (fallbackAdvice.verdictType === 'prohibited') {
    fallbackAdvice.verdict = 'NOT ALLOWED — Prohibited Activity';
    if (
      !fallbackAdvice.policySummary.startsWith('No, this is not allowed') &&
      !fallbackAdvice.policySummary.startsWith('This is not allowed')
    ) {
      fallbackAdvice.policySummary = `No, this is not allowed. ${fallbackAdvice.policySummary}`;
    }
  }

  return finalizeAdvice(fallbackAdvice, course, assignment);
}
