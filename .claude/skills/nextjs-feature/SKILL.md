---
name: nextjs-feature
description: >-
  Scaffold a complete Jalat feature folder the conventional way — route(s), Zod schema, data module,
  fixtures, Zustand store, wrapped-HeroUI components with loading/empty/error states, i18n keys, and
  a test stub. Use when adding a new feature. (Frontend analog of the backend springboot-module.)
---

# New Feature Scaffold (Jalat)

Generate a feature that follows `.claude/rules/feature-structure.md` end to end, ready to fill in.

## What to create under `src/features/<feature>/`
- `schema.ts` — Zod schemas for the feature's entities/forms (source of truth) + `z.infer` types.
- `fixtures.ts` — mock data, parsed through the schema so it stays conformant.
- `data.ts` — the single typed async API (returns fixtures now; route handler/server action later).
- `store.ts` — Zustand store for cross-component / transition-bearing state (if needed). Store
  mutations re-check permission with `can(role, action)` before changing state. Seed it from
  `data.ts` `initialX()` helpers.
- `components/` — wrapped-HeroUI components, each with loading/empty/error states (use
  `useResource` from `@/lib/useResource`) and role-conditional UI via `lib/permissions.ts`.
- **i18n keys go in the central `src/locales/{en,kh,kr}.json`**, namespaced by feature
  (`<feature>.*`) — this project uses central locale files, not per-feature `i18n/` folders. Add
  every string to all three locales.
- `types.ts` as needed (re-export `z.infer` types).

## Routes under `src/app/`
- Add thin route file(s) in the correct role route group (`(admin)`/`(agency)`/`(traveler)`), wiring
  the layout + role guard + composing feature components. Keep logic out of the route file.

## Checklist before done
- [ ] Schema defined first; types derived via `z.infer` (`z.input`/`z.output` generics if `z.coerce`)
- [ ] Components read from `data.ts`, never `fixtures.ts` directly; loading/error/empty via `useResource`
- [ ] HeroUI used via `@/ui/*` wrapper (shadcn only if sidebar); `Button` navigates with `onPress`, not `as`
- [ ] Permissions via the central module; UI + store mutation both gated; `StatusChip` for status pills
- [ ] Every string keyed in KH/KR/ENG (central `src/locales/*`)
- [ ] `npm run lint` + `npx tsc --noEmit` clean; `npm test` passes (test permission rules / store transitions)
