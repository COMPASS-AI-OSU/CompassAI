/**
 * Traditional citation generator (#47). Plain code, no AI: turns what the student enters
 * into a reference-list entry and an in-text citation in each major style.
 *
 * Output is a list of segments so titles can be italic on screen and when pasted into
 * Word or Canvas; joining the segments' text gives the plain-text version.
 */

export const CITATION_STYLES = [
  { id: 'apa', label: 'APA 7' },
  { id: 'mla', label: 'MLA 9' },
  { id: 'chicago', label: 'Chicago 17 (bibliography)' },
  { id: 'chicago-ad', label: 'Chicago 17 (author-date)' },
  { id: 'harvard', label: 'Harvard' },
  { id: 'ieee', label: 'IEEE' },
] as const;
export type CitationStyle = (typeof CITATION_STYLES)[number]['id'];

export const SOURCE_TYPES = [
  { id: 'website', label: 'Website' },
  { id: 'book', label: 'Book' },
  { id: 'journal', label: 'Journal article' },
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number]['id'];

export interface Author {
  first: string; // given name(s), e.g. "Ray" or "Mary Jane"
  last: string; // family name
}

/** What the student enters. Empty strings mean "not given". */
export interface Source {
  type: SourceType;
  authors: Author[];
  title: string;
  container: string; // website name or journal name
  publisher: string;
  edition: string; // "2", "3rd", "Revised"
  volume: string;
  issue: string;
  pages: string; // "29-40" or "112"
  year: string;
  month: string; // 1-12, or ""
  day: string;
  url: string;
  doi: string;
  accessed: string; // YYYY-MM-DD, websites only
}

export const EMPTY_SOURCE: Source = {
  type: 'website',
  authors: [{ first: '', last: '' }],
  title: '',
  container: '',
  publisher: '',
  edition: '',
  volume: '',
  issue: '',
  pages: '',
  year: '',
  month: '',
  day: '',
  url: '',
  doi: '',
  accessed: '',
};

export interface Segment {
  text: string;
  italic?: boolean;
}

export interface Citation {
  reference: Segment[];
  inText: string;
}

// ---------- small helpers ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MLA_MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const IEEE_MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Adds final punctuation unless the text already ends with some (e.g. a title ending in "?"). */
function end(text: string, mark = '.'): string {
  const t = clean(text);
  return /[.?!]$/.test(t) ? t : t + mark;
}

function initials(first: string): string {
  return clean(first)
    .split(/[\s]+/)
    .filter(Boolean)
    .map((part) => part.split('-').map((p) => `${p[0].toUpperCase()}.`).join('-'))
    .join(' ');
}

function ordinal(edition: string): string {
  const e = clean(edition);
  const n = Number(e);
  if (!Number.isInteger(n) || n <= 0) return e;
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
}

function pageRange(pages: string, dash = '–'): string {
  return clean(pages).replace(/\s*[-–—]+\s*/g, dash);
}

function doiUrl(doi: string): string {
  const d = clean(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
  return d ? `https://doi.org/${d}` : '';
}

function bareDoi(doi: string): string {
  return doiUrl(doi).replace('https://doi.org/', '');
}

function monthIndex(month: string): number | null {
  const m = Number(month);
  return Number.isInteger(m) && m >= 1 && m <= 12 ? m - 1 : null;
}

function accessedParts(accessed: string): { y: string; m: number; d: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(accessed);
  if (!match) return null;
  return { y: match[1], m: Number(match[2]) - 1, d: String(Number(match[3])) };
}

/** Only authors with a last name count; a first name alone isn't enough to cite. */
function named(source: Source): Author[] {
  return source.authors.map((a) => ({ first: clean(a.first), last: clean(a.last) })).filter((a) => a.last);
}

function joinList(items: string[], conjunction: string, serialComma = true): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}${serialComma ? ',' : ''} ${conjunction} ${items.at(-1)}`;
}

/** Builds segments, dropping empty pieces and the separators around them. */
class Builder {
  segments: Segment[] = [];
  add(text: string, italic = false) {
    if (text) this.segments.push({ text, italic });
    return this;
  }
}

// ---------- author lists per style ----------

function apaAuthors(list: Author[]): string {
  const names = list.map((a) => (a.first ? `${a.last}, ${initials(a.first)}` : a.last));
  if (names.length > 20) return `${names.slice(0, 19).join(', ')}, . . . ${names.at(-1)}`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, & ${names.at(-1)}`;
}

