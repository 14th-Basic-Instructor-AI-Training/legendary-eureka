---
name: component-design
description: >-
  Design Jalat's component + data model for a feature before building — Zod schemas as the source of
  truth, the HeroUI wrapper components needed, Zustand store shape, and the data-module seam. Use when
  starting a new feature or screen. (Frontend analog of the backend database-design / jpa-patterns.)
---

# Component & Data Design (Jalat)

Design before building. The output is a short plan: data shapes, components, store, and the data seam
— then `nextjs-feature` (or the `nextjs-developer` agent) implements it.

## Steps
1. **Identify the feature & roles** — which of Admin/Agency/Traveler/Guest see or act on this, and
   which domain flow it touches (onboarding, booking, edit-request, trip-plan).
2. **Model data first (Zod)** — define the entities/forms as Zod schemas (`schema.ts`); these are the
   single source of truth. Derive types via `z.infer`. Model lifecycle status as Zod enums.
3. **Component tree** — list components and their loading/empty/error states. Decide server vs client
   boundary (server by default). Identify which HeroUI primitives need a wrapper in `src/ui/`.
4. **State** — what belongs in a Zustand store vs local state; design narrow selectors.
5. **Data seam** — define the `data.ts` async API signatures (mock today, route handler/server action
   later). Note where permissions are enforced and where realtime updates will arrive.
6. **i18n** — list the string namespaces/keys the feature needs (to be added in KH/KR/ENG).

## Output
A concise design doc: schemas, component list, store shape, data-module signatures, permission
points, i18n namespaces. Keep it aligned with `.claude/rules/feature-structure.md`.
