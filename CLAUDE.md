# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**The app is scaffolded and building (Next.js 16 + App Router + TS + Tailwind v4 + HeroUI v3).** Run `npm run dev`. Demo accounts (mock auth): `admin@jalat.test / Admin@123`, `agency@jalat.test / Agency@123`, `traveler@jalat.test / Traveler@123` (also shown on the login screen). OTP demo code is `123456`.

**Current phase: static UI first.** No backend, database, or real auth yet — everything runs on **mock fixtures behind each feature's `data.ts`** and in-memory/localStorage Zustand stores. Auth.js session wiring, WebSocket, Knock, Sileo toasts, MapLibre 3D map, and DayFlow calendar are still deferred; structure stays ready for real data to drop in.

### What's built so far

- **Landing page (`/`)** — modern, trip.com-style, **home for everyone** (guests + signed-in travelers/agencies). Scroll-triggered Framer Motion reveals (`@/ui` `Reveal`). Signed-in users get a personalized "Recommended for you" row. `features/landing` + `features/destinations` (the shared "best places" data backbone).
- **Auth pages** — `/login`, `/register` (traveler or become-agency request), `/verify-otp`, `/forgot-password`, `/reset-password`. RHF + Zod, mock `data.ts`. `features/auth`.
- **Agency workspace (`/agency`)** — Tabs: booking requests (approve/reject, live status), activities (create draft + request-edit), packages. `features/agency` with a Zustand store doing permission-checked transitions.
- **Admin control panel (`/admin`)** — Tabs: agency-onboarding requests (approve/reject), traveler reports (resolve/dismiss), all platform activities, users. `features/admin`.
- **Localized routing** — every route is under **`/[locale]/…`** (`en` · `kh` · `kr`). `src/middleware.ts` redirects unprefixed paths to a locale (preferring the `NEXT_LOCALE` cookie, else `en`). The `[locale]` layout drives i18next's language from the URL. **Always navigate with `LocaleLink` / `useLocalizedRouter` (`@/lib/locale`)** so links keep the locale prefix — never raw `next/link` or `useRouter` for in-app nav. Locale **constants** live in `lib/locales.ts` (pure, server-safe); `lib/i18n.ts` has the i18next init side effect and must NOT be imported from Server Components.
- **Routing model** — `/[locale]` is home for all; login sends **admins → `/[locale]/admin`**, travelers/agencies → `/[locale]`. Each role reaches its own area via the header (`dashboardPathFor`). See `lib/permissions.ts` (`homePathFor`, `dashboardPathFor`, `can`/`assertCan` with guest support).
- **i18n** — KH/KR/ENG complete; a **language dropdown** (`@/components/LanguageSwitcher`) is on every page (marketing header, auth layout, app shell) and switches locale by navigating to the same path under the new prefix.
- **Tests** — Vitest + RTL (`npm test`): permissions matrix, Zod schemas, and the agency/admin store transitions (incl. permission gating).

When extending, follow `.claude/rules/*` and reuse the `@/ui` wrapper layer + `lib/useResource` loading pattern.

## What Jalat is

Jalat is a travel/trip platform built around **three roles**:

- **Admin** — moderates the platform, confirms Tour Agency registration requests, edits any activity, handles agency-requested edits, and acts on traveler reports.
- **Tour Agency** — created by upgrading a Traveler account (request → admin confirmation). Creates activities (destinations, things-to-do, restaurants/local food, accommodation), builds **tour packages** with an agenda, approves/confirms traveler bookings, and can request admin edits to activities.
- **Traveler / Guest** — browses the newsfeed and search; books/requests tours; bookmarks posts; comments/feedback on public posts; rates & comments on activities after a completed trip; reports agencies; creates public or private **trip plans**.

Guests are unauthenticated travelers with read-only access to public content.

### Core domain flows that span multiple features

These are the flows where role permissions, state, and notifications intersect — read them before touching any single piece:

1. **Agency onboarding**: Traveler submits a "become a Tour Agency" request → Admin confirms/rejects → role and capabilities change. Auth/session role must reflect the upgrade.
2. **Trip booking lifecycle**: Traveler requests/books a tour → Tour Agency approves/confirms → trip runs → on completion the Traveler can rate & comment on **each activity and service**. Ratings feed the "Most rating" newsfeed and agency profiles.
3. **Activity authoring & edit requests**: Admin and Tour Agency both create activities. Agencies cannot edit activities directly post-publish in all cases — they file an **edit request** to Admin. Keep the "who can mutate what" rules centralized, not scattered across components.
4. **Trip plans**: Traveler-authored itineraries (destinations + things-to-do + where-to-eat) that are public (shareable) or private.

## Role-based access

> The authoritative capability spec per role. Enforce all of this through the central
> `src/lib/permissions.ts` module (`can(actor, action)`) — never inline role checks. The
> Permissions Matrix at the end is the quick-reference source of truth.

### Role: Admin

Full system control. Admins manage users, moderate content, investigate reports, and configure the platform.

#### User Management
- View all users (agencies, travelers)
- Approve / Reject agency registrations
- Suspend / Ban users
- View user activity logs

#### Content Management
- Edit / Delete any activity
- Approve agency edit requests
- Remove inappropriate content
- Manage tour packages

#### Reports & Monitoring
- View reported agencies
- Investigate complaints
- View platform analytics
- Monitor bookings & revenue

#### System Settings
- Configure platform settings
- Manage categories / types
- Set commission rates
- View system health

