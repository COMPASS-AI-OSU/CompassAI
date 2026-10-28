'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { PlusCircle } from 'lucide-react';
import { addAssignment, type ActionState } from '@/app/instructor/courses/actions';
import { FormAlert, submitWithoutReset } from '@/components/auth/fields';
import { AiLevelSelect, InputField } from './inputs';
import { secondaryButton } from './InstructorChrome';

export function AddAssignmentForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    addAssignment.bind(null, courseId),
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fe = state?.fieldErrors ?? {};

  // Clear the form after a successful add, so the next one starts empty.
  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={submitWithoutReset(action)}
      noValidate
      aria-labelledby="add-assignment-heading"
      className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-5 sm:p-6 space-y-4"
    >
      <h2 id="add-assignment-heading" className="text-lg font-bold text-neutral-950">
        Add an assignment
      </h2>
      <p className="text-sm text-neutral-700">For anything your syllabus didn’t list. It starts as Needs review.</p>
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state?.saved && <FormAlert tone="success">{state.saved}</FormAlert>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField id="new-title" name="title" label="Name" error={fe.title} maxLength={200} />
        <AiLevelSelect id="new-ai" error={fe.ai_level} />
        <InputField id="new-due" name="due_at" type="date" label="Due date" error={fe.due_at} />
        <InputField id="new-points" name="points" type="number" label="Points" error={fe.points} />
      </div>
      <button type="submit" disabled={pending} aria-disabled={pending} className={secondaryButton}>
        <PlusCircle className="w-4 h-4" aria-hidden="true" />
        {pending ? 'Adding…' : 'Add assignment'}
      </button>
    </form>
  );
}
