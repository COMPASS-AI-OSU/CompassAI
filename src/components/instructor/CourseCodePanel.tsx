'use client';

import React, { useActionState, useState, useTransition } from 'react';
import { KeyRound } from 'lucide-react';
import { removeCourseCode, setCourseCode, type ActionState } from '@/app/instructor/courses/actions';
import { FormAlert, submitWithoutReset } from '@/components/auth/fields';
import { InputField } from './inputs';
import { primaryButton, secondaryButton } from './InstructorChrome';

/** The code students enter to add this course to My Courses. Only this course's instructor sees it. */
export function CourseCodePanel({ courseId, code, published }: { courseId: string; code: string | null; published: boolean }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    setCourseCode.bind(null, courseId),
    undefined
  );
  const [removeResult, setRemoveResult] = useState<ActionState>();
  const [removing, startRemove] = useTransition();
  const busy = pending || removing;
  const message = removeResult ?? state;

  return (
    <form
      onSubmit={submitWithoutReset(action)}
      noValidate
      aria-labelledby="course-code-heading"
      className="bg-white border border-neutral-300 rounded-2xl p-5 sm:p-6 space-y-4"
    >
      <div className="space-y-1">
        <h2 id="course-code-heading" className="text-lg font-bold text-neutral-950 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#BA0C2F]" aria-hidden="true" /> Course code
        </h2>
        <p className="text-sm text-neutral-700">
          Share this code with your class. Students enter it to add the course to My Courses. Only you can see it.
          {!published && ' It starts working once the course is published.'}
        </p>
      </div>

      {message?.error && <FormAlert tone="error">{message.error}</FormAlert>}
      {message?.saved && <FormAlert tone="success">{message.saved}</FormAlert>}

      <div className="max-w-sm">
        <InputField
          id="join-code"
          name="join_code"
          label={code ? 'Code' : 'Choose a code'}
          hint="6 to 20 letters, numbers or dashes, like SHEPFER-AU26. Capitals don’t matter."
          defaultValue={code}
          error={state?.fieldErrors?.join_code}
          maxLength={20}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} aria-disabled={busy} className={primaryButton}>
          {pending ? 'Saving…' : code ? 'Save new code' : 'Save code'}
        </button>
        {code && (
          <button
            type="button"
            disabled={busy}
            onClick={() => startRemove(async () => setRemoveResult(await removeCourseCode(courseId)))}
            className={secondaryButton}
          >
            {removing ? 'Removing…' : 'Remove code'}
          </button>
        )}
      </div>
    </form>
  );
}
