/** The four AI levels an instructor can give an assignment (issue #8). Safe to use in the browser. */
export const AI_LEVELS = ['allowed', 'allowed_with_disclosure', 'partial', 'prohibited'] as const;
export type AiLevel = (typeof AI_LEVELS)[number];

export const AI_LEVEL_LABELS: Record<AiLevel, string> = {
  allowed: 'Allowed',
  allowed_with_disclosure: 'Allowed with disclosure',
  partial: 'Partial',
  prohibited: 'Prohibited',
};
