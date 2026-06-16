# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint
npm test             # Vitest suite (one-shot)
npm run test:watch   # Vitest in watch mode
```

Single test file: `npx vitest run src/lib/permissions.test.ts`
Filter by name: `npx vitest run -t "approve"`

**Project domain** (roles, capabilities, permissions matrix) → `../CLAUDE.md`
**Always-on globals** (tech stack, demo accounts, project status) → `.claude/CLAUDE.md`

---

## Architecture overview

### Layer map

```
src/
  app/[locale]/          # thin route files — layout + role guard + feature composition
  features/<name>/       # everything one feature needs (schema, data, store, components, i18n)
  actions/               # Next.js Server Actions (auth, booking, admin, agency, traveler profile)
  services/              # API service modules — one file per domain, wraps lib/api/
  lib/
    api/                 # HTTP client: apiFetch / clientApiFetch / publicApiFetch
    permissions.ts       # ONLY place role logic lives — can() / assertCan()
    auth.ts              # mock session shape (same { user, role } as future Auth.js)
    useResource.ts       # loading/error/empty/success hook for data.ts getters
  ui/                    # HeroUI extended-variant wrappers — imported by all feature code
  types/                 # wire types (backend JSON shapes); Zod types stay in feature schema.ts
  locales/               # central i18n files: en.json / kh.json / kr.json
  components/
    layout/              # shared header, footer, app shell
    sidebar/             # shadcn sidebar (only place shadcn is used)
```

### Two-type system

There are **two distinct type layers** — don't conflate them:

| Layer | Location | Purpose |
|---|---|---|
| Wire types | `src/types/*.ts` | Backend JSON shapes; no validation |
| Domain types | `features/<name>/schema.ts` via `z.infer` | Validated, source of truth for UI |

### API client variants (`src/lib/api/client.ts`)

Three fetch helpers — pick the right one:

| Helper | Context | Auth |
|---|---|---|
| `apiFetch` | Server Components / Server Actions | NextAuth session token (server-side) |
| `clientApiFetch` | Client Components / Zustand actions | NextAuth session cookie (browser) |
| `publicApiFetch` | Client Components | None — public endpoints only |

Backend runs at `NEXT_API_URL` / `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api/v1`).

### Data flow

```
features/<name>/fixtures.ts
        ↓ (feeds)
features/<name>/data.ts          ← components import from here only, never fixtures directly
        ↓ (consumed via)
lib/useResource(getter)           ← renders loading / error / empty / success
        or
features/<name>/store.ts (Zustand) ← mutable / transition state; calls can() before mutating
```

**Swapping fixtures for real API**: change `data.ts` to call `services/<domain>.service.ts`
(which wraps `lib/api/<domain>.ts`) — feature components don't change.

### Permissions — single source of truth

`src/lib/permissions.ts` is the only place role logic lives. Every guard — route layouts, store
mutations, UI conditionals, future server actions — calls `can(actor, action)`. Never write
`if (role === 'admin')` outside this file.

### Routing

Every route lives under `/[locale]/` (en · kh · kr). `middleware.ts` redirects bare paths.
Never use raw `next/link` or `useRouter` — use `LocaleLink` / `useLocalizedRouter` from
`@/lib/locale` to preserve the locale prefix.

---

## Auto-loaded per area

| When working in… | File | Covers |
|---|---|---|
| `src/app/` | `src/app/CLAUDE.md` | Route groups, locale prefix, error boundaries |
| `src/app/[locale]/(admin)/admin/` | `src/app/[locale]/(admin)/admin/CLAUDE.md` | Admin routes, service calls, loading/error, redirect stubs |
| `src/features/` | `src/features/CLAUDE.md` | Feature folder layout, data loading pattern |
| `src/features/auth/` | `src/features/auth/CLAUDE.md` | Auth flows, mock session, OTP |
| `src/features/admin/` | `src/features/admin/CLAUDE.md` | Admin panel, React Flow, Recharts |
| `src/features/agency/` | `src/features/agency/CLAUDE.md` | Zustand store, booking flow |
| `src/features/dashboard/` | `src/features/dashboard/CLAUDE.md` | Per-role cards, chart patterns |
| `src/features/destinations/` | `src/features/destinations/CLAUDE.md` | MapLibre map, landing backbone |
| `src/features/booking/` | `src/features/booking/CLAUDE.md` | Booking request lifecycle |
| `src/components/` | `src/components/CLAUDE.md` | Server vs client, naming, HeroUI rules |
| `src/ui/` | `src/ui/CLAUDE.md` | @/ui wrapper inventory |
| `src/lib/` | `src/lib/CLAUDE.md` | permissions.ts, useResource, auth.ts, format.ts |

## Convention rules (always loaded via `.claude/rules/`)

| Rule file | Covers |
|---|---|
| `auth-permissions.md` | `can()`/`assertCan()`, MATRIX, session source of truth |
| `component-conventions.md` | Server vs client, props, naming, data-driven states |
| `error-handling.md` | Typed results, error boundaries, Sileo toasts |
| `feature-structure.md` | Folder layout, data loading, schema-first |
| `i18n-conventions.md` | Key naming, 3-locale workflow, formatting |
| `styling-conventions.md` | Tailwind v4, HeroUI tokens, shadcn sidebar-only |
