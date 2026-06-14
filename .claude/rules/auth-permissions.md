# Auth & Permissions (Jalat)

Frontend analog of the backend `spring-security.md`. **The single most important rule in this
repo:** authorization logic lives in ONE place.

## The three roles
- **Admin** — moderates; confirms agency registration; edits any activity; handles agency edit
  requests; acts on reports.
- **Tour Agency** — upgraded Traveler; creates activities + tour packages; approves/confirms
  bookings; files edit requests (generally cannot edit published activities directly).
- **Traveler** — browses, books, bookmarks, comments, rates after completed trips, reports agencies,
  creates trip plans.
- **Guest** — unauthenticated Traveler; **read-only** on public content.

## Central permissions module (`src/lib/permissions.ts`)
- Single surface: **`can(actor, action)`** where `actor` is `Role | "guest" | null` (`null` is
  treated as a guest — read-only `browse`). Plus **`assertCan(actor, action)`** which throws a typed
  `PermissionError` (the data/store layer maps it to a denied result).
- The action set is the table-driven `MATRIX` (admin / agency / traveler / guest). Add new actions
  there, never inline.
- **Every** guard — route guards, store mutations, UI conditionals, future API handlers — calls into
  this module. **Never** re-derive role logic inline (`if (role === 'admin')`). The Zustand stores
  (`features/agency/store.ts`, `features/admin/store.ts`) call `can(...)` before every transition.
- Routing helpers also live here: **`homePathFor(role)`** (post-login: admins → `/admin`,
  travelers/agencies → the landing `/`) and **`dashboardPathFor(role)`** (the header link to each
  role's own area: `/admin` · `/agency` · `/traveler`).
- Permission rules are data/table-driven so they're testable — see `src/lib/permissions.test.ts`.

## Session & role source of truth
- The current role comes from the verified session (Auth.js JWT/session callbacks), never from
  client-controllable state. During static UI it comes from a mock session provider exposing the
  same `{ user, role }` shape.
- **Agency onboarding** changes the role: Traveler request → Admin confirmation → role flips to
  agency. The session must reflect the upgrade (plan token re-issue/refresh).

## Defense in depth
- A UI gate (hiding a button) is **never the only** gate. The mutation path (server action / API)
  re-checks permission. Client-side checks are UX; server-side checks are security.
- Guests get read-only; every write path asserts an authenticated, authorized role.
