'use client';

import React, { useEffect, useState } from 'react';
import { BookmarkCheck, Loader2 } from 'lucide-react';
import { listMyCourses, type MyCourse } from '@/app/my-courses/actions';

/**
 * "Course" dropdown on the Policy and Compass screens. Lists the student's My Courses,
 * plus the course they're looking at if it isn't saved. Shown only to signed-in students
 * with at least one saved course.
 */
export function CourseSwitcher({
  role,
  current,
  loading,
  error,
  onSwitch,
}: {
  role: 'student' | 'instructor' | null;
  current: { id: string; code: string; name: string };
  loading: boolean;
  error: string | null;
  onSwitch: (courseId: string) => void;
}) {
  const [saved, setSaved] = useState<MyCourse[] | null>(null);

  useEffect(() => {
    if (role !== 'student') return;
    let cancelled = false;
    listMyCourses().then((r) => {
      if (!cancelled) setSaved(r.courses);
    });
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role !== 'student' || !saved || saved.length === 0) {
    return error ? <p role="alert" className="text-sm font-semibold text-[#9B0A27]">{error}</p> : null;
  }

  const options = saved.some((c) => c.id === current.id)
    ? saved
    : [{ id: current.id, code: current.code, name: current.name, term: null, professor: null }, ...saved];

  return (
    <div className="bg-white border border-neutral-300 rounded-2xl p-3 shadow-2xs space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label htmlFor="course-switcher" className="flex items-center gap-2 text-xs font-bold text-neutral-900">
          <BookmarkCheck className="w-3.5 h-3.5 text-[#BA0C2F] shrink-0" aria-hidden="true" />
          Course
          <span className="text-neutral-500 text-[11px] font-normal">(from My Courses)</span>
        </label>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" aria-label="Loading course" />}
          <select
            id="course-switcher"
            value={current.id}
            disabled={loading}
            onChange={(e) => onSwitch(e.target.value)}
            className="text-xs bg-neutral-50 hover:bg-neutral-100 font-semibold text-neutral-900 border border-neutral-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#BA0C2F] cursor-pointer disabled:opacity-60"
          >
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {[c.code, c.name].filter(Boolean).join(' · ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-[#9B0A27]">{error}</p>}
    </div>
  );
}
