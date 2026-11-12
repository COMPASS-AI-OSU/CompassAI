/**
 * The optional first name people can give us (Create account, or "Change name" in the header).
 * It's only used for greetings. Stored in the account's user_metadata.first_name, which users
 * can edit, so it's checked both when it's saved and when it's read.
 */
export const FIRST_NAME_MAX = 40;

// Letters (any language), spaces, apostrophes, hyphens and periods, like "Mary-Jo" or "D'Andre".
const ALLOWED = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

/** A tidy first name, or null when it's empty or not a name. */
export function cleanFirstName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  if (!name || name.length > FIRST_NAME_MAX || !ALLOWED.test(name)) return null;
  return name;
}

/** An error message for the form, or undefined when the name is fine (an empty name is fine). */
export function checkFirstName(value: string): string | undefined {
  const name = value.replace(/\s+/g, ' ').trim();
  if (!name) return undefined;
  if (name.length > FIRST_NAME_MAX) return `Use at most ${FIRST_NAME_MAX} characters.`;
  if (!ALLOWED.test(name)) return 'Use letters, spaces, apostrophes or hyphens.';
  return undefined;
}
