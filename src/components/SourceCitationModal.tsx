'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Check, Copy, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import {
  CITATION_STYLES,
  EMPTY_SOURCE,
  SOURCE_TYPES,
  formatCitation,
  html,
  missingFields,
  plainText,
  type CitationStyle,
  type Source,
  type SourceType,
} from '@/lib/citations';
import { lookupDoi } from '@/app/citations/actions';

const STYLE_KEY = 'compass-citation-style';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const field =
  'w-full px-3 py-2 text-sm bg-white border-2 border-neutral-400 focus:border-neutral-900 rounded-xl text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function savedStyle(): CitationStyle {
  try {
    const s = localStorage.getItem(STYLE_KEY);
    if (CITATION_STYLES.some((x) => x.id === s)) return s as CitationStyle;
  } catch {
    // Storage blocked: use the default.
  }
  return 'apa';
}

function TextInput({
  label,
  value,
  onChange,
  hint,
  maxLength = 300,
  inputMode,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: 'text' | 'date' | 'url';
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-bold text-neutral-900">
        {label}
      </label>
      {hint && <p className="text-xs text-neutral-600">{hint}</p>}
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </div>
  );
}

/** Traditional citation generator (#47): websites, books and journal articles in 6 styles. */
export function SourceCitationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <CitationDialog onClose={onClose} />;
}

