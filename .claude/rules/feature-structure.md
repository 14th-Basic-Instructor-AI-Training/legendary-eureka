# Feature Structure (Jalat)

Frontend analog of the backend `feature-structure.md`. Jalat is organized **by feature**, not by
technical layer. Everything one feature needs lives together so real data can replace mocks without
hunting across the tree.

## Layout

```
src/
  app/                      # Next.js App Router routes (thin — compose features)
    layout.tsx              # root: html/body/fonts/toploader (no providers)
    [locale]/               # EVERY route is under the locale segment (en/kh/kr)
      layout.tsx            # validates locale + wraps children in Providers(locale)
      (traveler)/ ...       # route groups per role area
      (agency)/ ...
      (admin)/ ...
      (auth)/ ...
  middleware.ts             # redirects unprefixed paths to /[locale] (cookie/default)
  features/
    <feature>/              # built: landing, destinations, auth, agency, admin
                            #   (next: bookings, trip-plans, newsfeed, agency-onboarding UI)
      components/           # feature UI (wrapped HeroUI), with loading/empty/error states
      store.ts              # Zustand store for this feature (or store/ if it grows)
      schema.ts             # Zod schemas — the data source of truth for this feature
      data.ts               # the ONE data module: typed async API, fixtures today / API later
      fixtures.ts           # mock data (conformant to schema.ts)
      hooks.ts              # feature-specific hooks
      types.ts              # z.infer types + local types
      i18n/                 # feature locale keys: kh.json / kr.json / en.json
  ui/                       # the HeroUI extended-variant wrapper layer (shared)
  lib/
    permissions.ts          # the CENTRAL role/permission module (single source of truth)
    auth.ts                 # session shape (mock now, Auth.js later): useSession / useRequireRole
    i18n.ts                 # i18next init (KH/KR/ENG)
    useResource.ts          # shared loading/error/empty hook for any data.ts getter
    format.ts               # locale-aware price/number/rating formatting
  components/sidebar/        # the ONLY place shadcn/ui is used
```

## Data loading
- A feature's mutable, transition-bearing state (e.g. booking approve/reject, agency-request
  approve/reject) lives in its `store.ts` (Zustand); the store action **re-checks permission**
  via `can(role, action)` before mutating (defense in depth).
- Read-only fetches go through `data.ts` getters returning a typed result, consumed in components
  with `useResource(getter)` from `lib/useResource.ts` (renders loading / error+retry / empty /
  success). Seed stores from `data.ts` `initialX()` helpers, never from `fixtures.ts` directly.

## Rules
- **Mock data behind `data.ts`** — components import from `data.ts`, never from `fixtures.ts`
  directly. Swapping fixtures for route handlers/server actions is then a one-file change.
- **Schema first** — define `schema.ts` before building UI; derive types from it.
- **Permissions are global, not per-feature** — they live in `lib/permissions.ts`; features call
  into it (see `auth-permissions.md`).
- **i18n keys are namespaced per feature** and exist in all three locales.
- Route files in `app/` stay thin: they wire layout + role guard + compose feature components.
