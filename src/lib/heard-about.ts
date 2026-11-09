/** Answers to "How did you hear about us?" on the sign-up form. A fixed list: no free text, so no names. */
export const HEARD_ABOUT = [
  { value: 'friend', label: 'A friend or classmate' },
  { value: 'instructor', label: 'An instructor or TA' },
  { value: 'class_or_club', label: 'A class or club announcement' },
  { value: 'social_media', label: 'Social media' },
  { value: 'group_chat', label: 'A group chat' },
  { value: 'search', label: 'Searching online' },
  { value: 'other', label: 'Somewhere else' },
] as const;

export type HeardAbout = (typeof HEARD_ABOUT)[number]['value'];
