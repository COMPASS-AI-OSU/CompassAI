'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, EyeOff, Globe, ListChecks } from 'lucide-react';
import { publishCourse, unpublishCourse, type ActionState } from '@/app/instructor/courses/actions';
import { FormAlert } from '@/components/auth/fields';
import { primaryButton, secondaryButton } from './InstructorChrome';

/** Draft ↔ Published (issue #9). Lists what's missing before Publish works. */
export function PublishPanel({
  courseId,
  status,
  problems,
}: {
  courseId: string;
  status: 'draft' | 'published';
  problems: string[];
}) {
  const [result, setResult] = useState<ActionState>();
  const [askingUnpublish, setAskingUnpublish] = useState(false);
  const [pending, start] = useTransition();
  const published = status === 'published';
  const ready = problems.length === 0;

  const run = (action: (id: string) => Promise<ActionState>) =>
    start(async () => {
      setResult(await action(courseId));
      setAskingUnpublish(false);
    });

  return (
    <section
      aria-labelledby="publish-heading"
      className={`rounded-2xl p-5 sm:p-6 space-y-4 border-2 ${
        published ? 'bg-emerald-50 border-emerald-700' : 'bg-white border-neutral-900'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="publish-heading" className="text-lg font-bold text-neutral-950 flex items-center gap-2">
            {published ? (
              <Globe className="w-5 h-5 text-emerald-800" aria-hidden="true" />
            ) : (
              <EyeOff className="w-5 h-5 text-neutral-700" aria-hidden="true" />
            )}
            {published ? 'Published' : 'Draft'}
          </h2>
          <p className="text-sm text-neutral-800">
            {published
              ? 'Students can find this course in search and see its confirmed assignment rules. Changes you save show to students right away.'
              : 'Only you can see this course. Publish it when every assignment is confirmed.'}
          </p>
        </div>

        {published ? (
          !askingUnpublish ? (
            <button type="button" disabled={pending} onClick={() => setAskingUnpublish(true)} className={secondaryButton}>
              <EyeOff className="w-4 h-4" aria-hidden="true" /> Unpublish
            </button>
          ) : (
            <div role="group" aria-label="Confirm unpublish" className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-neutral-900">Hide this course from students?</span>
              <button type="button" disabled={pending} onClick={() => run(unpublishCourse)} className={primaryButton}>
                {pending ? 'Unpublishing…' : 'Yes, unpublish'}
              </button>
              <button type="button" disabled={pending} onClick={() => setAskingUnpublish(false)} className={secondaryButton}>
                Cancel
              </button>
            </div>
          )
        ) : (
          <button
            type="button"
            disabled={!ready || pending}
            aria-disabled={!ready || pending}
            aria-describedby={!ready ? 'publish-missing' : undefined}
            onClick={() => run(publishCourse)}
            className={`${primaryButton} disabled:cursor-not-allowed`}
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            {pending ? 'Publishing…' : 'Publish'}
          </button>
        )}
      </div>

      {!published && !ready && (
        <div id="publish-missing" className="rounded-xl bg-neutral-50 border border-neutral-300 p-3.5 text-sm text-neutral-900">
          <p className="flex items-center gap-1.5 font-bold">
            <ListChecks className="w-4 h-4 text-[#BA0C2F]" aria-hidden="true" /> Before you can publish:
          </p>
          <ul className="mt-1.5 list-disc pl-6 space-y-0.5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {!published && ready && !result && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Every assignment is confirmed. Ready to publish.
        </p>
      )}

      <div aria-live="polite">
        {result?.error && <FormAlert tone="error">{result.error}</FormAlert>}
        {result?.saved && <FormAlert tone="success">{result.saved}</FormAlert>}
      </div>
    </section>
  );
}
