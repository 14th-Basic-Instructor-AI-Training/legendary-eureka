---
name: plan
description: >-
  Produce an implementation plan for a Jalat task before coding — scope, affected features/roles, the
  domain flows touched, the files to change, and a step order. Use for any non-trivial change spanning
  multiple files or roles.
---

# Plan (Jalat)

Think before building. Output a concrete, ordered plan; don't write code in this step.

## Produce
1. **Goal & scope** — what's being built, what's explicitly out of scope (respect the static-UI-first
   phase: mock data, no real auth/WebSocket/Knock yet).
2. **Roles & flows** — which of Admin/Agency/Traveler/Guest are involved and which cross-cutting flow
   (agency onboarding, booking lifecycle, activity edit-requests, trip plans) is touched. These are
   where permissions/state/notifications intersect — call out the intersections.
3. **Files & structure** — the feature folder(s) and specific files to add/change, per
   `.claude/rules/feature-structure.md`.
4. **Data model** — the Zod schemas to define/extend (source of truth) and the `data.ts` seam.
5. **Permissions** — exactly which `can(actor, action)` rules apply (actor is `Role | "guest" | null`)
   and where they're enforced (UI gate + store/`data.ts` mutation, both via `lib/permissions.ts`).
6. **i18n** — namespaces/keys to add (KH/KR/ENG).
7. **Step order** — schema → data module → store → wrapped components → routes → i18n → tests.
8. **Risks/unknowns** — anything needing a decision from the user.

## Conventions
Keep the plan aligned with `CLAUDE.md` and `.claude/rules/*`. Prefer the smallest change that satisfies
the goal. Surface trade-offs with a recommendation, not an exhaustive survey.