function CitationDialog({ onClose }: { onClose: () => void }) {
  const [style, setStyle] = useState<CitationStyle>(savedStyle);
  const [source, setSource] = useState<Source>({ ...EMPTY_SOURCE, accessed: todayIso() });
  const [doiInput, setDoiInput] = useState('');
  const [lookup, setLookup] = useState<{ state: 'idle' | 'loading' | 'done' | 'error'; message?: string }>({ state: 'idle' });
  const [copied, setCopied] = useState<'reference' | 'intext' | 'failed' | null>(null);
  const titleId = useId();
  const referenceRef = useRef<HTMLParagraphElement>(null);
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof Source>(key: K, value: Source[K]) => {
    setCopied(null);
    setSource((prev) => ({ ...prev, [key]: value }));
  };
  const setAuthor = (i: number, key: 'first' | 'last', value: string) => {
    setCopied(null);
    setSource((prev) => ({ ...prev, authors: prev.authors.map((a, j) => (j === i ? { ...a, [key]: value } : a)) }));
  };

  const chooseStyle = (next: CitationStyle) => {
    setStyle(next);
    setCopied(null);
    try {
      localStorage.setItem(STYLE_KEY, next);
    } catch {
      // Remembering the style is only a convenience.
    }
  };

  const chooseType = (type: SourceType) => {
    setCopied(null);
    setLookup({ state: 'idle' });
    setSource((prev) => ({ ...prev, type }));
  };

  const runLookup = async () => {
    if (!doiInput.trim() || lookup.state === 'loading') return;
    setLookup({ state: 'loading' });
    const result = await lookupDoi(doiInput);
    if (!result.fields) {
      setLookup({ state: 'error', message: result.error });
      return;
    }
    const f = result.fields;
    setSource((prev) => ({
      ...prev,
      ...f,
      authors: f.authors.length ? f.authors : prev.authors,
    }));
    setCopied(null);
    setLookup({ state: 'done', message: 'Filled in from the DOI. Check each field before you copy.' });
  };

  const missing = missingFields(source);
  const citation = formatCitation(source, style);
  const ready = missing.length === 0;

  const copy = async (what: 'reference' | 'intext') => {
    const text = what === 'reference' ? plainText(citation.reference) : citation.inText;
    try {
      if (what === 'reference' && typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        // Rich copy keeps the italics when pasted into Word, Google Docs or Canvas.
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'text/html': new Blob([html(citation.reference)], { type: 'text/html' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(what);
    } catch {
      setCopied('failed');
      const el = referenceRef.current;
      if (el && what === 'reference') {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  const isWeb = source.type === 'website';
  const isBook = source.type === 'book';
  const isJournal = source.type === 'journal';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white theme-keep">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#BA0C2F] flex items-center justify-center">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id={titleId} className="text-base font-bold">
                Cite a source
              </h3>
              <p className="text-xs text-neutral-300">Websites, books and journal articles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor={`${titleId}-style`} className="block text-sm font-bold text-neutral-900">
                Citation style
              </label>
              <select
                ref={firstRef}
                id={`${titleId}-style`}
                value={style}
                onChange={(e) => chooseStyle(e.target.value as CitationStyle)}
                className={field}
              >
                {CITATION_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="space-y-1">
              <legend className="block text-sm font-bold text-neutral-900">What are you citing?</legend>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-neutral-400 cursor-pointer has-checked:border-[#BA0C2F] has-checked:bg-[#BA0C2F]/5 font-semibold text-neutral-900"
                  >
                    <input
                      type="radio"
                      name={`${titleId}-type`}
                      checked={source.type === t.id}
                      onChange={() => chooseType(t.id)}
                      className="accent-[#BA0C2F]"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {isJournal && (
            <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-3 space-y-2">
              <label htmlFor={`${titleId}-doi`} className="block text-sm font-bold text-neutral-900">
                Have a DOI? Fill in the rest automatically
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id={`${titleId}-doi`}
                  value={doiInput}
                  maxLength={250}
                  onChange={(e) => setDoiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      runLookup();
                    }
                  }}
                  placeholder="10.1037/0003-066X.59.1.29 or https://doi.org/…"
                  className={`${field} flex-1 min-w-48`}
                />
                <button
                  type="button"
                  onClick={runLookup}
                  disabled={lookup.state === 'loading' || !doiInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white text-sm font-bold disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
                >
                  {lookup.state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Search className="w-4 h-4" aria-hidden="true" />}
                  {lookup.state === 'loading' ? 'Looking up…' : 'Look up'}
                </button>
              </div>
              <p aria-live="polite" className="text-xs font-semibold min-h-4">
                {lookup.state === 'error' && <span className="text-[#9B0A27]">{lookup.message}</span>}
                {lookup.state === 'done' && <span className="text-emerald-800">{lookup.message}</span>}
              </p>
            </div>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-neutral-900">Authors</legend>
            <p className="text-xs text-neutral-600">Leave blank if there’s no author. The title will go first instead.</p>
            {source.authors.map((a, i) => (
              <div key={i} className="flex gap-2 items-end">
                <label className="flex-1 text-xs font-semibold text-neutral-800">
                  First name
                  <input value={a.first} maxLength={80} onChange={(e) => setAuthor(i, 'first', e.target.value)} className={`${field} mt-0.5`} />
                </label>
                <label className="flex-1 text-xs font-semibold text-neutral-800">
                  Last name
                  <input value={a.last} maxLength={80} onChange={(e) => setAuthor(i, 'last', e.target.value)} className={`${field} mt-0.5`} />
                </label>
                {source.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => set('authors', source.authors.filter((_, j) => j !== i))}
                    aria-label={`Remove author ${i + 1}`}
                    className="p-2.5 rounded-xl border-2 border-neutral-400 text-neutral-800 hover:bg-neutral-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            {source.authors.length < 30 && (
              <button
                type="button"
                onClick={() => set('authors', [...source.authors, { first: '', last: '' }])}
                className="inline-flex items-center gap-1 text-sm font-bold text-[#BA0C2F] hover:underline cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add another author
              </button>
            )}
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <TextInput
                label={isWeb ? 'Page title' : isBook ? 'Book title' : 'Article title'}
                hint={isJournal ? 'APA uses sentence case for article titles (only the first word and names capitalized).' : undefined}
                value={source.title}
                onChange={(v) => set('title', v)}
              />
            </div>
            {(isWeb || isJournal) && (
              <div className="sm:col-span-2">
                <TextInput label={isWeb ? 'Website name' : 'Journal name'} value={source.container} onChange={(v) => set('container', v)} />
              </div>
            )}
            {isBook && (
              <>
                <TextInput label="Publisher" value={source.publisher} onChange={(v) => set('publisher', v)} />
                <TextInput label="Edition (optional)" hint="Leave blank for a first edition." value={source.edition} onChange={(v) => set('edition', v)} maxLength={20} />
                <div className="sm:col-span-2">
                  <TextInput
                    label="Place of publication (optional)"
                    hint="Like New York, or New York, NY, USA for IEEE. Chicago, Harvard and IEEE use it."
                    value={source.place}
                    onChange={(v) => set('place', v)}
                    maxLength={100}
                  />
                </div>
              </>
            )}
            {isJournal && (
              <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                <TextInput label="Volume" value={source.volume} onChange={(v) => set('volume', v)} maxLength={20} inputMode="numeric" />
                <TextInput label="Issue" value={source.issue} onChange={(v) => set('issue', v)} maxLength={20} />
                <TextInput label="Pages" hint="Like 29-40" value={source.pages} onChange={(v) => set('pages', v)} maxLength={30} />
              </div>
            )}
            <div className="sm:col-span-2 grid grid-cols-3 gap-3">
              <TextInput label={isWeb ? 'Year published' : 'Year'} value={source.year} onChange={(v) => set('year', v.replace(/\D/g, ''))} maxLength={4} inputMode="numeric" />
              {(isWeb || isJournal) && (
                <>
                  <div className="space-y-1">
                    <label htmlFor={`${titleId}-month`} className="block text-sm font-bold text-neutral-900">
                      Month
                    </label>
                    <select id={`${titleId}-month`} value={source.month} onChange={(e) => set('month', e.target.value)} className={field}>
                      <option value="">—</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isWeb ? (
                    <TextInput label="Day" value={source.day} onChange={(v) => set('day', v.replace(/\D/g, ''))} maxLength={2} inputMode="numeric" />
                  ) : (
                    <div />
                  )}
                </>
              )}
            </div>
            <div className="sm:col-span-2">
              <TextInput
                label={isWeb ? 'URL' : 'URL (optional)'}
                type="url"
                value={source.url}
                onChange={(v) => set('url', v)}
                maxLength={500}
              />
            </div>
            {!isWeb && (
              <div className="sm:col-span-2">
                <TextInput label="DOI (optional)" value={source.doi} onChange={(v) => set('doi', v)} maxLength={250} />
              </div>
            )}
            {isWeb && <TextInput label="Date you visited" type="date" value={source.accessed} onChange={(v) => set('accessed', v)} />}
          </div>

          <section aria-label="Your citation" className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-neutral-900">Reference list entry</span>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => copy('reference')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
                >
                  {copied === 'reference' ? <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                  {copied === 'reference' ? 'Copied' : 'Copy'}
                </button>
              </div>
              {ready ? (
                <p
                  ref={referenceRef}
                  className="text-sm text-neutral-950 bg-neutral-50 p-3 rounded-lg border border-neutral-300 break-words"
                  style={{ paddingLeft: '2.25rem', textIndent: '-1.5rem' }}
                >
                  {citation.reference.map((seg, i) => (seg.italic ? <i key={i}>{seg.text}</i> : <React.Fragment key={i}>{seg.text}</React.Fragment>))}
                </p>
              ) : (
                <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-dashed border-neutral-400">
                  To see your citation, add {missing.join(' and ')}.
                </p>
              )}
            </div>
            {ready && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-neutral-800">
                  <span className="font-bold">In-text:</span> {citation.inText}
                </p>
                <button
                  type="button"
                  onClick={() => copy('intext')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
                >
                  {copied === 'intext' ? <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                  {copied === 'intext' ? 'Copied' : 'Copy in-text'}
                </button>
              </div>
            )}
            <p role="status" aria-live="polite" className="text-xs font-semibold min-h-4">
              {copied === 'reference' && <span className="text-emerald-800">Copied with italics. Paste it into your reference list.</span>}
              {copied === 'intext' && <span className="text-emerald-800">In-text citation copied.</span>}
              {copied === 'failed' && (
                <span className="text-[#9B0A27]">Couldn’t copy automatically. The citation is selected: press Ctrl+C (or ⌘C).</span>
              )}
            </p>
            <p className="text-xs text-neutral-600">
              Always check the result against your instructor’s style guide. CompassAI formats what you enter and doesn’t
              check it against the original source.
            </p>
          </section>
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-[#BA0C2F] hover:bg-[#990000] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
