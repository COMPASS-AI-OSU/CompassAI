@AGENTS.md

# CompassAI team rules

- **Never change files in `prototype/`.** It is the original Google AI Studio prototype, kept only for reference.
- **Never put a key or secret in any file except `.env.local`.** `.env.local` is git-ignored and must never be committed.
- **Work on a branch, never on `main`.**
- **Keep each branch to one issue.**
- **Before every commit, run the production build (`npm run build`) and fix every error.**
