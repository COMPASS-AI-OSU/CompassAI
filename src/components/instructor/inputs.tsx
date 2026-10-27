import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AI_LEVELS, AI_LEVEL_LABELS } from '@/lib/ai-levels';

const inputBase =
  'w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border-2 rounded-xl text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-1';

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-semibold text-[#9B0A27]">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  defaultValue,
  error,
  hint,
  maxLength,
  rows = 3,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  error?: string;
  hint?: string;
  maxLength?: number;
  rows?: number;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-neutral-900">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-neutral-600">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputBase} ${error ? 'border-[#BA0C2F]' : 'border-neutral-400 focus:border-neutral-900'}`}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function InputField({
  id,
  name,
  label,
  type = 'text',
  defaultValue,
  error,
  hint,
  maxLength,
}: {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date';
  defaultValue?: string | number | null;
  error?: string;
  hint?: string;
  maxLength?: number;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-neutral-900">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-neutral-600">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        step={type === 'number' ? 'any' : undefined}
        min={type === 'number' ? 0 : undefined}
        defaultValue={defaultValue ?? ''}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputBase} ${error ? 'border-[#BA0C2F]' : 'border-neutral-400 focus:border-neutral-900'}`}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function AiLevelSelect({ id, defaultValue, error }: { id: string; defaultValue?: string | null; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-neutral-900">
        AI level
      </label>
      <select
        id={id}
        name="ai_level"
        defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} ${error ? 'border-[#BA0C2F]' : 'border-neutral-400 focus:border-neutral-900'}`}
      >
        <option value="">Choose a level…</option>
        {AI_LEVELS.map((level) => (
          <option key={level} value={level}>
            {AI_LEVEL_LABELS[level]}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}
