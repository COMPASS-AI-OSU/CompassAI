import React, { useState, useRef, useEffect } from 'react';
import { Course, Assignment, StudentProfile, ChatMessage } from '../types';
import { generatePolicyAdvice } from '../utils/policyAdvisor';
import { CitationModal } from './CitationModal';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  User,
  HelpCircle,
  Info,
  Calendar,
  GraduationCap,
  Loader2,
} from 'lucide-react';

interface Screen3CompassProps {
  course: Course;
  assignment: Assignment;
  student: StudentProfile;
  onBack: () => void;
  onSwitchAssignment?: (assignment: Assignment) => void;
  onSaveRecentSession: (questionSnippet: string) => void;
}

export const Screen3Compass: React.FC<Screen3CompassProps> = ({
  course,
  assignment,
  student,
  onBack,
  onSwitchAssignment,
  onSaveRecentSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const latestQuestionRef = useRef<HTMLDivElement>(null);

  const studentFirstName = student.name.split(' ')[0];

  // When a question is asked, smoothly scroll to keep the user's question visible at the top,
  // allowing the user to read from their question and scroll down to the response.
  useEffect(() => {
    if (messages.length > 0) {
      latestQuestionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [messages, isLoading]);

  // Handle asking a question via the /api/advisor route (with seamless local advisor fallback)
  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    onSaveRecentSession(questionText);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          course,
          assignment,
          studentName: student.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const compassMsg: ChatMessage = {
        id: `c-${Date.now() + 1}`,
        sender: 'compass',
        text: data.answer,
        timestamp: 'Just now',
        verdictType: data.verdictType,
        sourceReliedOn: data.sourceReliedOn,
        isSure: data.isSure,
        sureReason: data.sureReason,
        suggestedContact: data.suggestedContact,
        metadata: {
          allowedUses: data.allowedUses,
          prohibitedUses: data.prohibitedUses,
        },
      };

      setMessages((prev) => [...prev, compassMsg]);
    } catch (err) {
      console.warn('Advisor request failed or offline; using local syllabus engine:', err);
      // Seamless local advisor fallback
      const localAdvice = generatePolicyAdvice(questionText, course, assignment, student.name);

      const compassMsg: ChatMessage = {
        id: `c-${Date.now() + 1}`,
        sender: 'compass',
        text: localAdvice.policySummary,
        timestamp: 'Just now',
        verdictType: localAdvice.verdictType,
        sourceReliedOn:
          localAdvice.sourceReliedOn ||
          localAdvice.instructorQuote ||
          assignment.syllabusClause ||
          course.overallPolicy,
        isSure:
          localAdvice.isSure !== undefined
            ? localAdvice.isSure
            : localAdvice.verdictType !== 'contact_instructor' && localAdvice.verdictType !== 'out_of_scope',
        sureReason:
          localAdvice.sureReason ||
          (localAdvice.verdictType === 'contact_instructor'
            ? 'The syllabus does not cover study coaching or subject tutoring'
            : 'Grounded in course syllabus guidelines'),
        suggestedContact:
          localAdvice.suggestedContact || `${course.professor} or your recitation TA`,
        metadata: {
          allowedUses: localAdvice.allowedUses,
          prohibitedUses: localAdvice.prohibitedUses,
        },
      };

      setMessages((prev) => [...prev, compassMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickButtonClick = (index: number) => {
    const qp = assignment.quickPrompts[index];
    if (qp) {
      handleAskQuestion(qp.question);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  // Sort assignments strictly by due date
  const sortedAssignments = [...course.assignments].sort(
    (a, b) => (a.dueDateTimestamp || 0) - (b.dueDateTimestamp || 0)
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-5">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-[#BA0C2F] bg-white border border-neutral-300 hover:border-[#BA0C2F] rounded-xl px-3 py-2 transition-all shadow-2xs cursor-pointer min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#BA0C2F]" />
          <span>Back to Assignments</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Label required to be preserved: Prototype: sample data */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#BA0C2F]"></span>
            <span>Prototype: sample data</span>
          </span>

          <button
            onClick={() => setIsCitationModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-[#BA0C2F] bg-white border border-neutral-300 rounded-xl px-3 py-2 transition-colors cursor-pointer shadow-2xs"
            title="Generate AI Citation & Disclosure"
          >
            <FileText className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span className="hidden sm:inline">COAM Disclosure Template</span>
            <span className="sm:hidden">Disclose</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 p-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Screen Header matching whiteboard: "Compass" */}
      <div className="text-center space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-neutral-950 tracking-tight">
          Compass
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-neutral-700">
          <span className="font-bold text-[#BA0C2F] bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-md">
            {course.code}
          </span>
          <span className="text-neutral-400">·</span>
          <span>{assignment.title}</span>
          <span className="text-neutral-400">·</span>
          <span className="text-[11px] font-bold text-neutral-600 bg-neutral-200/90 border border-neutral-300 px-2 py-0.5 rounded-md">
            Live Gemini Syllabus Mode
          </span>
        </div>
      </div>

      {/* Assignment Quick Switcher (Listed in Chronological Due Date Order) */}
      {onSwitchAssignment && sortedAssignments.length > 1 && (
        <div className="bg-white border border-neutral-300 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-[#BA0C2F] shrink-0" />
            <span className="font-bold text-neutral-900">Current Assignment:</span>
            <span className="text-neutral-500 text-[11px]">(ordered by due date)</span>
          </div>

          <select
            value={assignment.id}
            onChange={(e) => {
              const target = sortedAssignments.find((a) => a.id === e.target.value);
              if (target) {
                onSwitchAssignment(target);
                setMessages([]); // Reset chat when switching assignments
              }
            }}
            className="text-xs bg-neutral-50 hover:bg-neutral-100 font-semibold text-neutral-900 border border-neutral-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#BA0C2F] cursor-pointer"
          >
            {sortedAssignments.map((a, idx) => (
              <option key={a.id} value={a.id}>
                #{idx + 1}: {a.title} (Due: {a.dueDate})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Greeting Prompt Box matching whiteboard:
          "Hi, X! How can I help you with Y?"
          along with clean quick prompt cards (WITHOUT 'x', 'y', 'z' letters) */}
      <div className="bg-white border-2 border-neutral-900 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#BA0C2F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#BA0C2F]" />
            <span>Ohio State Syllabus Compliance Guide</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 font-serif leading-snug">
            Hi, {studentFirstName}! <br className="hidden sm:inline" />
            How can I help you with {assignment.title}?
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600">
            Select one of the common syllabus policy questions below, or type your own question into the prompt bar. Answers are answered live by Gemini grounded strictly in the course syllabus.
          </p>
        </div>

        {/* Quick Action Prompt Cards (X, Y, Z letters removed per user request) */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Common Syllabus Questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {assignment.quickPrompts.map((qp, index) => {
              return (
                <button
                  key={index}
                  onClick={() => handleQuickButtonClick(index)}
                  disabled={isLoading}
                  className="group relative flex flex-col justify-between items-start p-4 text-left bg-neutral-50 hover:bg-[#BA0C2F]/5 active:bg-[#BA0C2F]/10 border border-neutral-300 hover:border-[#BA0C2F] rounded-2xl transition-all shadow-2xs hover:shadow-xs cursor-pointer min-h-[84px] disabled:opacity-50"
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#BA0C2F] leading-snug">
                    {qp.label}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#BA0C2F] mt-2 flex items-center gap-1">
                    Ask Gemini live →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Stream */}
      {messages.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1 font-semibold">
            <span className="uppercase tracking-wider text-[11px]">
              Syllabus Policy Conversation
            </span>
            <span>{Math.floor(messages.length / 2)} question(s) asked</span>
          </div>

          <div className="space-y-4">
            {(() => {
              const lastUserMsgId = [...messages].reverse().find((m) => m.sender === 'user')?.id;
              return messages.map((msg) => {
                if (msg.sender === 'user') {
                  const isLatest = msg.id === lastUserMsgId;
                  return (
                    <div
                      key={msg.id}
                      ref={isLatest ? latestQuestionRef : undefined}
                      className="flex justify-end scroll-mt-24 pt-2"
                    >
                      <div className="max-w-[85%] bg-neutral-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-xs">
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1 font-medium">
                          <User className="w-3 h-3 text-[#BA0C2F]" />
                          <span>{studentFirstName}</span>
                        </div>
                        <p className="text-sm font-semibold">{msg.text}</p>
                      </div>
                    </div>
                  );
                }

                // Compass message card
                const isAllowed = msg.verdictType === 'allowed';
                const isProhibited = msg.verdictType === 'prohibited';
                const isOutOfScope = msg.verdictType === 'out_of_scope';
                const isContactInstructor = msg.verdictType === 'contact_instructor';

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="w-full bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      {/* Verdict & Certainty Banner */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-100">
                        <div className="flex items-center flex-wrap gap-2">
                          {isAllowed && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 bg-neutral-100 border border-neutral-300 px-3 py-1 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Permitted Within OSU Guidelines</span>
                            </div>
                          )}
                          {isProhibited && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#BA0C2F] px-3 py-1.5 rounded-lg shadow-2xs">
                              <XCircle className="w-4 h-4 text-white" />
                              <span>NOT ALLOWED — Prohibited Activity</span>
                            </div>
                          )}
                          {isContactInstructor && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg shadow-2xs">
                              <GraduationCap className="w-4 h-4 text-[#BA0C2F]" />
                              <span>Ask Professor or TA — Subject Query</span>
                            </div>
                          )}
                          {isOutOfScope && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-lg shadow-2xs">
                              <HelpCircle className="w-4 h-4 text-neutral-600" />
                              <span>OUT OF SCOPE — Not Related to App Function</span>
                            </div>
                          )}
                          {!isAllowed && !isProhibited && !isOutOfScope && !isContactInstructor && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-amber-700" />
                              <span>Caution / Specific Conditions Apply</span>
                            </div>
                          )}

                          {/* Requirement 10: Show whether it is sure */}
                          {msg.isSure !== undefined && (
                            <div
                              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                msg.isSure
                                  ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                                  : 'text-amber-900 bg-amber-50 border-amber-300'
                              }`}
                            >
                              {msg.isSure ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Sure (Grounded in Syllabus)</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Unsure (Not Covered in Syllabus)</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] text-neutral-500 font-semibold">
                          Grounded in: {course.professor}&apos;s Syllabus
                        </span>
                      </div>

                      {/* Prominent Explicit Warning if Prohibited (Requirement 5) */}
                      {isProhibited && (
                        <div className="p-3.5 bg-[#BA0C2F]/10 border-l-4 border-l-[#BA0C2F] rounded-r-xl flex items-start gap-2.5 text-xs font-bold text-[#BA0C2F]">
                          <XCircle className="w-4 h-4 text-[#BA0C2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-sm font-extrabold uppercase tracking-wide">
                              NOT ALLOWED
                            </span>
                            <span className="font-semibold text-neutral-900 block mt-0.5">
                              This action is strictly not allowed for this assignment under Ohio State COAM policies.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Prominent Notice if Subject Tutoring / Study Advice (Requirement 9: Ask Instructor) */}
                      {isContactInstructor && (
                        <div className="p-3.5 bg-amber-50/80 border-l-4 border-l-[#BA0C2F] rounded-r-xl flex items-start gap-2.5 text-xs text-neutral-800">
                          <GraduationCap className="w-4 h-4 text-[#BA0C2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-sm font-bold text-neutral-950 uppercase tracking-wide">
                              I am unsure how to help with this question
                            </span>
                            <span className="font-medium text-neutral-700 block mt-0.5">
                              CompassAI only clarifies course syllabus policies and AI boundaries. For study advice, exam preparation tips, or subject tutoring, please contact your professor or TA.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Prominent Notice if Out of Scope (Requirements 6 & 7) */}
                      {isOutOfScope && (
                        <div className="p-3.5 bg-neutral-100 border-l-4 border-l-neutral-600 rounded-r-xl flex items-start gap-2.5 text-xs text-neutral-800">
                          <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-sm font-bold text-neutral-950 uppercase tracking-wide">
                              Notice: Question Not Related to App Function
                            </span>
                            <span className="font-medium text-neutral-700 block mt-0.5">
                              CompassAI is designed specifically to answer course policy and AI syllabus questions.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* The Answer (Requirement 10) */}
                      <div className="text-sm text-neutral-900 leading-relaxed font-semibold whitespace-pre-line">
                        {msg.text}
                      </div>

                      {/* Requirement 10: Part of the source it relied on */}
                      <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5 text-[#BA0C2F]" />
                            <span>Part of Source Relied On</span>
                          </div>
                          {msg.isSure !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                msg.isSure
                                  ? 'text-emerald-700 bg-emerald-100'
                                  : 'text-amber-800 bg-amber-100'
                              }`}
                            >
                              {msg.isSure ? 'Syllabus Verified' : 'Syllabus Not Covering'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-800 italic leading-relaxed">
                          {msg.sourceReliedOn ||
                            (assignment.syllabusClause
                              ? `“${assignment.syllabusClause}”`
                              : course.overallPolicy)}
                        </p>
                        {msg.sureReason && (
                          <p className="text-[11px] text-neutral-500 pt-0.5">
                            Certainty assessment: {msg.sureReason}
                          </p>
                        )}
                      </div>

                      {/* Requirement 10: If source doesn't cover the question, say so and suggest who to ask instead of guessing */}
                      {msg.isSure === false && (
                        <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-300 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase tracking-wider">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                            <span>Source Does Not Cover This Question</span>
                          </div>
                          <p className="text-neutral-800">
                            The syllabus does not contain explicit rules addressing this question. Instead of guessing, please consult your course staff:
                          </p>
                          <div className="inline-flex items-center gap-1.5 font-bold text-neutral-900 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                            <GraduationCap className="w-4 h-4 text-[#BA0C2F]" />
                            <span>Who to ask: {msg.suggestedContact || `${course.professor} or your recitation TA`}</span>
                          </div>
                        </div>
                      )}

                      {/* Checklists for Allowed & Prohibited Activities */}
                      {msg.metadata && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {msg.metadata.allowedUses && msg.metadata.allowedUses.length > 0 && (
                            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Permitted Activities</span>
                              </div>
                              <ul className="space-y-1.5 text-xs text-neutral-700">
                                {msg.metadata.allowedUses.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-700 font-bold mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {msg.metadata.prohibitedUses && msg.metadata.prohibitedUses.length > 0 && (
                            <div className="p-3.5 bg-[#BA0C2F]/5 border border-[#BA0C2F]/20 rounded-2xl space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#BA0C2F] uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5 text-[#BA0C2F]" />
                                <span>Prohibited Actions</span>
                              </div>
                              <ul className="space-y-1.5 text-xs text-neutral-800">
                                {msg.metadata.prohibitedUses.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-[#BA0C2F] font-bold mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}

            {/* Live Gemini Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 max-w-lg w-full">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#BA0C2F]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" />
                    <span>Consulting {course.code} syllabus via live Gemini call...</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-3.5 bg-neutral-200 rounded-full animate-pulse w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded-full animate-pulse w-5/6"></div>
                    <div className="h-3 bg-neutral-100 rounded-full animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wireframe bottom element: type: [ ... ] prompt bar */}
      <div className="sticky bottom-3 pt-2">
        <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border-2 border-neutral-300 focus-within:border-[#BA0C2F] shadow-md transition-all">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(inputText);
            }}
            className="flex items-center gap-2"
          >
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1 shrink-0 font-mono">
              type:
            </div>
            <input
              type="text"
              placeholder={`Ask Gemini any syllabus policy question about ${assignment.title}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-neutral-900 placeholder:text-neutral-400 py-1"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white text-xs font-bold disabled:opacity-40 disabled:hover:bg-[#BA0C2F] transition-all cursor-pointer min-h-[40px] shrink-0"
            >
              {isLoading ? (
                <>
                  <span>Checking...</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </>
              ) : (
                <>
                  <span>Ask Gemini</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Citation Modal */}
      <CitationModal
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
        course={course}
        assignment={assignment}
        student={student}
      />
    </div>
  );
};
