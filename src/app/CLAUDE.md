# App Router — Routing Conventions

Route files in `app/` stay **thin** — they wire layout + role guard and compose feature components. No business logic here.

## Locale prefix

Every route lives under `/[locale]/…`. The three locale values are `en`, `kh`, `kr`.

`src/middleware.ts` intercepts unprefixed requests and redirects to a locale (using the `NEXT_LOCALE` cookie, falling back to `en`).

The `[locale]` layout (`src/app/[locale]/layout.tsx`) validates the locale segment and wraps children in `Providers(locale)`, which initializes i18next for that locale.

## Always navigate with locale helpers

Never use raw `next/link` or `useRouter` for in-app navigation — they drop the locale prefix.

```tsx
import { LocaleLink, useLocalizedRouter } from '@/lib/locale'

// declarative link
<LocaleLink href="/admin/requests">Requests</LocaleLink>

// programmatic
const router = useLocalizedRouter()
router.push('/agency/bookings')
```

Locale constants (server-safe, no side effects): `src/lib/locales.ts`.
i18next init (side effect, client only): `src/lib/i18n.ts` — **never import from Server Components**.

## Route groups

```
src/app/[locale]/
  (admin)/admin/          ← admin sidebar area (multi-route)
  (agency)/agency/        ← agency workspace
  (traveler)/traveler/    ← traveler personal area
  (auth)/                 ← login, register, verify-otp, forgot/reset password
```

Public routes (no group): `/`, `/destinations/[slug]`, `/tours/[id]`, `/agencies/[slug]`, `/explore`.

## Login redirects

After authentication, `homePathFor(role)` from `lib/permissions.ts` determines where to send the user:
- Admin → `/[locale]/admin`
- Traveler / Agency → `/[locale]` (landing)

The header uses `dashboardPathFor(role)` to link each role to their own area.

## Error boundaries

Each route segment should have:
- `error.tsx` — recoverable render failures; show a retry UI, not a white screen.
- `not-found.tsx` — 404 for that segment.

## API routes

`src/app/api/auth/[...nextauth]/` — Auth.js handler (mock for now).
`src/app/api/realtime/` — WebSocket endpoint (deferred).
