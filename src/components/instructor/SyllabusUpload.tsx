'use client';

import React, { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FormAlert } from '@/components/auth/fields';
import { primaryButton } from './InstructorChrome';

const MAX_BYTES = 10 * 1024 * 1024;

type Step =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'reading' }
  | { kind: 'error'; message: string; retryPath?: string; existingCourseId?: string };

export function SyllabusUpload({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [fileError, setFileError] = useState<string>();
  const hintId = useId();
  const errorId = useId();
  const busy = step.kind === 'uploading' || step.kind === 'reading';

  async function readSyllabus(path: string) {
    setStep({ kind: 'reading' });
    try {
      const res = await fetch('/api/courses/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.courseId) {
        router.push(`/instructor/courses/${data.courseId}?imported=${data.assignments ?? 0}`);
        return;
      }
      setStep({
        kind: 'error',
        message: data.error ?? 'Reading the syllabus failed. Try again.',
        retryPath: data.retry || res.status >= 500 ? path : undefined,
        existingCourseId: data.courseId,
      });
    } catch {
      setStep({ kind: 'error', message: 'We lost the connection while reading your syllabus. Try again.', retryPath: path });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFileError(undefined);

    const file = inputRef.current?.files?.[0];
    if (!file) return setFileError('Choose your syllabus PDF first.');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return setFileError('That isn’t a PDF. Export your syllabus as a PDF from Word or Canvas, then choose it.');
    if (file.size > MAX_BYTES) return setFileError('That PDF is over 10 MB. Export a smaller copy, for example without images.');
    if (file.size === 0) return setFileError('That file is empty. Choose your syllabus PDF again.');

    setStep({ kind: 'uploading' });
    // Straight to private storage: Vercel can't accept files this big through our own server.
    const path = `${userId}/${crypto.randomUUID()}.pdf`;
    const { error } = await createClient()
      .storage.from('syllabi')
      .upload(path, file, { contentType: 'application/pdf', upsert: false });
    if (error) {
      setStep({ kind: 'error', message: 'Uploading the PDF failed. Check your connection and try again.' });
      return;
    }
    await readSyllabus(path);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="bg-white border-2 border-neutral-900 rounded-3xl p-6 space-y-5 max-w-2xl">
      {step.kind === 'error' && (
        <FormAlert tone="error">
          <p>{step.message}</p>
          {step.existingCourseId && (
            <p className="mt-1">
              <Link href={`/instructor/courses/${step.existingCourseId}`} className="font-bold underline underline-offset-2">
                Open that course
              </Link>
            </p>
          )}
        </FormAlert>
      )}

      <div className="space-y-1.5">
        <label htmlFor="syllabus" className="block text-sm font-bold text-neutral-900">
          Syllabus PDF
        </label>
        <p id={hintId} className="text-xs text-neutral-600">
          PDF only, up to 10 MB. Export it from Word or Canvas if you need to.
        </p>
        <input
          ref={inputRef}
          id="syllabus"
          name="syllabus"
          type="file"
          accept="application/pdf,.pdf"
          disabled={busy}
          onChange={() => setFileError(undefined)}
          aria-invalid={fileError ? true : undefined}
          aria-describedby={[hintId, fileError ? errorId : null].filter(Boolean).join(' ')}
          className="block w-full text-sm text-neutral-900 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-2 file:border-neutral-900 file:bg-neutral-100 file:font-bold file:text-neutral-900 file:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] rounded-xl"
        />
        {fileError && (
          <p id={errorId} className="text-sm font-semibold text-[#9B0A27]">
            {fileError}
          </p>
        )}
      </div>

      <div role="status" aria-live="polite" className="text-sm font-semibold text-neutral-800 min-h-5">
        {step.kind === 'uploading' && (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" aria-hidden="true" /> Uploading your PDF…
          </span>
        )}
        {step.kind === 'reading' && (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#BA0C2F]" aria-hidden="true" />
            Reading your syllabus with Claude… this can take up to a minute. Keep this page open.
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {step.kind === 'error' && step.retryPath ? (
          <button type="button" className={primaryButton} onClick={() => readSyllabus(step.retryPath!)}>
            Try again
          </button>
        ) : (
          <button type="submit" disabled={busy} aria-disabled={busy} className={primaryButton}>
            <FileUp className="w-4 h-4" aria-hidden="true" />
            {busy ? 'Working…' : 'Upload and read syllabus'}
          </button>
        )}
      </div>
    </form>
  );
}
