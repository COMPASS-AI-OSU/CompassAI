'use client';

import React, { useActionState, useCallback, useEffect, useState, useTransition } from 'react';
import { BookmarkCheck, KeyRound, Loader2, X } from 'lucide-react';
import {
  joinCourseByCode,
  listMyCourses,
  removeMyCourse,
  type JoinState,
  type MyCourse,
} from '@/app/my-courses/actions';
import { submitWithoutReset } from '@/components/auth/fields';

/** "Have a course code?" box and the student's My Courses list. Hidden for instructors. */
export function MyCoursesPanel({ role }: { role: 'student' | 'instructor' | null }) {
  const [courses, setCourses] = useState<MyCourse[] | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [removeError, setRemoveError] = useState<string>();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startRemove] = useTransition();
  const [state, action, pending] = useActionState<JoinState | undefined, FormData>(joinCourseByCode, undefined);

  const load = useCallback(async () => {
    const result = await listMyCourses();
    setCourses(result.courses);
    setLoadError(result.error);
  }, []);

  useEffect(() => {
    // Loads the saved list from the server once signed in, and again after each successful add.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (role === 'student') load();
  }, [role, load, state?.added]);

  if (role === 'instructor') return null;

  if (role === null) {
    return (
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 text-sm text-neutral-800 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-[#BA0C2F] shrink-0" aria-hidden="true" />
        <span>
          Have a course code from your instructor?{' '}
          <a href="/sign-in" className="font-bold text-[#BA0C2F] underline underline-offset-2">
            Sign in
          </a>{' '}
          to add it to My Courses.
        </span>
      </div>
    );
  }

  return (
    <section aria-labelledby="my-courses-heading" className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 space-y-4">
      <h2 id="my-courses-heading" className="text-base font-bold text-neutral-950 flex items-center gap-2">
        <BookmarkCheck className="w-4 h-4 text-[#BA0C2F]" aria-hidden="true" /> My Courses
      </h2>

      {courses === null && !loadError && (
        <p className="text-sm text-neutral-700 inline-flex items-center gap-2" aria-busy="true">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading your courses…
        </p>
      )}
      {loadError && <p role="alert" className="text-sm font-semibold text-[#9B0A27]">{loadError}</p>}
      {courses?.length === 0 && (
        <p className="text-sm text-neutral-700">No courses yet. Enter the code your instructor gave you below.</p>
      )}
      {courses && courses.length > 0 && (
        <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl">
          {courses.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-bold text-neutral-950">{c.code ?? 'Course'}</div>
                <div className="text-xs text-neutral-700 truncate">
                  {[c.name, c.professor, c.term].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                disabled={removingId === c.id}
                aria-label={`Remove ${c.code ?? 'course'} from My Courses`}
                onClick={() =>
                  startRemove(async () => {
                    setRemovingId(c.id);
                    const result = await removeMyCourse(c.id);
                    setRemoveError(result.error);
                    if (!result.error) setCourses((prev) => prev?.filter((x) => x.id !== c.id) ?? null);
                    setRemovingId(null);
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-800 border border-neutral-300 hover:bg-neutral-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" /> {removingId === c.id ? 'Removing…' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {removeError && <p role="alert" className="text-sm font-semibold text-[#9B0A27]">{removeError}</p>}

      <form onSubmit={submitWithoutReset(action)} noValidate className="space-y-2">
        <label htmlFor="course-code-input" className="block text-sm font-bold text-neutral-900">
          Have a course code?
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="course-code-input"
            name="course_code"
            type="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={24}
            placeholder="Like SHEPFER-AU26"
            aria-describedby="course-code-result"
            className="flex-1 min-w-40 px-3.5 py-2.5 text-sm uppercase bg-white border-2 border-neutral-400 focus:border-neutral-900 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
          />
          <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white text-sm font-bold cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
          >
            {pending ? 'Adding…' : 'Add course'}
          </button>
        </div>
        <p id="course-code-result" aria-live="polite" className="text-sm font-semibold min-h-5">
          {state?.error && <span className="text-[#9B0A27]">{state.error}</span>}
          {state?.added && <span className="text-emerald-800">{state.added}</span>}
        </p>
      </form>
    </section>
  );
}
