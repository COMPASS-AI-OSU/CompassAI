'use server';

import { getCurrentUser } from '@/lib/auth';
import type { Source } from '@/lib/citations';

const DOI = /^10\.\d{4,9}\/\S{1,200}$/;

type DoiFields = Pick<Source, 'authors' | 'title' | 'container' | 'publisher' | 'volume' | 'issue' | 'pages' | 'year' | 'month' | 'day' | 'doi'>;

/**
 * Fills in a journal article's details from its DOI using Crossref's free public API
 * (#47). Only the DOI is sent; nothing about the student.
 */
export async function lookupDoi(input: string): Promise<{ fields?: DoiFields; error?: string }> {
  // CLAUDE.md: re-check the user in every Server Action. Typing details by hand still works logged out.
  const user = await getCurrentUser();
  if (!user) return { error: 'Sign in to look up a DOI. You can still fill in the details yourself.' };

  const doi = String(input ?? '')
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '');
  if (!DOI.test(doi)) return { error: 'That doesn’t look like a DOI. It starts with 10., like 10.1037/0003-066X.59.1.29.' };

  let res: Response;
  try {
    res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'CompassAI/1.0 (student citation generator)' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
  } catch {
    return { error: 'We couldn’t reach the DOI lookup right now. Fill in the details yourself, or try again.' };
  }
  if (res.status === 404) return { error: 'We couldn’t find that DOI. Check it, or fill in the details yourself.' };
  if (!res.ok) return { error: 'The DOI lookup isn’t working right now. Fill in the details yourself, or try again.' };

  type CrossrefWork = {
    title?: string[];
    'container-title'?: string[];
    publisher?: string;
    volume?: string;
    issue?: string;
    page?: string;
    DOI?: string;
    author?: { given?: string; family?: string; name?: string }[];
    'published-print'?: { 'date-parts'?: number[][] };
    'published-online'?: { 'date-parts'?: number[][] };
    issued?: { 'date-parts'?: number[][] };
  };
  const work = ((await res.json().catch(() => null)) as { message?: CrossrefWork } | null)?.message;
  if (!work) return { error: 'The DOI lookup sent back something we couldn’t read. Fill in the details yourself.' };

  const [y, m, d] =
    work['published-print']?.['date-parts']?.[0] ?? work['published-online']?.['date-parts']?.[0] ?? work.issued?.['date-parts']?.[0] ?? [];
  const text = (v: string | number | undefined, max = 300) => (v === undefined || v === null ? '' : String(v).replace(/\s+/g, ' ').trim().slice(0, max));
  // Crossref titles can contain markup such as <i>…</i>, <sub>…</sub> or <scp>…</scp>; keep only the words.
  const plain = (v: string | undefined, max = 300) =>
    text(
      (v ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&amp;/g, '&'),
      max
    );

  return {
    fields: {
      authors: (work.author ?? [])
        .slice(0, 30)
        .map((a) => ({ first: text(a.given, 80), last: text(a.family ?? a.name, 80) }))
        .filter((a) => a.last),
      title: plain(work.title?.[0]),
      container: plain(work['container-title']?.[0]),
      publisher: text(work.publisher, 200),
      volume: text(work.volume, 20),
      issue: text(work.issue, 20),
      pages: text(work.page, 30),
      year: text(y, 4),
      month: text(m, 2),
      day: text(d, 2),
      doi: text(work.DOI ?? doi, 200),
    },
  };
}
