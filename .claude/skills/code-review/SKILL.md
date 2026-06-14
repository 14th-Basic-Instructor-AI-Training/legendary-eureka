---
name: code-review
description: >-
  Review the current Jalat frontend diff for correctness and the project guardrails — role/permission
  leaks, raw-HeroUI usage, missing i18n keys, Zod/RHF misuse, missing loading/empty/error states. Use
  before considering a feature done or opening a PR.
---

# Code Review (Jalat)

Review the working diff against `CLAUDE.md` and `.claude/rules/*`. Bias toward correctness and the
guardrails, not style nits (the eslint-format hook handles style).

## Procedure
1. Get the diff (`git diff` / staged changes, or the files just edited).
2. Check each changed file against the priority list below.
3. Report findings grouped **Blocker / Should-fix / Nit**, each with `file:line` + a concrete fix.
4. End with a one-line verdict.

## Priority checklist
- **Permissions** — no role logic re-derived in components; all gating via `lib/permissions.ts`.
  Both UI gate and mutation gate present (defense in depth).
- **Correctness** — booking/onboarding/edit-request state transitions valid; Zustand selectors not
  stale; no obvious races.
- **Mock-data discipline** — components read from `data.ts`, not `fixtures.ts`; shapes map to real
  data later.
- **HeroUI** — imported via `@/ui/*` wrapper, not `@heroui/react`. shadcn only in the sidebar.
- **i18n** — no hardcoded copy; new keys present in KH/KR/ENG.
- **Forms** — backed by a shared Zod schema + React Hook Form.
- **States** — loading/empty/error handled; accessibility basics (labels, semantics, keyboard).

For deeper review use the `code-reviewer` agent. For security specifically use `security-scan`.