function mlaAuthors(list: Author[]): string {
  const first = list[0].first ? `${list[0].last}, ${list[0].first}` : list[0].last;
  if (list.length === 1) return first;
  if (list.length === 2) return `${first}, and ${[list[1].first, list[1].last].filter(Boolean).join(' ')}`;
  return `${first}, et al`;
}

function chicagoAuthors(list: Author[]): string {
  const shown = list.length > 10 ? list.slice(0, 7) : list;
  const names = shown.map((a, i) => (i === 0 ? (a.first ? `${a.last}, ${a.first}` : a.last) : [a.first, a.last].filter(Boolean).join(' ')));
  if (list.length > 10) return `${names.join(', ')}, et al`;
  if (names.length === 2) return `${names[0]}, and ${names[1]}`;
  return joinList(names, 'and');
}

function harvardAuthors(list: Author[]): string {
  const names = list.map((a) => (a.first ? `${a.last}, ${initials(a.first)}` : a.last));
  if (names.length >= 4) return `${names[0]} et al.`;
  return joinList(names, 'and', false);
}

function ieeeAuthors(list: Author[]): string {
  const names = list.map((a) => [a.first ? initials(a.first) : '', a.last].filter(Boolean).join(' '));
  if (names.length > 6) return `${names[0]} et al.`;
  return joinList(names, 'and');
}

// ---------- in-text citations ----------

function inTextNames(list: Author[], style: CitationStyle, title: string): string {
  const short = title ? `${title.split(/\s+/).slice(0, 4).join(' ')}${title.split(/\s+/).length > 4 ? '…' : ''}` : 'Untitled';
  if (list.length === 0) return style === 'mla' || style === 'apa' ? `“${short}”` : short;
  if (list.length === 1) return list[0].last;
  if (list.length === 2) {
    const and = style === 'apa' ? '&' : 'and';
    return `${list[0].last} ${and} ${list[1].last}`;
  }
  if (style === 'chicago-ad' && list.length === 3) return `${list[0].last}, ${list[1].last}, and ${list[2].last}`;
  return `${list[0].last} et al.`;
}

/** Chicago short footnote: Names, Title (or “Title,”) page. */
function chicagoNote(names: string, type: SourceType, title: string, page: string): string {
  const lead = names ? `${names}, ` : '';
  if (type === 'book') return `${lead}${title}${page ? `, ${page}` : ''}.`;
  return page ? `${lead}“${title},” ${page}.` : `${lead}“${end(title)}”`;
}

// ---------- the formatter ----------

