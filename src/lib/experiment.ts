/**
 * Landing-page headline experiment (issue #57). Each logged-out visitor to the home page gets
 * version A (our current headline) or B (the COAM headline) at random, and keeps it in a cookie
 * so they see the same one every time. The events table saves the version on their visit and
 * sign-up rows (`events.variant`).
 */
export type HeadlineVariant = 'a' | 'b';

export const HEADLINE_COOKIE = 'compass_hv';

export const HEADLINE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function cleanVariant(value: unknown): HeadlineVariant | null {
  return value === 'a' || value === 'b' ? value : null;
}

/** 50/50 split. */
export function pickVariant(): HeadlineVariant {
  return crypto.getRandomValues(new Uint8Array(1))[0] < 128 ? 'a' : 'b';
}
