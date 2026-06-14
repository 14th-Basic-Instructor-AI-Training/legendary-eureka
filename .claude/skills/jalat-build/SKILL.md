---
name: jalat-build
description: >-
  Build guidance for the Jalat travel/trip platform — the confirmed tech stack,
  the three-role domain model (Admin / Tour Agency / Traveler-Guest), cross-cutting
  domain flows, and the project conventions to follow. Use whenever scaffolding,
  adding screens/features, wiring forms, permissions, i18n, or data for Jalat.
---

# Jalat — Build Skill

This skill is the implementation companion to `CLAUDE.md`. `CLAUDE.md` is the source
of truth for stack/domain decisions; this file turns those decisions into actionable
build rules. When they ever disagree, `CLAUDE.md` wins — update both.

## Current phase: static UI first

- No backend, DB, or real auth yet. Build screens for all three roles with **mock data**.
- Keep mock/fixture data behind **one module per feature** (`data.ts`, backed by `fixtures.ts`) —
  never inline mock data in components, so real data drops in later.
- Defer Auth.js session wiring, WebSocket, Knock, Sileo, MapLibre, and DayFlow until their phases,
  but structure components so real data can replace mocks without refactoring.

## What's already built (don't rebuild — extend)

- **`/` landing page** (`features/landing` + `features/destinations`) — trip.com-style, home for
  everyone; scroll motion via `@/ui` `Reveal`; signed-in users get a personalized row.
- **Auth** (`features/auth`) — `/login`, `/register`, `/verify-otp`, `/forgot-password`,
  `/reset-password`. Demo logins on the login screen; OTP demo code `123456`.
- **`/agency` workspace** (`features/agency`) — booking approve/reject, activity create + edit-request,
  packages. Transitions live in a permission-checked Zustand store.
- **`/admin` control panel** (`features/admin`) — agency-request and report queues, activities, users.
- **Shared**: `lib/permissions.ts` (`can`/`assertCan`/`homePathFor`/`dashboardPathFor`),
  `lib/useResource.ts` (loading/error/empty), `lib/format.ts` (locale formatting), `@/ui` wrappers.

## Scaffolding

- Already scaffolded (Next.js 16, App Router, TS, Tailwind v4, HeroUI v3).
- Scripts: `npm run dev | build | start | lint | test`. Tests = **Vitest + RTL**
  (`npm test`; single file `npx vitest run <path>`). Per-file typecheck + eslint hooks run on edit.

## Companion agent skills to install

Install these so component/codegen stays accurate (do this before heavy UI work):

```bash
npx skills add heroui-inc/heroui                                   # HeroUI v3 (primary UI lib)
npx skills add shadcn/ui --skill shadcn --agent claude-code        # shadcn (sidebar only)
```

Defer until those phases: **Knock** MCP (`mcp.knock.app/mcp`) for notifications, and
**`next-devtools-mcp`** for debugging a running app.

## Tech stack (do not swap without asking)

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS (v4)
- **Auth**: Auth.js (NextAuth) — session/JWT must carry the 3-role distinction
- **UI**: HeroUI v3 (primary, wrapped) · shadcn/ui (**sidebar only**)
- **State**: Zustand · **Forms**: React Hook Form + Zod (Zod = single source of truth)
- **Realtime**: WebSocket · **Notifications**: Knock · **Animation**: Framer Motion
- **Icons**: Iconsax · **Top loader**: nextjs-toploader · **Toasts**: Sileo
- **Calendar**: DayFlow (`@dayflow/core`) · **3D Map**: MapLibre GL JS (no API key)
- **i18n**: i18next — locales **Khmer (KH) / Korean (KR) / English (ENG)**

## The three roles

- **Admin** — moderates; confirms Tour Agency registration; edits any activity; handles
  agency edit requests; acts on traveler reports.
- **Tour Agency** — a Traveler upgraded via request → admin confirmation. Creates activities
  (destinations, things-to-do, restaurants/food, accommodation), builds tour packages with an
  agenda, approves/confirms bookings, files edit requests to Admin.
- **Traveler / Guest** — browses newsfeed/search; books/requests tours; bookmarks; comments &
  feedback on public posts; rates & comments on activities after a completed trip; reports
  agencies; creates public or private trip plans. **Guests = unauthenticated, read-only.**

## Cross-cutting domain flows (read before touching any single feature)

1. **Agency onboarding**: Traveler requests upgrade → Admin confirms/rejects → role &
   capabilities change. Session role must reflect the upgrade.
2. **Trip booking lifecycle**: Traveler requests/books → Agency approves/confirms → trip runs →
   on completion Traveler rates & comments **each activity and service**. Ratings feed the
   "Most rating" newsfeed and agency profiles.
3. **Activity authoring & edit requests**: Admin + Agency both create activities. Agencies
   generally cannot edit post-publish — they file an **edit request** to Admin. Keep
   "who can mutate what" centralized.
4. **Trip plans**: Traveler-authored itineraries (destinations + things-to-do + where-to-eat),
   public (shareable) or private.

## Conventions & guardrails

- **Role checks live in ONE place** — route guards / server actions / API handlers, not
  re-derived inside components. Build a single permissions module early; the 3 roles touch
  nearly every feature and duplicated checks drift fast.
- **Validate with shared Zod schemas** via React Hook Form. Zod defines form/data shapes now;
  reuse the same schemas for server-side validation once a backend exists.
- **Wrap HeroUI** — build an extended/local variant layer for shared styling/behavior instead
  of using HeroUI raw across the app. shadcn stays scoped to the sidebar; pull in no other
  shadcn components.
- **All copy is translatable** — every user-facing string goes through i18next. When adding a
  string, add the key to **all three** locales (KH/KR/ENG). No hardcoded copy.
- **Separate transport from state** — booking approvals / agency confirmations flow over
  WebSocket; in-app/push notifications go through Knock. Keep transport concerns out of the
  booking state machine.

## Quick checklist when adding a feature

- [ ] `schema.ts` (Zod) first, then `fixtures.ts` → `data.ts` getters; stores seed from `data.ts`
- [ ] Permission gating via `can`/`assertCan` — and store mutations re-check before transitioning
- [ ] Forms backed by a Zod schema + React Hook Form (use `z.input`/`z.output` generics with `z.coerce`)
- [ ] HeroUI used via `@/ui` wrappers (shadcn only if it's the sidebar); `Button` uses `onPress`, not `as`
- [ ] Data-driven components render loading/error/empty/success (`useResource`); status pills via `StatusChip`
- [ ] Every visible string has KH/KR/ENG i18next keys
- [ ] A test for any permission rule or store transition (Vitest)