export function formatCitation(raw: Source, style: CitationStyle): Citation {
  // A title's own trailing period (common in DOI data) would double up with the style's punctuation.
  const s: Source = { ...raw, title: clean(raw.title).replace(/\.+$/, ''), container: clean(raw.container), publisher: clean(raw.publisher) };
  const authors = named(s);
  const year = clean(s.year);
  const mi = monthIndex(s.month);
  const day = clean(s.day);
  const doi = doiUrl(s.doi);
  const url = clean(s.url);
  const link = doi || url;
  const pages = pageRange(s.pages);
  const vol = clean(s.volume);
  const iss = clean(s.issue);
  const ed = clean(s.edition) ? ordinal(s.edition) : '';
  const acc = accessedParts(s.accessed);
  const title = s.title || 'Untitled';
  const b = new Builder();

  switch (style) {
    case 'apa': {
      const date = year
        ? s.type === 'website' && mi !== null
          ? `(${year}, ${MONTHS[mi]}${day ? ` ${day}` : ''})`
          : `(${year})`
        : '(n.d.)';
      const who = authors.length ? end(apaAuthors(authors)) : '';
      if (s.type === 'journal') {
        if (who) b.add(`${who} ${date}. `).add(`${end(title)} `);
        else b.add(`${end(title)} ${date}. `);
        if (s.container) {
          b.add(s.container, true);
          if (vol) b.add(', ').add(vol, true);
          if (iss) b.add(`(${iss})`);
          if (pages) b.add(`, ${pages}`);
          b.add('.');
        }
        if (link) b.add(` ${link}`);
      } else {
        // Book or web page: the title is italic. With no author, the title moves to the front.
        if (who) b.add(`${who} ${date}. `);
        if (s.type === 'book' && ed) b.add(title, true).add(` (${ed} ed.).`);
        else b.add(end(title), true);
        if (!who) b.add(` ${date}.`);
        if (s.type === 'book' && s.publisher) b.add(` ${end(s.publisher)}`);
        if (s.type === 'website' && s.container && s.container !== apaAuthors(authors)) b.add(` ${end(s.container)}`);
        if (link) b.add(` ${link}`);
      }
      const words = title.split(/\s+/);
      const short = words.slice(0, 4).join(' ') + (words.length > 4 ? '…' : '');
      const names = authors.length
        ? `${inTextNames(authors, style, s.title)},`
        : s.type === 'journal'
          ? `“${short},”`
          : `${short},`;
      return { reference: b.segments, inText: `(${names} ${year || 'n.d.'})` };
    }

    case 'mla': {
      if (authors.length) b.add(`${end(mlaAuthors(authors))} `);
      if (s.type === 'book') {
        b.add(end(title), true);
        const rest = [ed ? `${ed} ed.` : '', s.publisher, year].filter(Boolean);
        if (rest.length) b.add(` ${end(rest.join(', '))}`);
        if (doi) b.add(` ${doi}.`);
      } else {
        b.add(`“${end(title)}” `);
        if (s.container) b.add(s.container, true);
        const date =
          s.type === 'website'
            ? [day, mi !== null ? MLA_MONTHS[mi] : '', year].filter(Boolean).join(' ')
            : year;
        const parts = [
          s.type === 'journal' && vol ? `vol. ${vol}` : '',
          s.type === 'journal' && iss ? `no. ${iss}` : '',
          date,
          s.type === 'journal' && pages ? `${pages.includes('–') ? 'pp.' : 'p.'} ${pages}` : '',
          link ? link.replace(/^https?:\/\//, s.type === 'journal' ? 'https://' : '') : '',
        ].filter(Boolean);
        if (parts.length) b.add(`${s.container ? ', ' : ''}${parts.join(', ')}.`);
        else if (s.container) b.add('.');
        if (s.type === 'website' && acc) b.add(` Accessed ${acc.d} ${MLA_MONTHS[acc.m]} ${acc.y}.`);
      }
      const names = authors.length ? authors[0].last + (authors.length === 2 ? ` and ${authors[1].last}` : authors.length > 2 ? ' et al.' : '') : inTextNames(authors, style, s.title);
      return { reference: b.segments, inText: `(${names}${s.type !== 'website' && pages ? ` ${pages.split('–')[0]}` : ''})` };
    }

    case 'chicago':
    case 'chicago-ad': {
      const ad = style === 'chicago-ad';
      // With no author, Chicago puts the title first.
      const titleFirst = ad && authors.length === 0;
      if (authors.length) b.add(`${end(chicagoAuthors(authors))} `);
      if (titleFirst) {
        if (s.type === 'book') b.add(end(title), true).add(' ');
        else b.add(`“${end(title)}” `);
      }
      if (ad) b.add(`${end(year || 'n.d.')} `);
      if (s.type === 'book') {
        if (!titleFirst) b.add(end(title), true);
        if (ed) b.add(` ${ed} ed.`);
        const pub = [s.publisher, ad ? '' : year].filter(Boolean).join(', ');
        if (pub) b.add(` ${end(pub)}`);
        if (link) b.add(` ${end(link)}`);
      } else if (s.type === 'journal') {
        if (!titleFirst) b.add(`“${end(title)}” `);
        if (s.container) b.add(s.container, true);
        if (vol) b.add(` ${vol}`);
        if (iss) b.add(`, no. ${iss}`);
        if (!ad && year) b.add(` (${year})`);
        if (pages) b.add(`: ${pages}`);
        b.add('.');
        if (link) b.add(` ${end(link)}`);
      } else {
        if (!titleFirst) b.add(`“${end(title)}” `);
        if (s.container) b.add(`${end(s.container)} `);
        const pubDate = [mi !== null ? MONTHS[mi] : '', day ? `${day},` : '', ad ? '' : year].filter(Boolean).join(' ').replace(/,$/, '');
        if (ad && mi !== null) b.add(`${end([MONTHS[mi], day].filter(Boolean).join(' '))} `);
        else if (!ad && pubDate) b.add(`${end(pubDate)} `);
        else if (acc) b.add(`Accessed ${MONTHS[acc.m]} ${acc.d}, ${acc.y}. `);
        if (link) b.add(end(link));
      }
      const segs = b.segments;
      const last = segs.at(-1);
      if (last) last.text = last.text.trimEnd();
      const names = inTextNames(authors, style, s.title);
      return {
        reference: segs,
        inText: ad
          ? `(${names} ${year || 'n.d.'}${pages && s.type !== 'website' ? `, ${pages.split('–')[0]}` : ''})`
          : `Footnote: ${chicagoNote(authors.length ? names : '', s.type, title, s.type === 'website' ? '' : pages.split('–')[0])}`,
      };
    }

    case 'harvard': {
      const who = authors.length ? harvardAuthors(authors) : '';
      const y = `(${year || 'no date'})`;
      if (s.type === 'journal') {
        b.add(who ? `${who} ${y} ` : '').add(`‘${title}’${who ? '' : ` ${y}`}, `);
        if (s.container) b.add(s.container, true);
        const loc = [vol ? `${vol}${iss ? `(${iss})` : ''}` : '', pages ? `pp. ${pages}` : ''].filter(Boolean).join(', ');
        b.add(`${loc ? `, ${loc}` : ''}.`);
        if (link) b.add(` Available at: ${link}.`);
      } else {
        b.add(who ? `${who} ${y} ` : '').add(end(title).replace(/\.$/, ''), true).add(who ? '.' : ` ${y}.`);
        if (s.type === 'book') {
          if (ed) b.add(` ${ed} edn.`);
          if (s.publisher) b.add(` ${end(s.publisher)}`);
          if (link) b.add(` Available at: ${link}.`);
        } else if (link) {
          b.add(` Available at: ${link}`);
          b.add(acc ? ` (Accessed: ${acc.d} ${MONTHS[acc.m]} ${acc.y}).` : '.');
        }
      }
      const names = inTextNames(authors, style, s.title);
      return { reference: b.segments, inText: `(${names}, ${year || 'no date'})` };
    }

    case 'ieee': {
      b.add('[1] ');
      if (authors.length) b.add(`${ieeeAuthors(authors)}, `);
      if (s.type === 'book') {
        b.add(title, true);
        const rest = [ed ? `${ed} ed.` : '', s.publisher, year].filter(Boolean);
        b.add(rest.length ? `, ${end(rest.join(', '))}` : '.');
        if (doi) b.add(` doi: ${bareDoi(s.doi)}.`);
      } else if (s.type === 'journal') {
        b.add(`“${title},” `);
        if (s.container) b.add(s.container, true);
        const parts = [
          vol ? `vol. ${vol}` : '',
          iss ? `no. ${iss}` : '',
          pages ? `${pages.includes('–') ? 'pp.' : 'p.'} ${pages}` : '',
          [mi !== null ? IEEE_MONTHS[mi] : '', year].filter(Boolean).join(' '),
        ].filter(Boolean);
        b.add(`${s.container && parts.length ? ', ' : ''}${parts.join(', ')}`);
        b.add(doi ? `, doi: ${bareDoi(s.doi)}.` : '.');
      } else {
        b.add(`“${title},” `);
        if (s.container) b.add(`${end(s.container)} `);
        if (acc) b.add(`Accessed: ${IEEE_MONTHS[acc.m]} ${acc.d}, ${acc.y}. `);
        if (link) b.add(`[Online]. Available: ${link}`);
      }
      const segs = b.segments;
      const last = segs.at(-1);
      if (last) last.text = last.text.trimEnd();
      return { reference: segs, inText: '[1]' };
    }
  }
}

export function plainText(segments: Segment[]): string {
  return segments.map((s) => s.text).join('');
}

const escape = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** HTML with <i> for italics, so pasting into Word or Canvas keeps the formatting. */
export function html(segments: Segment[]): string {
  return segments.map((s) => (s.italic ? `<i>${escape(s.text)}</i>` : escape(s.text))).join('');
}

/** What the student still needs before the citation is worth copying. */
export function missingFields(s: Source): string[] {
  const out: string[] = [];
  if (!clean(s.title)) out.push(s.type === 'website' ? 'the page title' : s.type === 'book' ? 'the book title' : 'the article title');
  if (s.type === 'journal' && !clean(s.container)) out.push('the journal name');
  if (s.type === 'website' && !clean(s.url)) out.push('the URL');
  return out;
}
