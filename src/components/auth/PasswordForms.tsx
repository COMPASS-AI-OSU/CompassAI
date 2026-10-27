'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset, updatePassword, type FormState } from '@/app/(auth)/actions';
import { FormAlert, SubmitButton, TextField, submitWithoutReset } from './fields';

const linkClass =
  'font-bold text-[#BA0C2F] underline underline-offset-4 decoration-2 hover:text-[#990000] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(requestPasswordReset, undefined);

  if (state?.success === 'reset-sent') {
    return (
      <div className="max-w-md space-y-4">
        <FormAlert tone="success">
          If <strong>{state.values?.email}</strong> has a CompassAI account, we sent it a link to set a new password.
          Open it in this browser.
        </FormAlert>
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submitWithoutReset(formAction)} noValidate className="max-w-md space-y-4">
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        inputMode="email"
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
        maxLength={254}
      />
      <SubmitButton pending={pending} label="Send reset link" pendingLabel="Sending…" />
      <p className="text-sm">
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(updatePassword, undefined);
  return (
    <form onSubmit={submitWithoutReset(formAction)} noValidate className="max-w-md space-y-4">
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <TextField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="8 to 72 characters."
        error={state?.fieldErrors?.password}
        maxLength={72}
      />
      <TextField
        id="confirm"
        label="Type it again"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirm}
        maxLength={72}
      />
      <SubmitButton pending={pending} label="Save new password" pendingLabel="Saving…" />
    </form>
  );
}
