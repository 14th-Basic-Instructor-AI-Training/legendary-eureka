# Admin Route Area — `src/app/[locale]/(admin)/admin/`

Route-level reference for the admin multi-page area. Claude Code loads this file whenever you open
any file under this directory. Feature-layer details (components, store, schema) live in
`src/features/admin/CLAUDE.md`.

## Layout & guard

`layout.tsx` — wraps all admin routes in `<AppShell role="admin">`. This is the outer role guard;
only the `admin` role reaches any route below. Individual store mutations re-check `can(actor,
action)` inside `features/admin/store.ts` (defense in depth). No inline role checks belong in route
files.

## Routes

| Path | File | What it does |
|---|---|---|
| `/[locale]/admin` | `page.tsx` | Overview dashboard — fetches `getAdminDashboard()` server-side; passes the typed `AdminDashboard` prop to `<AdminControlPanel>` |
| `/[locale]/admin/requests` | `requests/page.tsx` | Agency-onboarding + activity edit-request queues — see adapter note below |
| `/[locale]/admin/reports` | `reports/page.tsx` | Traveler-reported-agency queue — composes `<AdminQueuePage>` + `<ReportsQueue>` |
| `/[locale]/admin/content` | `content/page.tsx` | Destinations + tour-packages moderation — see content note below |
| `/[locale]/admin/bookings` | `bookings/page.tsx` | Platform-wide booking monitoring — fetches all trips + monthly trend |
| `/[locale]/admin/users` | `users/page.tsx` | User management (suspend / ban) — composes `<AdminQueuePage>` + `<UsersPanel>` |
| `/[locale]/admin/settings` | `settings/page.tsx` | Platform settings — delegates to `features/settings/components/SettingsPage` (cross-role feature) |
| `/[locale]/admin/calendar` | `calendar/page.tsx` | Admin calendar view — delegates to `features/calendar/components/RoleCalendar role="admin"` |
| `/[locale]/admin/destinations` | `destinations/page.tsx` | **Redirect stub** → `/[locale]/admin/content?tab=destinations` |
| `/[locale]/admin/tour-approvals` | `tour-approvals/page.tsx` | **Redirect stub** → `/[locale]/admin/content?tab=packages` |

## Loading skeletons

| File | Mirrors |
|---|---|
| `loading.tsx` | Admin overview grid (4 KPI tiles + 2 chart rows) |
| `bookings/loading.tsx` | Bookings 3-column grid (3 stat cards + trend card + revenue/recent cards) |

Both use `<Skeleton>` from `@/ui` only — no feature imports.

## Error boundary

`error.tsx` — client component. Catches render failures in the overview route segment. Uses
`admin.dashboard.error` and `common.retry` i18n keys (must exist in all three locales). Logs
`error` to console; shows a localized message + a `<Button variant="primary" onPress={reset}>` to
retry. Do not widen this boundary to cover sub-routes — each sub-route should add its own
`error.tsx` if needed.

## Service calls

All data fetching is done server-side in the page file (Server Component). Service modules used:

| Service | Functions | Used by |
|---|---|---|
| `services/admin.service` | `getAdminDashboard` | `page.tsx` |
| `services/admin.service` | `getAdminAgencies`, `getAdminEditRequests` | `requests/page.tsx` |
| `services/admin.service` | `getAdminDestinations` | `content/page.tsx` |
| `services/packages.service` | `getPackages`, `getArchivedPackages` | `content/page.tsx` |
| `services/bookings.service` | `getAllTrips`, `getAdminMonthlyBookings` | `bookings/page.tsx` |

## Adapter pattern (`requests/page.tsx`)

The backend returns `AgencyPage` and `EditRequestPage` shapes (from `src/lib/api/admin.ts`). The
page file adapts them to `AdminAgencyProfile[]` and `AdminEditRequest[]` before passing to
`<RequestsPage>`. Keep this mapping in the route file — not in the service or feature component —
so the feature component stays decoupled from the wire types.

## Content page (`content/page.tsx`)

Fetches published packages (`getPackages`) and archived packages (`getArchivedPackages`) in
parallel, then merges the two arrays before passing to `<ContentPage>`. This is because the two
statuses come from disjoint endpoints. If either the destinations or packages fetch fails, `loadError`
is set to `true` and `<ContentPage>` renders a fallback — don't swallow errors silently.

## Bookings page (`bookings/page.tsx`)

`getAdminMonthlyBookings(12)` is a secondary card — its failure must not take down the page. The
call is wrapped in `.catch(() => [])` so a trend-data failure degrades gracefully.

## Redirect stubs

`destinations/page.tsx` and `tour-approvals/page.tsx` are **intentional redirect stubs** kept for
backwards-compatibility with old links. Do not remove them. Destinations management and package
approvals now live as tabs inside the content page (`/admin/content?tab=destinations` and
`?tab=packages`).

## Settings note

`settings/page.tsx` renders `<SettingsPage>` from `features/settings` — a cross-role feature (also
used by agency and traveler areas). Do not add admin-only guards inside `SettingsPage` itself;
the admin-only guard is already enforced by this area's `layout.tsx`.

## What belongs here vs. the feature folder

| Concern | Location |
|---|---|
| Route file, loading/error skeletons | This directory |
| Feature components, store, Zod schemas | `src/features/admin/` |
| Service wrappers (API calls) | `src/services/admin.service.ts` etc. |
| Wire types (backend JSON shapes) | `src/lib/api/admin.ts` |
| Role/permission logic | `src/lib/permissions.ts` only |
