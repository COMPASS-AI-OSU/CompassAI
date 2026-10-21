import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePolicyAdvice } from './src/utils/policyAdvisor.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Live Gemini endpoint for course syllabus AI policy questions.
 * Grounded strictly in the course syllabus provided.
 */
app.post('/api/gemini/advisor', async (req, res) => {
  const { question, course, assignment, studentName } = req.body;

  if (!question || !course || !assignment) {
    return res.status(400).json({ error: 'Missing required question, course, or assignment data' });
  }

  // System instruction matching user AI step spec
  const systemInstruction = `You are CompassAI, an academic assistant for Ohio State University courses.
Input: You will receive questions related to a college course.

Instructions:
Take syllabus based questions, and answer them based on the syllabus, clarifying anything about AI policy, and help students implement AI appropriately based on professors guidance.

Must only rely on syllabi and not external sources for answering.

Output should be concise, answering the users question, without doing any work on the actual assignment or any "hypothetical" assignments the user may ask. Strictly answer the question, and do not make any assumptions outside of the syllabi. Admit when you are unsure and prompt the student to contact their professor.

Must never do work for the student, answer any inappropriate or off-topic questions.

Special Policies:
1. Prohibited Actions: If the student asks to do something prohibited (such as asking AI to write essays, complete homework, solve quizzes/exams, copy code, use QuillBot, or use AI on an assignment where it is forbidden), you MUST specifically state right at the start of the answer that it is NOT ALLOWED (e.g. "No, this is not allowed...").
2. Off-Topic / Irrelevant to App: If a question is not related to course policy, syllabus, assignment expectations, or AI rules (e.g. questions about food, sports, weather, making a sandwich—even if Ohio State is mentioned), classify verdictType as "out_of_scope". State clearly that this app does not answer those types of questions, that CompassAI only handles course policies, and do not answer the off-topic query.
3. Subject Tutoring / Study Advice: If someone asks a question related to the subject but not covered in the syllabus (such as "How do I study for this?", "How do I get an A?", "Can you explain this concept?"), do NOT give an out-of-scope response and do NOT provide tutoring advice. Set verdictType to "contact_instructor", set isSure to false, state that you are unsure how to help with subject tutoring/study advice, and prompt the student to contact their professor or TA.
4. Source Grounding & Certainty:
   - Identify the exact part of the syllabus source it relied on (quote the specific clause, rule, or state "The course syllabus does not cover this question").
   - Clearly state whether you are sure (isSure: true/false).
   - If the syllabus doesn't cover the question, admit you are unsure, say so clearly, and suggest who to ask instead of guessing.`;

  // Build the complete syllabus source material for grounding
  const syllabusSourceMaterial = `
COURSE SYLLABUS & POLICY SOURCE MATERIAL:
Course: ${course.code} - ${course.name}
Department: ${course.department}
Professor: ${course.professor}
Term: ${course.term}

Overall Course Syllabus Statement & AI Policy:
${course.overallPolicy}

Current Assignment in Focus:
Title: ${assignment.title}
Due Date: ${assignment.dueDate}
AI Policy Classification: ${assignment.aiStatusLabel} (${assignment.aiStatus})
Instructor Guidance: ${assignment.instructorComment}
Syllabus Excerpt / Clause: ${assignment.syllabusClause || 'See overall course policy statement.'}

Other Assignments in this Course (for reference):
${(course.assignments || [])
  .map(
    (a: { title: string; dueDate: string; aiStatusLabel: string; instructorComment: string }) =>
      `- ${a.title} (Due: ${a.dueDate}): ${a.aiStatusLabel}. Note: ${a.instructorComment}`
  )
  .join('\n')}

STUDENT ENROLLED: ${studentName || 'Student'}

STUDENT QUESTION:
"${question}"
`;

  try {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured. Falling back to local syllabus policy engine.');
      const localAdvice = generatePolicyAdvice(question, course, assignment, studentName || 'Student');
      return res.json({
        answer: localAdvice.policySummary,
        sourceReliedOn: localAdvice.sourceReliedOn || localAdvice.instructorQuote || assignment.syllabusClause || course.overallPolicy,
        isSure: localAdvice.isSure !== undefined ? localAdvice.isSure : (localAdvice.verdictType !== 'contact_instructor' && localAdvice.verdictType !== 'out_of_scope'),
        sureReason: localAdvice.sureReason || (localAdvice.verdictType === 'contact_instructor' ? 'The syllabus does not cover study coaching or tutoring' : 'Grounded in course syllabus policy'),
        suggestedContact: localAdvice.suggestedContact || `${course.professor} or your recitation TA`,
        verdictType: localAdvice.verdictType,
        allowedUses: localAdvice.allowedUses || [],
        prohibitedUses: localAdvice.prohibitedUses || [],
      });
    }

    // Attempt live Gemini with timeout so upstream traffic spikes or 503 never hang the user
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let parsed: any = null;

    const generateWithTimeout = async () => {
      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: syllabusSourceMaterial,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  answer: {
                    type: Type.STRING,
                    description:
                      "Concise, direct answer answering the user's question without doing any work on the actual assignment.",
                  },
                  sourceReliedOn: {
                    type: Type.STRING,
                    description:
                      "The specific part, section, or quote of the course syllabus relied on. If the source doesn't cover the question, state 'The course syllabus does not cover this question'.",
                  },
                  isSure: {
                    type: Type.BOOLEAN,
                    description:
                      'True if the syllabus explicitly covers this question; False if unsure or if the syllabus does not cover it.',
                  },
                  sureReason: {
                    type: Type.STRING,
                    description:
                      'Brief note on certainty, explaining whether and why it is sure or unsure based on syllabus coverage.',
                  },
                  suggestedContact: {
                    type: Type.STRING,
                    description:
                      'Who to contact if unsure or if the source does not cover it (e.g. professor name and TA).',
                  },
                  verdictType: {
                    type: Type.STRING,
                    description:
                      'One of: allowed, prohibited, caution, out_of_scope, contact_instructor',
                  },
                  allowedUses: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Permitted activities under syllabus guidelines if applicable.',
                  },
                  prohibitedUses: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Prohibited actions under syllabus guidelines if applicable.',
                  },
                },
                required: [
                  'answer',
                  'sourceReliedOn',
                  'isSure',
                  'sureReason',
                  'suggestedContact',
                  'verdictType',
                ],
              },
            },
          });

          const responseText = response.text?.trim();
          if (responseText) {
            return JSON.parse(responseText);
          }
        } catch (modelErr: any) {
          console.warn(`Attempt with ${model} failed, trying fallback:`, modelErr?.message || modelErr);
        }
      }
      return null;
    };

    let timer: any;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini API call timed out after 7000ms')), 7000);
    });

    try {
      parsed = await Promise.race([generateWithTimeout(), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }

    if (!parsed) {
      throw new Error('All live Gemini model attempts were unavailable');
    }

    // If prohibited, ensure explicit "No, this is not allowed" statement (Request 5)
    if (parsed.verdictType === 'prohibited') {
      if (
        !parsed.answer.startsWith('No, this is not allowed') &&
        !parsed.answer.startsWith('This is not allowed')
      ) {
        parsed.answer = `No, this is not allowed. ${parsed.answer}`;
      }
    }

    return res.json({
      answer: parsed.answer,
      sourceReliedOn: parsed.sourceReliedOn,
      isSure: parsed.isSure,
      sureReason: parsed.sureReason,
      suggestedContact: parsed.suggestedContact || `${course.professor} or your recitation TA`,
      verdictType: parsed.verdictType || 'caution',
      allowedUses: parsed.allowedUses || [],
      prohibitedUses: parsed.prohibitedUses || [],
    });
  } catch (error) {
    console.error('Error in live Gemini call:', error);
    try {
      // Reliable fallback so app never breaks
      const fallbackAdvice = generatePolicyAdvice(question, course, assignment, studentName || 'Student');
      return res.json({
        answer: fallbackAdvice.policySummary,
        sourceReliedOn: fallbackAdvice.sourceReliedOn || fallbackAdvice.instructorQuote || assignment.syllabusClause || course.overallPolicy,
        isSure: fallbackAdvice.isSure !== undefined ? fallbackAdvice.isSure : (fallbackAdvice.verdictType !== 'contact_instructor' && fallbackAdvice.verdictType !== 'out_of_scope'),
        sureReason: fallbackAdvice.sureReason || 'Grounded in course syllabus guidelines',
        suggestedContact: fallbackAdvice.suggestedContact || `${course.professor} or recitation TA`,
        verdictType: fallbackAdvice.verdictType,
        allowedUses: fallbackAdvice.allowedUses || [],
        prohibitedUses: fallbackAdvice.prohibitedUses || [],
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return res.json({
        answer: `For ${course.code} (${assignment.title}), please consult the Carmen syllabus policy. Work must be authored by you unless explicitly authorized by the instructor.`,
        sourceReliedOn: assignment.syllabusClause || course.overallPolicy || 'Course Syllabus',
        isSure: true,
        sureReason: 'Grounded in course syllabus policy',
        suggestedContact: `${course.professor} or your recitation TA`,
        verdictType: 'caution',
        allowedUses: [],
        prohibitedUses: [],
      });
    }
  }
});

// Full-stack Vite dev middleware or production static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CompassAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
