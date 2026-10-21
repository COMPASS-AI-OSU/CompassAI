import React, { useState } from 'react';
import { Course, Assignment, StudentProfile } from '../types';
import { X, Copy, Check, FileText } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  assignment: Assignment;
  student: StudentProfile;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  isOpen,
  onClose,
  course,
  assignment,
  student,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const today = 'Oct 24, 2026';

  const formats = [
    {
      id: 'coam',
      title: 'OSU COAM Standard AI Transparency Statement',
      snippet: `### The Ohio State University — COAM AI Disclosure
- **Course**: ${course.code} (${course.professor})
- **Assignment**: ${assignment.title}
- **Student**: ${student.name} (${student.email})
- **Date**: ${today}
- **AI Tool Consulted**: ChatGPT-4o / Claude 3.5 Sonnet
- **Permitted Purpose**: Diagnostic error trace clarification and conceptual syntax review.
- **Affirmation**: Under Ohio State Code of Student Conduct Rule 3335-23-04, all core problem logic, data calculations, and submitted prose were independently composed by ${student.name}.`,
    },
    {
      id: 'readme',
      title: 'CarmenCanvas / Code Header Comment Format',
      snippet: `/**
 * @course ${course.code} - ${course.name}
 * @instructor ${course.professor}
 * @assignment ${assignment.title}
 * @student ${student.name} (${student.email})
 * @ai_disclosure Consulted ChatGPT-4o on ${today} for syntax troubleshooting.
 * All algorithm methods and class implementations independently authored.
 */`,
    },
    {
      id: 'mla',
      title: 'MLA 9th Edition Format (For English / Writing Papers)',
      snippet: `"Diagnostic prompt regarding ${assignment.title}." ChatGPT, 4o version, OpenAI, 24 Oct. 2026, chatgpt.com.
In-text citation: ("Diagnostic prompt regarding ${assignment.title}")`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(id);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#BA0C2F] text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                OSU COAM AI Disclosure Generator
              </h3>
              <p className="text-xs text-neutral-400">
                {course.code} · {assignment.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-neutral-600 font-medium">
            Copy and paste this disclosure statement into your CarmenCanvas submission, code header, or paper appendix as required by {course.professor}&apos;s syllabus.
          </p>

          <div className="space-y-3">
            {formats.map((f) => (
              <div
                key={f.id}
                className="p-3.5 bg-neutral-50 border border-neutral-300 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {f.title}
                  </span>
                  <button
                    onClick={() => handleCopy(f.id, f.snippet)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-white border border-neutral-300 hover:border-[#BA0C2F] text-neutral-800 hover:text-[#BA0C2F] transition-colors shadow-2xs"
                  >
                    {copiedType === f.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-neutral-800 bg-white p-2.5 rounded-lg border border-neutral-200 overflow-x-auto whitespace-pre-wrap">
                  {f.snippet}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