### Role: Tour Agency

Creates and manages travel content and handles incoming booking requests from travelers.

#### Activity Management
- Create destinations / places
- Create things to do
- Create restaurants / food
- Create accommodations
- Edit own activities
- Request admin to edit (for locked content)
- Set pricing & images

#### Tour Package Creation
- Create tour packages
- Build detailed itineraries
- Set day-by-day agenda
- Include activities in packages
- Publish / Archive packages

#### Booking Management
- View booking requests
- Approve / Reject requests
- View booking details
- Access booking history
- Receive notifications

#### Profile & Communication
- Edit agency profile
- Display contact info
- Show location on map
- View own ratings / reviews
- See traveler feedback

### Role: Traveler

Authenticated users who discover content, plan personal trips, and book tours.

#### Discovery
- Browse newsfeed
- Search by province & activity type
- View trending places
- View top-rated packages
- View agency profiles

#### Trip Planning
- Create personal trip plans
- Share trip plans publicly
- View others' public trips
- Bookmark places / activities

#### Tour Booking
- Request / Register for tours
- Cancel booking requests
- View booking status
- View booking history
- Make online payments

#### Engagement & Safety
- Rate & review activities
- Leave comments / suggestions
- Report agencies
- Receive notifications
- Edit personal profile

### Role: Guest

Unauthenticated visitors. Read-only discovery only — no booking, planning, reviewing, or reporting.

- Browse newsfeed
- Search by province & type
- View trending places
- View top-rated packages
- View agency profiles

### Permissions Matrix

| Feature / Module        | Admin | Agency | Traveler | Guest |
|-------------------------|:-----:|:------:|:--------:|:-----:|
| Newsfeed Access         | ✓     | ✓      | ✓        | ✓     |
| Create Activities       | ✓     | ✓      | ✗        | ✗     |
| Edit Activities         | ✓     | ✓      | ✗        | ✗     |
| Create Tour Packages    | ✓     | ✓      | ✗        | ✗     |
| Book / Request Tours    | ✗     | ✗      | ✓        | ✗     |
| Approve Bookings        | ✓     | ✓      | ✗        | ✗     |
| Create Trip Plans       | ✗     | ✗      | ✓        | ✗     |
| Rate & Review           | ✗     | ✗      | ✓        | ✗     |
| Report Agencies         | ✗     | ✗      | ✓        | ✗     |
| Manage Users            | ✓     | ✗      | ✗        | ✗     |
| Approve Edit Requests   | ✓     | ✗      | ✗        | ✗     |
| View Analytics          | ✓     | ✗      | ✗        | ✗     |
| Make Payments           | ✗     | ✓      | ✓        | ✗     |

## Tech stack

Confirmed choices — do not swap these without asking:

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Auth.js (NextAuth) — must carry the 3-role distinction in the session/JWT
- **UI components**: **HeroUI** is the primary library — wrap it in an *extended/local variant layer* for reusability rather than using HeroUI components raw across the app. **shadcn/ui is used for the sidebar only** — do not pull in other shadcn components.
- **Client state**: Zustand
- **Forms & validation**: React Hook Form + Zod (Zod schemas are the single source of truth — reuse them for server-side validation too)
- **Realtime**: WebSocket (booking status, approvals, live updates)
- **Notifications**: Knock
- **Animation**: Framer Motion
- **Icons**: Iconsax
- **Page load bar**: nextjs-toploader
- **i18n**: i18next with three locales — **Khmer (KH), Korean (KR), English (ENG)**. Every user-facing string goes through i18next; no hardcoded copy.
- **Toasts/notifications**: **Sileo** (`npm install sileo`) — use for transient toast messages.
- **Calendar**: **DayFlow** (`@dayflow/core`, `npm install @dayflow/core` — repo: https://github.com/dayflow-js/calendar) — multi-framework calendar with day/week/month/year views and drag-and-drop; use its React binding for trip dates and tour agendas.
- **3D Map**: use a free, no-API-key option — **MapLibre GL JS** is the recommended choice — so travelers can view destinations in 3D.

## Commands

> These are the standard Next.js commands that apply once the project is scaffolded. Verify against `package.json` `scripts` before relying on them.

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm test           # run the Vitest suite once
npm run test:watch # Vitest in watch mode
```

Tests use **Vitest + React Testing Library** (jsdom). Run a single file with `npx vitest run src/lib/permissions.test.ts`, or filter by name with `npx vitest run -t "approve"`. Setup lives in `vitest.config.ts` + `src/test/setup.ts`. Per-file `typecheck` + `eslint` hooks run on every edit.

## Conventions & guardrails

- **Role checks belong in one place.** Centralize "can this role do X" logic (route guards, server actions, API handlers) rather than re-deriving permissions inside components. The three roles touch nearly every feature, so duplicated checks drift fast.
- **Validate with shared Zod schemas** via React Hook Form. (Server-side validation reuse applies once a backend exists — in the static-UI phase, Zod still defines form/data shapes.)
- **Wrap HeroUI**, don't use it raw — the extended-variant layer is where shared styling/behavior lives. shadcn stays scoped to the sidebar.v- **All copy is translatable** — three locales (KH/KR/ENG) from the start; add keys to all three when adding strings.
- **Realtime state** (booking approvals, agency confirmations) flows over WebSocket; in-app/push notifications go through Knock. Keep the transport concerns separate from the booking state machine.
