'use client';

import React, { useActionState, useEffect, useId, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { updateFirstName, type NameState } from '@/app/(auth)/actions';
import { FIRST_NAME_MAX } from '@/lib/names';
import { submitWithoutReset } from '@/components/auth/fields';

/**
 * The signed-in person in the header. Clicking it opens a small "Change name" box, so people
 * who signed up before names existed (or made a typo) can set the name we greet them with.
 */
export function NameMenu({ email, firstName }: { email: string; firstName?: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<NameState | undefined, FormData>(
    async (prev, formData) => {
      const result = await updateFirstName(prev, formData);
      if (result.saved !== undefined) setOpen(false);
      return result;
    },
    undefined,
  );
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxId = useId();
  const errorId = useId();

  // Escape or a click outside closes the box; focus starts in the name field.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const shown = firstName ?? email;
  const error = open ? state?.error : undefined;

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={boxId}
        title="Change the name we greet you with"
        className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-neutral-300 bg-white hover:border-neutral-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
      >
        <span
          className="w-6 h-6 rounded-full bg-[#BA0C2F] text-white flex items-center justify-center font-bold text-xs"
          aria-hidden="true"
        >
          {shown.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:block text-xs font-semibold text-neutral-900 max-w-[180px] truncate">{shown}</span>
        <Pencil className="w-3 h-3 text-neutral-500" aria-hidden="true" />
        <span className="sr-only">Change name</span>
      </button>

      {open && (
        <div
          id={boxId}
          role="dialog"
          aria-label="Change name"
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-neutral-300 rounded-xl shadow-lg p-4 z-40 text-left"
        >
          <form onSubmit={submitWithoutReset(formAction)} noValidate className="space-y-3">
            <div className="space-y-1">
              <label htmlFor={`${boxId}-name`} className="block text-sm font-bold text-neutral-900">
                What should we call you?
              </label>
              <p className="text-xs text-neutral-600 truncate">Signed in as {email}</p>
              <input
                ref={inputRef}
                id={`${boxId}-name`}
                name="firstName"
                type="text"
                autoComplete="given-name"
                defaultValue={firstName ?? ''}
                maxLength={FIRST_NAME_MAX}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="w-full px-3 py-2 text-sm bg-white border-2 border-neutral-400 focus:border-neutral-900 rounded-lg text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              />
              {error ? (
                <p id={errorId} role="alert" className="text-xs font-semibold text-[#9B0A27]">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-neutral-600">Leave it blank to go back to the name from your email.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-400 text-neutral-800 hover:bg-neutral-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#BA0C2F] hover:bg-[#990000] text-white disabled:opacity-60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
