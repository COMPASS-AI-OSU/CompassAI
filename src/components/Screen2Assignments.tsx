import React, { useState } from 'react';
import { Course, Assignment } from '../types';
import { PolicyBadge } from './PolicyBadge';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Info,
  ShieldAlert,
  Check,
  Clock,
} from 'lucide-react';

interface Screen2AssignmentsProps {
  course: Course;
  selectedAssignment: Assignment | null;
  onSelectAssignment: (assignment: Assignment) => void;
  onBack: () => void;
  onContinueToCompass: (assignment: Assignment) => void;
  /** "Course" dropdown listing My Courses (#14). */
  courseSwitcher?: React.ReactNode;
}

export const Screen2Assignments: React.FC<Screen2AssignmentsProps> = ({
  course,
  selectedAssignment,
  onSelectAssignment,
  onBack,
  onContinueToCompass,
  courseSwitcher,
}) => {
  const [filter, setFilter] = useState<'all' | 'strictly_prohibited' | 'partial_allowed' | 'allowed_with_disclosure' | 'allowed' | 'study_prep_only'>('all');

  // Filter tabs with counts (#15). Counts come from the same aiStatus the filter uses, so the
  // levels always add up to All. Any other level gets its own tab, so nothing is left out.
  type FilterId = typeof filter;
  const countOf = (status: FilterId) => course.assignments.filter((a) => a.aiStatus === status).length;
  const levelTabs: { id: FilterId; label: string; activeClass: string }[] = [
    { id: 'strictly_prohibited', label: 'Prohibited', activeClass: 'bg-[#BA0C2F]' },
    { id: 'partial_allowed', label: 'Partial', activeClass: 'bg-amber-700' },
    { id: 'allowed_with_disclosure', label: 'Allowed with disclosure', activeClass: 'bg-neutral-900' },
    { id: 'allowed', label: 'Allowed', activeClass: 'bg-emerald-800' },
    { id: 'study_prep_only', label: 'Study prep only', activeClass: 'bg-neutral-900' },
  ];
  const filterTabs = [
    { id: 'all' as FilterId, label: 'All', activeClass: 'bg-[#BA0C2F]', count: course.assignments.length },
    ...levelTabs
      .map((tab) => ({ ...tab, count: countOf(tab.id) }))
      // "Study prep only" isn't an instructor level today; show it only if a course ever uses it.
      .filter((tab) => tab.id !== 'study_prep_only' || tab.count > 0),
  ];

  // Strictly sort assignments in chronological order of due date (Requirement 6)
  const sortedAndFilteredAssignments = [...course.assignments]
    .sort((a, b) => (a.dueDateTimestamp ?? Number.MAX_SAFE_INTEGER) - (b.dueDateTimestamp ?? Number.MAX_SAFE_INTEGER))
    .filter((a) => {
      if (filter === 'all') return true;
      return a.aiStatus === filter;
    });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-5 sm:py-8 space-y-6 pb-8 relative">
      {/* Navigation Top Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 hover:text-[#BA0C2F] bg-white border border-neutral-300 hover:border-[#BA0C2F] rounded-xl px-3 py-2 transition-all shadow-2xs cursor-pointer min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#BA0C2F]" />
          <span>Back to Course Selection</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-xs text-neutral-500 font-semibold tracking-wide uppercase hidden sm:block">
            Step 2: Course Policy Table
          </div>
        </div>
      </div>

      {courseSwitcher}

      {/* Header section matching whiteboard: Course Name & Prof Name */}
      <div className="bg-white border-t-4 border-t-[#BA0C2F] border-x border-b border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[#BA0C2F]">
              The Ohio State University · {course.department}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-serif tracking-tight mt-0.5">
              {course.code}: {course.name}
            </h1>
            <div className="text-sm sm:text-base font-semibold text-neutral-700 mt-1">
              Instructor: {course.professor}
            </div>
            {course.officeHours && (
              <div className="text-xs text-neutral-600 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-neutral-700">Office Hours:</span>
                <span>{course.officeHours}</span>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
            <ShieldAlert className="w-4 h-4 text-[#BA0C2F]" />
            <span>COAM Syllabus Rules</span>
          </div>
        </div>

        {/* Course-wide overall policy callout */}
        <div className="pt-2 border-t border-neutral-100 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
          <Info className="w-4 h-4 text-[#BA0C2F] shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-neutral-900">Overall Course AI Policy:</span>{' '}
            {course.overallPolicy}
          </p>
        </div>
      </div>

      {/* Filter and Due Date Chronological Sort Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs for quick scanning */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 font-bold text-[11px] uppercase mr-1 whitespace-nowrap">
            Filter:
          </span>
          {filterTabs.map((tab) => {
            const selected = filter === tab.id;
            const empty = tab.id !== 'all' && tab.count === 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={selected}
                disabled={empty && !selected}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                  selected ? `${tab.activeClass} text-white shadow-2xs` : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Chronological Due Date Indicator Badge (Requirement 6) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-800 shadow-2xs shrink-0 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-[#BA0C2F]" />
          <span>Assignments in Order of Due Date</span>
        </div>
      </div>

      {/* Policy Table Layout matching Whiteboard:
          Columns: [ Assignment | Due Date | AI allowed? | Comment from Instructor ]
          IMPORTANT: No overlap between 'AI allowed?' and 'Comment from Instructor'!
          Removed 'Ask AI' side button as requested.
      */}
      <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
        {/* Table header (visible on desktop and laptop) */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3.5 bg-neutral-100 border-b border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <div className="col-span-4 flex items-center gap-1.5">
            <span>Assignment</span>
            <span className="text-[10px] text-neutral-400 font-normal lowercase">(ordered by deadline)</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span>Due Date (In Order)</span>
          </div>
          <div className="col-span-3">AI Allowed?</div>
          <div className="col-span-3">Comment from Instructor</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-200">
          {sortedAndFilteredAssignments.map((assignment, index) => {
            const isSelected = selectedAssignment?.id === assignment.id;
            return (
              <div
                key={assignment.id}
                onClick={() => onSelectAssignment(assignment)}
                onDoubleClick={() => onContinueToCompass(assignment)}
                className={`transition-all cursor-pointer p-4 sm:p-5 ${
                  isSelected
                    ? 'bg-[#BA0C2F]/5 border-l-4 border-l-[#BA0C2F]'
                    : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Desktop Grid Layout (Clean column separation, zero overlap) */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Column 1: Assignment */}
                  <div className="col-span-4 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-400 shrink-0">
                        #{index + 1}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#BA0C2F] inline-block shrink-0" />
                      )}
                      <span className="font-bold text-neutral-950 text-sm">
                        {assignment.title}
                      </span>
                    </div>
                    {assignment.syllabusClause && (
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5 pl-6">
                        {assignment.syllabusClause.split(':')[0]}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Due Date */}
                  {/* Compact date and time; the syllabus's full wording shows on hover. */}
                  <div className="col-span-2 flex items-start gap-1.5" title={assignment.dueDate}>
                    <Calendar className="w-3.5 h-3.5 text-[#BA0C2F] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 whitespace-nowrap overflow-hidden text-ellipsis">
                        {assignment.dueShort}
                      </div>
                      {assignment.dueTime && (
                        <div className="text-[11px] font-medium text-neutral-600 whitespace-nowrap">{assignment.dueTime}</div>
                      )}
                      <span className="sr-only">Due as written in the syllabus: {assignment.dueDate}</span>
                    </div>
                  </div>

                  {/* Column 3: AI Allowed? (Fixed col-span-3, no overlap) */}
                  <div className="col-span-3 pr-2">
                    <PolicyBadge
                      status={assignment.aiStatus}
                      label={assignment.aiStatusLabel}
                      size="sm"
                    />
                  </div>

                  {/* Column 4: Comment from Instructor & Quick Proceed (col-span-3, clean typography) */}
                  <div className="col-span-3 pl-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-neutral-700 leading-relaxed italic line-clamp-3 flex-1">
                      {assignment.instructorComment ? <>&ldquo;{assignment.instructorComment}&rdquo;</> : <span className="not-italic text-neutral-500">No comment from your instructor.</span>}
                    </p>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinueToCompass(assignment);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#BA0C2F]/20 animate-in fade-in zoom-in-95 duration-150"
                        title="Proceed to Compass"
                      >
                        <span>Proceed</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Responsive Layout (Stacked, cleanly decoupled) */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-neutral-950 text-sm flex items-center gap-1.5 flex-1">
                      <span className="text-xs font-mono font-bold text-[#BA0C2F]">
                        #{index + 1}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#BA0C2F] shrink-0" />
                      )}
                      <span>{assignment.title}</span>
                    </div>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinueToCompass(assignment);
                        }}
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#BA0C2F] hover:bg-[#990000] active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer animate-in fade-in zoom-in-95"
                      >
                        <span>Proceed</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#BA0C2F]" aria-hidden="true" />
                      <span title={assignment.dueDate}>
                        Due: {assignment.dueShort}
                        {assignment.dueTime && <span className="font-medium text-neutral-600"> · {assignment.dueTime}</span>}
                      </span>
                    </div>
                    <div>
                      <PolicyBadge
                        status={assignment.aiStatus}
                        label={assignment.aiStatusLabel}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Instructor Comment Block - completely separate, zero overlap */}
                  <div className="text-xs text-neutral-700 bg-neutral-100 p-3 rounded-xl border border-neutral-200">
                    <span className="font-bold text-neutral-900 block mb-1 text-[11px] uppercase tracking-wide">
                      Comment from Instructor:
                    </span>
                    <p className="italic leading-relaxed">
                      {assignment.instructorComment ? <>&ldquo;{assignment.instructorComment}&rdquo;</> : <span className="not-italic text-neutral-500">No comment from your instructor.</span>}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {course.assignments.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-600">
              Your instructor hasn’t published any assignment rules for this course yet.
            </div>
          )}
          {course.assignments.length > 0 && sortedAndFilteredAssignments.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-600">No assignments with this AI level.</div>
          )}
        </div>
      </div>
    </div>
  );
};
