import React, { startTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Submits a form to a server action without React's automatic form reset,
 * so what someone typed (and the instructor toggle) stays put when we show an error.
 */
export function submitWithoutReset(formAction: (formData: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}

export function TextField({
  id,
  label,
  type = 'text',
  autoComplete,
  defaultValue,
  error,
  hint,
  maxLength,
  inputMode,
  autoFocus,
}: {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoFocus?: boolean;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-neutral-900">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-neutral-600">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        maxLength={maxLength}
        inputMode={inputMode}
        autoFocus={autoFocus}
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={`w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border-2 rounded-xl text-neutral-950 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-1 transition-colors ${
          error ? 'border-[#BA0C2F]' : 'border-neutral-400 focus:border-neutral-900'
        }`}
      />
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-semibold text-[#9B0A27]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: 'error' | 'info' | 'success'; children: React.ReactNode }) {
  const styles = {
    error: 'bg-[#BA0C2F]/10 border-[#BA0C2F] text-[#7A0820]',
    info: 'bg-white border-neutral-400 text-neutral-900',
    success: 'bg-emerald-50 border-emerald-700 text-emerald-950',
  }[tone];
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border-l-4 border px-3.5 py-3 text-sm font-medium ${styles}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-md space-y-4" aria-busy="true" aria-label="Loading form">
      <div className="h-4 w-24 bg-neutral-300 rounded animate-pulse" />
      <div className="h-11 bg-neutral-200 rounded-xl animate-pulse" />
      <div className="h-4 w-24 bg-neutral-300 rounded animate-pulse" />
      <div className="h-11 bg-neutral-200 rounded-xl animate-pulse" />
    </div>
  );
}
