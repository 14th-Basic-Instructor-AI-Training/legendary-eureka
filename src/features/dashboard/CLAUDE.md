# Feature: dashboard

Per-role overview cards. The same `features/dashboard` module renders for all roles; the `DASHBOARDS` config map selects which cards each role sees.

## Config

`features/dashboard/config.ts` exports a `DASHBOARDS` map keyed by role:

```ts
DASHBOARDS['admin']    // admin overview cards
DASHBOARDS['agency']   // agency overview cards
DASHBOARDS['traveler'] // traveler overview cards
```

i18n copy for card titles and labels lives under `dashboard.<role>.cards.*` in the locale files.

## Agency dashboard route

The agency has a dedicated page at `/[locale]/agency/dashboard` in addition to the shared dashboard component. Other roles reach their dashboard via `dashboardPathFor(role)` from `lib/permissions.ts`.

## Chart cards

Analytics cards use **Recharts** (`recharts`):
- Bar chart — activity / booking counts
- Line chart — revenue over time
- Area chart — traveler growth
- Donut chart — booking status breakdown

All chart cards import from `features/admin/components/dashboard/chartTheme.ts` for consistent colors. `chartTheme.ts` maps Tailwind design tokens to Recharts color arrays — do not hardcode hex values in chart components.

## Pattern

Dashboard cards are read-only — they use `useResource(getter)` with loading skeletons and error retry states. No Zustand store mutations here.
