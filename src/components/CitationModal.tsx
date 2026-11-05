import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, FileText, X } from 'lucide-react';
import { Course, Assignment } from '../types';

/** Tools a student can tick. "Other" lets them type any tool not listed. */
export const DISCLOSURE_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Microsoft Copilot', 'Grammarly', 'Perplexity'] as const;

const MAX_USE = 500;
const MAX_OTHER = 60;
const MAX_NAME = 80;

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** The statement uses only the student's own entries plus course, assignment, their name and today's date (#19). */
export function buildStatement(parts: {
  courseCode: string;
  assignmentTitle: string;
  name: string;
  date: string;
  tools: string[];
  use: string;
}): string {
  return [
    `AI use disclosure: ${parts.courseCode}, ${parts.assignmentTitle}`,
    `Student: ${parts.name}`,
    `Date: ${parts.date}`,
    `AI tools used: ${parts.tools.join(', ')}`,
    `How I used them: ${parts.use}`,
  ].join('\n');
}

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  assignment: Assignment;
}

export const CitationModal: React.FC<CitationModalProps> = (props) => {
  if (!props.isOpen) return null;
  // Remount on every open so the form starts blank each time.
  return <DisclosureDialog key={props.assignment.id} {...props} />;
};

// Every field starts blank: the student fills in the statement themselves, nothing is auto-filled.
function DisclosureDialog({ onClose, course, assignment }: CitationModalProps) {
  const [tools, setTools] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [use, setUse] = useState('');
  const [name, setName] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const statementRef = useRef<HTMLPreElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const date = todayLabel();

  // Escape closes; focus starts on the first field.
  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allTools = [...tools, ...(other.trim() ? [other.trim()] : [])];
  const missing = [
    allTools.length === 0 && 'pick at least one AI tool',
    !use.trim() && 'describe how you used it',
    !name.trim() && 'add your name',
  ].filter(Boolean) as string[];
  const statement = missing.length
    ? null
    : buildStatement({
        courseCode: course.code,
        assignmentTitle: assignment.title,
        name: name.trim(),
        date,
        tools: allTools,
        use: use.trim(),
      });

  const toggleTool = (tool: string) => {
    setCopyState('idle');
    setTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const copy = async () => {
    if (!statement) return;
    try {
      await navigator.clipboard.writeText(statement);
      setCopyState('copied');
      setTimeout(() => setCopyState((s) => (s === 'copied' ? 'idle' : s)), 2500);
    } catch {
      // Clipboard blocked: select the text so the student can copy it themselves.
      setCopyState('failed');
      const el = statementRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const fieldClass =
    'w-full px-3 py-2 text-sm bg-white border-2 border-neutral-400 focus:border-neutral-900 rounded-xl text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl max-w-lg w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white theme-keep">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#BA0C2F] flex items-center justify-center">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id={titleId} className="text-base font-bold">
                AI use disclosure
              </h3>
              <p className="text-xs text-neutral-300">
                {course.code} · {assignment.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-sm text-neutral-700">
            Fill this in to make a disclosure statement you can paste into your Canvas submission. It only includes what
            you enter here.
          </p>

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-neutral-900">Which AI tools did you use?</legend>
            <div className="grid grid-cols-2 gap-2">
              {DISCLOSURE_TOOLS.map((tool, i) => (
                <label
                  key={tool}
                  className="flex items-center gap-2 text-sm text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 cursor-pointer has-checked:border-[#BA0C2F] has-checked:bg-[#BA0C2F]/5"
                >
                  <input
                    ref={i === 0 ? firstFieldRef : undefined}
                    type="checkbox"
                    checked={tools.includes(tool)}
                    onChange={() => toggleTool(tool)}
                    className="accent-[#BA0C2F] w-4 h-4"
                  />
                  {tool}
                </label>
              ))}
            </div>
            <label className="block text-sm text-neutral-800">
              <span className="font-semibold">Other tool</span> (optional)
              <input
                type="text"
                value={other}
                maxLength={MAX_OTHER}
                onChange={(e) => {
                  setOther(e.target.value);
                  setCopyState('idle');
                }}
                className={`${fieldClass} mt-1`}
              />
            </label>
          </fieldset>

          <label className="block text-sm">
            <span className="font-bold text-neutral-900">How did you use it?</span>
            <span className="block text-xs text-neutral-600">For example: “Brainstormed topic ideas, then wrote the essay myself.”</span>
            <textarea
              rows={3}
              value={use}
              maxLength={MAX_USE}
              onChange={(e) => {
                setUse(e.target.value);
                setCopyState('idle');
              }}
              className={`${fieldClass} mt-1`}
            />
            <span className="block text-right text-xs text-neutral-600">
              {use.length}/{MAX_USE}
            </span>
          </label>

          <label className="block text-sm">
            <span className="font-bold text-neutral-900">Your name</span>
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME}
              onChange={(e) => {
                setName(e.target.value);
                setCopyState('idle');
              }}
              className={`${fieldClass} mt-1`}
            />
          </label>

          <section aria-label="Your statement" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Your statement</span>
              <button
                type="button"
                onClick={copy}
                disabled={!statement}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                {copyState === 'copied' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" /> Copy
                  </>
                )}
              </button>
            </div>
            {statement ? (
              <pre
                ref={statementRef}
                className="text-xs font-mono text-neutral-900 bg-neutral-50 p-3 rounded-lg border border-neutral-300 whitespace-pre-wrap"
              >
                {statement}
              </pre>
            ) : (
              <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-dashed border-neutral-400">
                To see your statement, {missing.join(', ')}.
              </p>
            )}
            <p role="status" aria-live="polite" className="text-xs font-semibold min-h-4">
              {copyState === 'copied' && <span className="text-emerald-800">Copied to your clipboard.</span>}
              {copyState === 'failed' && (
                <span className="text-[#9B0A27]">
                  Couldn’t copy automatically. The statement is selected: press Ctrl+C (or ⌘C) to copy it.
                </span>
              )}
            </p>
          </section>
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
