'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn, signUp, type FormState } from '@/app/(auth)/actions';
import { FormAlert, SubmitButton, TextField, submitWithoutReset } from './fields';

/**
 * Sign-in and Create-account form, laid out like the whiteboard sketch:
 * fields in the middle, the "I'm an instructor" toggle box bottom-left,
 * Create account and Forgot password on the right.
 */
export function CredentialsForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignUp = mode === 'sign-up';
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    isSignUp ? signUp : signIn,
    undefined
  );
  const [instructor, setInstructor] = useState(false);

  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const linkProblem = searchParams.get('error') === 'link';
  const signedOut = searchParams.get('signed-out') === '1';
  const askedToSignIn = !isSignUp && next !== '';

  const fe = state?.fieldErrors ?? {};
  const linkClass =
    'font-bold text-[#BA0C2F] underline underline-offset-4 decoration-2 hover:text-[#990000] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2';

  return (
    <form onSubmit={submitWithoutReset(formAction)} noValidate className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
      <input type="hidden" name="next" value={next} />

      {/* Middle column: messages and the email + password fields */}
      <div className="md:col-start-5 md:col-span-5 md:row-start-1 space-y-4">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
        {!state && linkProblem && (
          <FormAlert tone="error">
            That link has expired or was already used. Sign in below, or use Forgot password to get a new link.
          </FormAlert>
        )}
        {!state && signedOut && <FormAlert tone="success">You’re signed out.</FormAlert>}
        {!state && askedToSignIn && !linkProblem && (
          <FormAlert tone="info">Sign in to open that page.</FormAlert>
        )}

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete={isSignUp ? 'email' : 'username'}
          inputMode="email"
          hint={isSignUp ? 'Use your @osu.edu email.' : undefined}
          defaultValue={state?.values?.email}
          error={fe.email}
          maxLength={254}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          hint={isSignUp ? '8 to 72 characters.' : undefined}
          error={fe.password}
          maxLength={72}
        />
      </div>

      {/* Bottom-left box: "I'm an instructor" toggle */}
      <div className="md:col-start-1 md:col-span-4 md:row-start-2">
        <div className="rounded-3xl border-2 border-neutral-900 bg-white p-5 space-y-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-base font-bold text-neutral-950">I’m an instructor</span>
              <span className="block text-xs text-neutral-700 mt-0.5">You’ll need the code from the CompassAI team.</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              name="instructor"
              checked={instructor}
              onChange={(e) => setInstructor(e.target.checked)}
              aria-checked={instructor}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-neutral-900 bg-neutral-200 transition-colors peer-checked:bg-[#BA0C2F] peer-focus-visible:ring-2 peer-focus-visible:ring-[#BA0C2F] peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-neutral-900 after:transition-transform peer-checked:after:translate-x-5"
            />
          </label>
          <p className="text-xs font-semibold text-neutral-700" aria-live="polite">
            {instructor ? 'On: enter your instructor code below.' : 'Off: you’ll use CompassAI as a student.'}
          </p>
          {instructor && (
            <TextField
              id="code"
              label="Instructor code"
              autoComplete="off"
              error={fe.code}
              maxLength={100}
            />
          )}
        </div>
      </div>

      {/* Middle column, second row: the main button */}
      <div className="md:col-start-5 md:col-span-5 md:row-start-2 md:self-end">
        <SubmitButton
          pending={pending}
          label={isSignUp ? 'Create account' : 'Sign in'}
          pendingLabel={isSignUp ? 'Creating account…' : 'Signing in…'}
        />
      </div>

      {/* Right column: account links */}
      <nav aria-label="Account" className="md:col-start-10 md:col-span-3 md:row-start-1 md:row-span-2">
        <ul className="space-y-4 text-base md:pt-8">
          <li>
            {isSignUp ? (
              <span className="text-neutral-800">
                Have an account?{' '}
                <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : '/sign-in'} className={linkClass}>
                  Sign in
                </Link>
              </span>
            ) : (
              <Link href={next ? `/sign-up?next=${encodeURIComponent(next)}` : '/sign-up'} className={linkClass}>
                Create account
              </Link>
            )}
          </li>
          <li>
            <Link href="/forgot-password" className={linkClass}>
              Forgot password
            </Link>
          </li>
          <li>
            <Link href="/" className="text-sm font-semibold text-neutral-700 underline underline-offset-4 hover:text-neutral-950 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]">
              Browse courses without signing in
            </Link>
          </li>
        </ul>
      </nav>
    </form>
  );
}
