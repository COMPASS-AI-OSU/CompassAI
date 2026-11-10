import React, { useState } from 'react';
import { CourseSummary, RecentSession, StudentProfile } from '../types';
import { MyCoursesPanel } from './MyCoursesPanel';
import { timeAgo } from '@/lib/compass-message';
import { Search, ArrowRight, GraduationCap, ChevronRight, BookOpen, Loader2, AlertCircle, History } from 'lucide-react';

interface Screen1CoursesProps {
  student: StudentProfile;
  /** Who's signed in: shows My Courses and the course-code box for students. */
  role?: 'student' | 'instructor' | null;
  /** Every published course (#14). */
  courses: CourseSummary[];
  coursesError?: string;
  selectedCourseId: string | null;
  loadingCourseId: string | null;
  loadError: string | null;
  /** Load a course and mark it selected. */
  onSelectCourse: (courseId: string) => void;
  /** Load a course and go straight to its policy table. */
  onOpenCourse: (courseId: string) => void;
  onContinue: () => void;
  /** The student's last answered question (#23). Null hides the card. */
  recentSession?: RecentSession | null;
  onResumeRecent?: () => void;
}

export const Screen1Courses: React.FC<Screen1CoursesProps> = ({
  student,
  role = null,
  courses,
  coursesError,
  selectedCourseId,
  loadingCourseId,
  loadError,
  onSelectCourse,
  onOpenCourse,
  onContinue,
  recentSession = null,
  onResumeRecent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter as the student types, by code, name or professor (#11).
  const q = searchQuery.trim().toLowerCase();
  const filteredCourses = q
    ? courses.filter((c) => [c.code, c.name, c.professor].some((v) => v?.toLowerCase().includes(q)))
    : courses;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-6 pb-8 relative">
      {/* Header section matching whiteboard: "Welcome, <name>" */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BA0C2F] bg-[#BA0C2F]/10 px-3 py-1 rounded-md border border-[#BA0C2F]/20">
            <GraduationCap className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span>The Ohio State University · Autumn 2026</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-serif">
          {student.name ? `Welcome, ${student.name.split(' ')[0]}` : 'Welcome'}
        </h1>
        <p className="text-base sm:text-lg text-neutral-800 font-bold pt-1">What course do you want help with?</p>
        <p className="text-xs text-neutral-600">
          Check CarmenCanvas syllabus AI boundaries, COAM rules, and assignment permissions.
        </p>
      </div>

      {/* Pick up where you left off (#23): the student's last answered question, one click back. */}
      {recentSession && (
        <section
          aria-labelledby="pick-up-heading"
          className="bg-white border-2 border-dashed border-neutral-300 hover:border-[#BA0C2F] rounded-2xl p-4 sm:p-5 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#BA0C2F]/10 flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-5 h-5 text-[#BA0C2F]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="pick-up-heading" className="text-sm sm:text-base font-bold text-neutral-950">
                    Pick up where you left off
                  </h2>
                  {/* Server and browser clocks can differ by a minute; the label just updates. */}
                  <span className="text-[11px] text-neutral-600 font-semibold" suppressHydrationWarning>
                    ({timeAgo(recentSession.answeredAt)})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 font-bold mt-0.5">
                  {recentSession.courseCode} · {recentSession.assignmentTitle}
                </p>
                <p className="text-xs text-neutral-600 mt-1 italic line-clamp-2">&ldquo;{recentSession.question}&rdquo;</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeRecent}
              disabled={loadingCourseId !== null}
              aria-label={`Resume your question about ${recentSession.courseCode}, ${recentSession.assignmentTitle}`}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-[#BA0C2F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[40px] disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
            >
              {loadingCourseId === recentSession.courseId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      <MyCoursesPanel role={role} onOpenCourse={onOpenCourse} openingCourseId={loadingCourseId} />

      {/* Search Input for fast access */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          type="text"
          aria-label="Filter courses by name, code, or professor"
          placeholder="Filter courses by name, code, or professor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BA0C2F] focus:border-[#BA0C2F] transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-800 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {loadError && (
        <p role="alert" className="-mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#9B0A27]">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> {loadError}
        </p>
      )}

      {/* Table / List layout matching whiteboard: Course Name | Professor */}
      <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-100 border-b border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <div className="col-span-7 sm:col-span-7 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#BA0C2F]" aria-hidden="true" />
            <span>Course Name</span>
          </div>
          <div className="col-span-5 sm:col-span-5 text-left">
            <span>Professor</span>
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          {filteredCourses.map((course) => {
            const isSelected = selectedCourseId === course.id;
            const isLoading = loadingCourseId === course.id;
            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                onDoubleClick={() => onOpenCourse(course.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isSelected) onContinue();
                    else onSelectCourse(course.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-busy={isLoading}
                className={`w-full text-left grid grid-cols-12 gap-3 px-4 py-3.5 sm:py-4 items-center transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] ${
                  isSelected ? 'bg-[#BA0C2F]/5 border-l-4 border-l-[#BA0C2F]' : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="col-span-6 sm:col-span-7 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-neutral-950 group-hover:text-[#BA0C2F] transition-colors">
                      {course.code || 'Untitled course'}
                    </span>
                    <span className="hidden sm:inline-block text-xs text-neutral-400">·</span>
                    <span className="hidden sm:inline-block text-xs font-medium text-neutral-500">
                      {course.assignmentCount === 1 ? '1 assignment' : `${course.assignmentCount} assignments`}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 truncate mt-0.5 font-medium">
                    {[course.name, course.term].filter(Boolean).join(' · ')}
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-5 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-neutral-950 truncate pr-1">
                    {course.professor || '—'}
                  </span>
                  <div className="shrink-0 ml-2 flex items-center gap-2">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                        <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" aria-hidden="true" /> Loading…
                      </span>
                    ) : isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinue();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#BA0C2F]/20"
                        title={`Proceed with ${course.code ?? 'this course'}`}
                      >
                        <span>Proceed</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-neutral-200 text-neutral-500 group-hover:bg-[#BA0C2F] group-hover:text-white"
                        title="Select course"
                      >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {coursesError && (
            <div role="alert" className="p-8 text-center text-sm font-semibold text-[#9B0A27]">
              {coursesError}
            </div>
          )}
          {!coursesError && courses.length === 0 && (
            <div className="p-8 text-center text-neutral-600 text-sm">
              No courses are published yet. When an instructor publishes a course, it shows here.
            </div>
          )}
          {!coursesError && courses.length > 0 && filteredCourses.length === 0 && (
            <div className="p-8 text-center text-neutral-600 text-sm">No courses found</div>
          )}
        </div>
      </div>
    </div>
  );
};
