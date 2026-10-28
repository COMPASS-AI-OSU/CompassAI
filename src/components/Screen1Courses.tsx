import React, { useEffect, useState } from 'react';
import { Course, RecentSession, StudentProfile } from '../types';
import type { CourseSearchResult } from '@/app/api/courses/search/route';
import { Search, ArrowRight, History, GraduationCap, ChevronRight, BookOpen, Clock } from 'lucide-react';

const SEARCH_DELAY_MS = 250;

interface Screen1CoursesProps {
  student: StudentProfile;
  courses: Course[];
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
  onContinue: () => void;
  recentSession: RecentSession | null;
  onResumeRecent: () => void;
}

export const Screen1Courses: React.FC<Screen1CoursesProps> = ({
  student,
  courses,
  selectedCourse,
  onSelectCourse,
  onContinue,
  recentSession,
  onResumeRecent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Published courses from the database that match the search (issue #11).
  const [publishedMatches, setPublishedMatches] = useState<CourseSearchResult[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [selectedPublishedId, setSelectedPublishedId] = useState<string | null>(null);

  // Search published courses as the student types, after a short pause.
  const searchTerm = searchQuery.trim();
  const isSearching = searchTerm.length >= 2;
  useEffect(() => {
    const query = searchTerm;
    if (query.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/courses/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`);
        setPublishedMatches(data.courses ?? []);
        setSearchError(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn('Course search failed:', err);
        setPublishedMatches([]);
        setSearchError(true);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  // Shorter than 2 characters: don't show database results or errors from an older search.
  const visiblePublished = isSearching ? publishedMatches : [];
  const showSearchError = isSearching && searchError;

  // Find recent course and assignment details if any
  const recentCourse = recentSession
    ? courses.find((c) => c.id === recentSession.courseId)
    : null;
  const recentAssignment = recentCourse
    ? recentCourse.assignments.find((a) => a.id === recentSession?.assignmentId)
    : null;

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.professor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const nothingFound = filteredCourses.length === 0 && visiblePublished.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-6 pb-8 relative">
      {/* Header section matching whiteboard: "Welcome, <name>" */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BA0C2F] bg-[#BA0C2F]/10 px-3 py-1 rounded-md border border-[#BA0C2F]/20">
            <GraduationCap className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span>The Ohio State University · Autumn 2026</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-md border border-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#BA0C2F]"></span>
            <span>Prototype: sample data</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-serif">
          Welcome, {student.name.split(' ')[0]}
        </h1>
        <p className="text-base sm:text-lg text-neutral-800 font-bold pt-1">
          What course do you want help with?
        </p>
        <p className="text-xs text-neutral-600">
          Check CarmenCanvas syllabus AI boundaries, COAM rules, and assignment permissions.
        </p>
      </div>

      {/* Search Input for fast access */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter courses by name, code, or professor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BA0C2F] focus:border-[#BA0C2F] transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 px-1"
          >
            Clear
          </button>
        )}
      </div>
      {showSearchError && (
        <p role="status" className="-mt-4 text-xs font-semibold text-[#BA0C2F]">
          Couldn’t search courses right now. Showing sample courses only.
        </p>
      )}

      {/* Table / List layout matching whiteboard: Course Name | Professor */}
      <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-100 border-b border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <div className="col-span-7 sm:col-span-7 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span>Course Name</span>
          </div>
          <div className="col-span-5 sm:col-span-5 text-left">
            <span>Professor</span>
          </div>
        </div>

        {/* Course Rows */}
        <div className="divide-y divide-neutral-200">
          {filteredCourses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  onDoubleClick={() => {
                    onSelectCourse(course);
                    onContinue();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectCourse(course);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left grid grid-cols-12 gap-3 px-4 py-3.5 sm:py-4 items-center transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] ${
                    isSelected
                      ? 'bg-[#BA0C2F]/5 border-l-4 border-l-[#BA0C2F]'
                      : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Course Name column */}
                  <div className="col-span-6 sm:col-span-7 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-neutral-950 group-hover:text-[#BA0C2F] transition-colors">
                        {course.code}
                      </span>
                      <span className="hidden sm:inline-block text-xs text-neutral-400">·</span>
                      <span className="hidden sm:inline-block text-xs font-medium text-neutral-500">
                        {course.assignments.length} assignments
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-600 truncate mt-0.5 font-medium">
                      {course.name}
                    </div>
                  </div>

                  {/* Professor column & quick proceed */}
                  <div className="col-span-6 sm:col-span-5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-neutral-950 truncate pr-1">
                      {course.professor}
                    </span>
                    <div className="shrink-0 ml-2 flex items-center gap-2">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCourse(course);
                            onContinue();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#BA0C2F]/20"
                          title={`Proceed with ${course.code}`}
                        >
                          <span>Proceed</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-neutral-200 text-neutral-500 group-hover:bg-[#BA0C2F] group-hover:text-white"
                          title="Select course"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Published courses from the database (issue #11). Their assignment rules page is #14. */}
          {visiblePublished.map((course) => {
            const isSelected = selectedPublishedId === course.id;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedPublishedId(course.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPublishedId(course.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`w-full text-left grid grid-cols-12 gap-3 px-4 py-3.5 sm:py-4 items-center transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] ${
                  isSelected
                    ? 'bg-[#BA0C2F]/5 border-l-4 border-l-[#BA0C2F]'
                    : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="col-span-6 sm:col-span-7 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-neutral-950 group-hover:text-[#BA0C2F] transition-colors">
                      {course.code || 'Untitled course'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
                      Published
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 truncate mt-0.5 font-medium">
                    {[course.name, course.term].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-5 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-800 truncate pr-1">
                    {course.professor || '—'}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-300 px-2 py-1 rounded-lg shrink-0">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      Assignment rules coming soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {nothingFound && (
            <div className="p-8 text-center text-neutral-500 text-sm">No courses found</div>
          )}
        </div>
      </div>

      {/* Wireframe bottom element: [Pick Up Where You Left Off] */}
      {recentSession && recentCourse && recentAssignment && (
        <div className="pt-2">
          <div className="bg-white border-2 border-dashed border-neutral-300 hover:border-[#BA0C2F] rounded-2xl p-4 sm:p-5 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#BA0C2F]/10 text-[#BA0C2F] flex items-center justify-center shrink-0 mt-0.5">
                  <History className="w-5 h-5 text-[#BA0C2F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-neutral-950">
                      Pick Up Where You Left Off
                    </h2>
                    <span className="text-[11px] text-neutral-500 font-semibold">
                      ({recentSession.lastActive})
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-800 font-bold mt-0.5">
                    {recentCourse.code} · {recentAssignment.title}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 italic line-clamp-1">
                    &ldquo;{recentSession.questionSnippet}&rdquo;
                  </div>
                </div>
              </div>

              <button
                onClick={onResumeRecent}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-[#BA0C2F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[40px]"
              >
                <span>Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
