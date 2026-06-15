# Jalat Frontend — Global Reference

Always-loaded guide for the `destination/` Next.js 16 app. Project-domain context (roles, capabilities, permissions matrix) lives in the root `../CLAUDE.md`.

## Project status

**Scaffolded and building (Next.js 16 + App Router + TS + Tailwind v4 + HeroUI v3).** Run `npm run dev`.

**Current phase: static UI first.** No backend, database, or real auth yet — everything runs on **mock fixtures behind each feature's `data.ts`** and in-memory/localStorage Zustand stores. Auth.js session wiring, WebSocket, Knock, Sileo toasts, and DayFlow calendar are still deferred; the MapLibre 3D map, Recharts dashboards, and React Flow diagrams are now wired. Structure stays ready for real data to drop in.

### What's built

- **Landing page** — trip.com-style home for all roles. `features/landing` + `features/destinations`.
- **Auth pages** — `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`. `features/auth`.
- **Agency workspace** (`/agency`) — booking requests, activities (create + request-edit), packages. `features/agency`.
- **Admin control panel** (`/admin`) — multi-route sidebar area: overview, requests, reports, content, bookings, users, settings. `features/admin`.
- **Dashboards** — per-role overview cards. `features/dashboard`. Agency also has `/agency/dashboard`.
- **Localized routing** — every route under `/[locale]/…` (en · kh · kr). See `src/app/CLAUDE.md`.
- **i18n** — KH/KR/ENG complete; central locale files at `src/locales/{en,kh,kr}.json`.
- **Tests** — Vitest + RTL: permissions matrix, Zod schemas, store transitions.

## Tech stack

Confirmed — do not swap without asking:

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Auth.js (NextAuth) — 3-role JWT (mock now via `lib/auth.ts`) |
| UI components | **HeroUI v3** wrapped in `src/ui/`; shadcn sidebar only |
| Client state | Zustand |
| Forms & validation | React Hook Form + Zod |
| Realtime | WebSocket (deferred) |
| Notifications | Knock (deferred) |
| Animation | Framer Motion |
| Icons | Iconsax (`iconsax-reactjs`) |
| Page load bar | nextjs-toploader |
| i18n | i18next — KH / KR / ENG |
| Toasts | **Sileo** (deferred — check `package.json` before use) |
| Calendar | **DayFlow** `@dayflow/core` (deferred) |
| 3D Map | **MapLibre GL JS** (`maplibre-gl`) |
| Charts | **Recharts** (`recharts`) |
| Flow diagrams | **React Flow** (`@xyflow/react`) |

**Installed and wired:** HeroUI v3, Zustand, RHF + Zod, Framer Motion, Iconsax, nextjs-toploader, i18next, MapLibre, Recharts, React Flow, shadcn sidebar.
**Deferred / not yet installed:** Auth.js, WebSocket, Knock, Sileo, DayFlow. Always check `package.json` before assuming a deferred lib is present.

## Demo accounts (mock auth)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@jalat.test` | `Admin@123` |
| Agency | `agency@jalat.test` | `Agency@123` |
| Traveler | `traveler@jalat.test` | `Traveler@123` |

OTP demo code: **`123456`**

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint
npm test           # run Vitest suite once
npm run test:watch # Vitest in watch mode
```

Single file: `npx vitest run src/lib/permissions.test.ts`
Filter by name: `npx vitest run -t "approve"`
Setup: `vitest.config.ts` + `src/test/setup.ts`. Per-file `typecheck` + `eslint` hooks run on every edit.

## Confirmation dialogs

In-app confirmations (approve/reject/delete) use `@/ui` `ConfirmDialog` + `useConfirm` hook — never `window.confirm`. Use `useConfirm()` for any destructive/irreversible action; keep confirmation copy in i18next.

## Where to find specific conventions

| Topic | File |
|---|---|
| Routing, locale prefix, route groups | `src/app/CLAUDE.md` |
| Feature folder layout, data.ts seam | `src/features/CLAUDE.md` |
| Auth flows, mock session | `src/features/auth/CLAUDE.md` |
| Admin panel, React Flow, Recharts | `src/features/admin/CLAUDE.md` |
| Agency Zustand store, booking flow | `src/features/agency/CLAUDE.md` |
| Dashboard cards, chart patterns | `src/features/dashboard/CLAUDE.md` |
| Destinations, MapLibre map | `src/features/destinations/CLAUDE.md` |
| Booking request lifecycle | `src/features/booking/CLAUDE.md` |
| HeroUI wrapper rules, component structure | `src/components/CLAUDE.md` |
| @/ui wrapper inventory | `src/ui/CLAUDE.md` |
| permissions.ts, useResource, auth.ts | `src/lib/CLAUDE.md` |
| Styling (Tailwind + HeroUI tokens) | `.claude/rules/styling-conventions.md` |
| i18n keys and workflow | `.claude/rules/i18n-conventions.md` |
| Error handling patterns | `.claude/rules/error-handling.md` |
| Feature structure rules | `.claude/rules/feature-structure.md` |
| Component conventions | `.claude/rules/component-conventions.md` |
| Auth & permission rules | `.claude/rules/auth-permissions.md` |
