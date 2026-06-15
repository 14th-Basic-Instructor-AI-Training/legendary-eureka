# Features — Shared Conventions

Jalat is organized **by feature**, not by technical layer. Everything one feature needs lives together so real data can replace mocks without hunting across the tree.

## Folder layout

```
features/<name>/
  components/    # feature UI (wrapped HeroUI), loading/empty/error states
  store.ts       # Zustand store (or store/ dir if it grows)
  schema.ts      # Zod schemas — the data source of truth
  data.ts        # ONE data module: typed async API, fixtures today / real API later
  fixtures.ts    # mock data (conformant to schema.ts)
  hooks.ts       # feature-specific hooks
  types.ts       # z.infer types + local types
  i18n/          # locale keys: kh.json / kr.json / en.json
```

## Rules

- **Mock data behind `data.ts`** — components import from `data.ts`, never from `fixtures.ts` directly. Swapping fixtures for real endpoints is then a one-file change.
- **Schema first** — define `schema.ts` before building UI; derive TS types with `z.infer`.
- **Permissions are global** — live in `lib/permissions.ts`; features call `can(actor, action)` from there, never inline a role check.
- **i18n keys namespaced per feature** — must exist in all three locales (`en` / `kh` / `kr`).
- **Route files in `app/` stay thin** — they wire layout + role guard and compose feature components.

## Data loading pattern

**Read-only data** → `useResource(getter)` from `@/lib/useResource`:

```tsx
const { status, data, reload } = useResource(getActivities)
// branch: 'loading' → <Skeleton>
//         'error'   → retry UI with reload()
//         'empty'   → empty state
//         'success' → render list
```

**Mutable / transition state** → Zustand store in `store.ts`. Store actions **re-check permission** via `can(role, action)` before mutating (defense in depth). Seed the store with `data.ts` `initialX()` helpers, never from `fixtures.ts` directly.

## Built features

`landing`, `destinations`, `auth`, `agency`, `admin`, `dashboard`, `booking`, `calendar`, `explore`, `notifications`, `report`, `settings`, `tours`, `traveler`

Complex features (auth, admin, agency, dashboard, destinations, booking) have their own `CLAUDE.md` in their folder.
