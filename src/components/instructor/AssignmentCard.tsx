'use client';

import React, { useActionState, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, Quote, Trash2 } from 'lucide-react';
import { deleteAssignment, saveAssignment, type ActionState } from '@/app/instructor/courses/actions';
import { FormAlert, submitWithoutReset } from '@/components/auth/fields';
import { AiLevelSelect, InputField, TextAreaField } from './inputs';
import { primaryButton, secondaryButton } from './InstructorChrome';

export interface AssignmentRow {
  id: string;
  title: string;
  due_at: string | null;
  due_text: string | null;
  points: number | null;
  ai_level: string | null;
  instructor_comment: string | null;
  syllabus_quote: string | null;
  status: 'needs_review' | 'confirmed';
}

export function AssignmentCard({ assignment, index }: { assignment: AssignmentRow; index: number }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    saveAssignment.bind(null, assignment.id),
    undefined
  );
  const [askingDelete, setAskingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, startDelete] = useTransition();
  const fe = state?.fieldErrors ?? {};
  const confirmed = assignment.status === 'confirmed';
  const busy = pending || deleting;
  const id = (field: string) => `a-${assignment.id}-${field}`;
  const headingId = id('heading');

  return (
    <article
      aria-labelledby={headingId}
      className={`bg-white rounded-2xl p-5 sm:p-6 space-y-4 border-2 ${confirmed ? 'border-emerald-700/50' : 'border-neutral-900'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 id={headingId} className="text-base font-bold text-neutral-950">
          <span className="text-neutral-500 font-mono text-sm mr-1.5">#{index + 1}</span>
          {assignment.title}
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
            confirmed ? 'bg-emerald-50 border-emerald-700 text-emerald-900' : 'bg-amber-50 border-amber-700 text-amber-950'
          }`}
        >
          {confirmed ? (
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {confirmed ? 'Confirmed' : 'Needs review'}
        </span>
      </div>

      {assignment.syllabus_quote && (
        <figure className="flex gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-800">
          <Quote className="w-4 h-4 shrink-0 mt-0.5 text-[#BA0C2F]" aria-hidden="true" />
          <div>
            <figcaption className="text-xs font-bold uppercase tracking-wide text-neutral-600">From your syllabus</figcaption>
            <blockquote className="italic">“{assignment.syllabus_quote}”</blockquote>
          </div>
        </figure>
      )}

      <form onSubmit={submitWithoutReset(action)} noValidate className="space-y-4">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
        {state?.saved && <FormAlert tone="success">{state.saved}</FormAlert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id={id('title')} name="title" label="Name" defaultValue={assignment.title} error={fe.title} maxLength={200} />
          <AiLevelSelect id={id('ai')} defaultValue={assignment.ai_level} error={fe.ai_level} />
          <InputField id={id('due')} name="due_at" type="date" label="Due date" defaultValue={assignment.due_at} error={fe.due_at} />
          <InputField id={id('points')} name="points" type="number" label="Points" defaultValue={assignment.points} error={fe.points} />
        </div>
        <InputField
          id={id('due-text')}
          name="due_text"
          label="Due date note (optional)"
          hint="As written in your syllabus, like “Weekly, before class”."
          defaultValue={assignment.due_text}
          error={fe.due_text}
          maxLength={200}
        />
        <TextAreaField
          id={id('comment')}
          name="instructor_comment"
          label="Your comment for students"
          defaultValue={assignment.instructor_comment}
          error={fe.instructor_comment}
          maxLength={1000}
        />

        <div className="flex flex-wrap items-center gap-3">
          {confirmed ? (
            <>
              <button type="submit" name="intent" value="save" disabled={busy} className={primaryButton}>
                {pending ? 'Saving…' : 'Save changes'}
              </button>
              <button type="submit" name="intent" value="unconfirm" disabled={busy} className={secondaryButton}>
                Mark as needs review
              </button>
            </>
          ) : (
            <>
              <button type="submit" name="intent" value="confirm" disabled={busy} className={primaryButton}>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                {pending ? 'Saving…' : 'Confirm'}
              </button>
              <button type="submit" name="intent" value="save" disabled={busy} className={secondaryButton}>
                Save without confirming
              </button>
            </>
          )}

          {!askingDelete ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setAskingDelete(true)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[#9B0A27] hover:bg-[#BA0C2F]/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
            </button>
          ) : (
            <div role="group" aria-label="Confirm delete" className="ml-auto flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-neutral-900">Delete this assignment?</span>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  startDelete(async () => {
                    const result = await deleteAssignment(assignment.id);
                    if (result.error) setDeleteError(result.error);
                  })
                }
                className="px-3 py-2 rounded-xl bg-[#BA0C2F] text-white font-bold cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setAskingDelete(false)}
                className="px-3 py-2 rounded-xl border-2 border-neutral-900 font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {deleteError && <FormAlert tone="error">{deleteError}</FormAlert>}
      </form>
    </article>
  );
}
