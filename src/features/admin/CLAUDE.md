# Feature: admin

Multi-route area driven by the shadcn sidebar. Each sub-route is its own Next.js page — this is not a single-page tab strip.

## Routes

| Page | Path |
|---|---|
| Overview / dashboard | `/[locale]/admin` |
| Agency requests | `/[locale]/admin/requests` |
| Reports | `/[locale]/admin/reports` |
| Content moderation | `/[locale]/admin/content` |
| Bookings | `/[locale]/admin/bookings` |
| Users | `/[locale]/admin/users` |
| Settings | `/[locale]/admin/settings` |

## Key components

**`RequestFlowPanel`** — React Flow (`@xyflow/react`) diagram in `features/admin/components/` that visualizes the agency onboarding and activity edit-request lifecycle as a state machine (pending → approved / rejected, with edit-request sub-states).

**Chart cards** — Recharts bar / line / area / donut cards in `features/admin/components/dashboard/`. All import from `chartTheme.ts` for consistent colors mapped to Tailwind design tokens.

**`EditRequestsQueue`** — lists pending agency edit requests. Uses `<StatusChip>` for status pills and calls `useConfirm()` before approve / reject actions.

## Store

`features/admin/store.ts` (Zustand). Every transition calls `can(actor, action)` from `lib/permissions.ts` before mutating. Illegal transitions surface as a localized "not allowed" message — never silently ignored.

## Permissions

Only the `admin` role reaches these routes. The layout guard calls `assertCan(actor, 'manageUsers')` (and other admin-only actions) before rendering. See `src/lib/permissions.ts` for the full action set.
