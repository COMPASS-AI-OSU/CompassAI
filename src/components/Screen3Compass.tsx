import React, { useState, useRef, useEffect } from 'react';
import { Course, Assignment, StudentProfile, ChatMessage } from '../types';
import { CitationModal } from './CitationModal';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  User,
  HelpCircle,
  Calendar,
  GraduationCap,
  Loader2,
  LogIn,
} from 'lucide-react';

interface Screen3CompassProps {
  course: Course;
  assignment: Assignment;
  student: StudentProfile;
  /** Asking Compass needs sign-in (see the roles table in CLAUDE.md). */
  isSignedIn: boolean;
  onBack: () => void;
  onSwitchAssignment?: (assignment: Assignment) => void;
  onSaveRecentSession: (questionSnippet: string) => void;
}

export const Screen3Compass: React.FC<Screen3CompassProps> = ({
  course,
  assignment,
  student,
  isSignedIn,
  onBack,
  onSwitchAssignment,
  onSaveRecentSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const canAsk = isSignedIn && !sessionEnded;
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

  // Ask Compass through /api/advisor. The server saves the question, answers it with Claude
  // from this assignment's syllabus, and reuses the saved answer when asked again.
  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading || !canAsk) return;
    setAskError(null);

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
          courseId: course.id,
          assignmentId: assignment.id,
          question: questionText,
        }),
      });

      if (response.status === 401) {
        // Signed out in another tab, or the session expired. Don't answer.
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setSessionEnded(true);
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        // No made-up fallback answer: say so and let the student try again.
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInputText(questionText);
        setAskError(data?.error || 'Compass couldn’t answer right now. Try again.');
        return;
      }

      const isOffTopic = data.verdict === 'off_topic';
      const isCovered = data.verdict !== 'ask_instructor';
      const compassMsg: ChatMessage = isOffTopic
        ? {
            // Off-topic (#18): just the polite message, with no verdict and no syllabus quote.
            id: `c-${Date.now() + 1}`,
            sender: 'compass',
            text: data.answer,
            timestamp: 'Just now',
            verdictType: 'out_of_scope',
          }
        : {
            id: `c-${Date.now() + 1}`,
            sender: 'compass',
            text: data.answer,
            timestamp: 'Just now',
            verdictType:
              data.verdict === 'allowed'
                ? 'allowed'
                : data.verdict === 'not_allowed'
                  ? 'prohibited'
                  : 'contact_instructor',
            sourceReliedOn: data.quote ? `“${data.quote.replace(/^[“"]+|[”"]+$/g, '')}”` : undefined,
            isSure: isCovered,
            sureReason: isCovered
              ? `Quoted from the ${course.code} syllabus`
              : 'The syllabus doesn’t clearly cover this question',
            suggestedContact: data.suggestedContact,
          };

      setMessages((prev) => [...prev, compassMsg]);
    } catch (err) {
      console.warn('Compass request failed:', err);
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInputText(questionText);
      setAskError('Compass couldn’t answer right now. Check your connection and try again.');
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
            Answers from the syllabus
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
            Pick a common question below, or type your own. Compass answers only from this assignment’s syllabus rules and quotes the line it used.
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
                  disabled={isLoading || !canAsk}
                  className="group relative flex flex-col justify-between items-start p-4 text-left bg-neutral-50 hover:bg-[#BA0C2F]/5 active:bg-[#BA0C2F]/10 border border-neutral-300 hover:border-[#BA0C2F] rounded-2xl transition-all shadow-2xs hover:shadow-xs cursor-pointer min-h-[84px] disabled:opacity-50"
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#BA0C2F] leading-snug">
                    {qp.label}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#BA0C2F] mt-2 flex items-center gap-1">
                    Ask Compass →
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

                // Compass message card: one verdict box (green = permitted, red = not allowed,
                // gray = Compass can't decide), then the syllabus source it relied on.
                const isProhibited = msg.verdictType === 'prohibited';
                const isOutOfScope = msg.verdictType === 'out_of_scope';
                const isContactInstructor = msg.verdictType === 'contact_instructor';
                const isUndecided = isOutOfScope || isContactInstructor;

                // Off-topic (#18): a plain note with no verdict, no source and no one to ask.
                if (isOutOfScope) {
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="w-full bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm flex items-start gap-2.5">
                        <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="space-y-1">
                          <p className="text-sm text-neutral-900 font-semibold">{msg.text}</p>
                          <p className="text-xs text-neutral-600">
                            Ask whether you can use AI on {assignment.title}, and I’ll check the syllabus.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                const verdictStyle = isProhibited
                  ? {
                      box: 'bg-[#BA0C2F]/5 border-[#BA0C2F]/40',
                      heading: 'text-[#BA0C2F]',
                      label: 'Not allowed',
                      Icon: XCircle,
                    }
                  : isUndecided
                    ? {
                        box: 'bg-neutral-100 border-neutral-300',
                        heading: 'text-neutral-900',
                        label: isOutOfScope ? 'Not a syllabus question' : 'Ask your instructor',
                        Icon: isOutOfScope ? HelpCircle : GraduationCap,
                      }
                    : {
                        box: 'bg-emerald-50 border-emerald-300',
                        heading: 'text-emerald-800',
                        label: msg.verdictType === 'caution' ? 'Allowed, with conditions' : 'Allowed',
                        Icon: CheckCircle,
                      };

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="w-full bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      {/* Verdict: whether what was asked is permitted, in plain words */}
                      <div className={`p-4 rounded-2xl border space-y-1.5 ${verdictStyle.box}`}>
                        <div className={`flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide ${verdictStyle.heading}`}>
                          <verdictStyle.Icon className="w-4 h-4 shrink-0" />
                          <span>{verdictStyle.label}</span>
                        </div>
                        <p className="text-sm text-neutral-900 leading-relaxed font-semibold whitespace-pre-line">
                          {msg.text}
                        </p>
                        {(isContactInstructor || msg.isSure === false) && (
                          <p className="text-xs text-neutral-700 font-semibold">
                            Who to ask: {msg.suggestedContact || `${course.professor} or your recitation TA`}
                          </p>
                        )}
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
                    </div>
                  </div>
                );
              });
            })()}

            {/* Loading indicator while Compass answers */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 max-w-lg w-full">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#BA0C2F]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" />
                    <span>Checking the {course.code} syllabus...</span>
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

      {/* Logged out (or session ended): ask them to sign in instead of showing the prompt bar */}
      {!canAsk && (
        <div className="sticky bottom-3 pt-2">
          <div
            role="status"
            className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-neutral-900 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <LogIn className="w-5 h-5 text-[#BA0C2F] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-neutral-950">
                  {sessionEnded ? 'You’ve been signed out.' : 'Sign in to ask Compass.'}
                </p>
                <p className="text-xs text-neutral-700 mt-0.5">
                  You can read every assignment’s AI rules without an account. Asking Compass needs your OSU email.
                </p>
              </div>
            </div>
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white text-sm font-bold shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
            >
              Sign in
            </a>
          </div>
        </div>
      )}

      {/* Wireframe bottom element: type: [ ... ] prompt bar */}
      {canAsk && (
      <div className="sticky bottom-3 pt-2 space-y-2">
        {askError && (
          <p
            role="alert"
            className="text-xs font-semibold text-[#BA0C2F] bg-white border border-[#BA0C2F]/40 rounded-xl px-3 py-2 shadow-xs"
          >
            {askError}
          </p>
        )}
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
              placeholder={`Ask whether you can use AI on ${assignment.title}...`}
              maxLength={500}
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
                  <span>Ask Compass</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      )}

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
