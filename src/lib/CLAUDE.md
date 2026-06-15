# lib — Utilities & Shared Modules

## permissions.ts — most important file in the repo

**Single source of truth for all role/authorization logic.**

```ts
can(actor, action)        // returns boolean; actor is Role | "guest" | null
assertCan(actor, action)  // throws PermissionError if denied
homePathFor(role)         // post-login redirect: admin → /admin, others → /
dashboardPathFor(role)    // header link: /admin | /agency | /traveler
```

The `MATRIX` table drives all permissions — add new actions there, never inline. All guards (route layouts, Zustand store mutations, future API handlers) call into this module. **Never** write `if (role === 'admin')` anywhere outside this file.

Tests: `src/lib/permissions.test.ts`.

## auth.ts — mock session

Exposes `useSession()` and `useRequireRole(role)` with the same `{ user, role }` shape the future Auth.js session will have. Components depend on this shape, not on Auth.js internals — swapping in the real session is a one-file change.

The current role always comes from the session, never from client-controllable state (URL params, localStorage, query strings).

## useResource.ts — data loading hook

```ts
const { status, data, reload } = useResource(getter)
// status: 'loading' | 'error' | 'empty' | 'success'
```

Use for every read-only data fetch from `data.ts`. Branch on `status` to render skeletons, error + retry, empty state, or the success content. Reference implementations: `DestinationSection`, `PackagesPanel`, `ActivitiesAdmin`.

## format.ts — locale-aware formatting

Helpers for prices, numbers, and ratings. Always use these instead of bare `toLocaleString` — Khmer and Korean have different numeral systems and date/number conventions.

## locales.ts vs i18n.ts

| File | Purpose | Safe in Server Components? |
|---|---|---|
| `locales.ts` | Pure constants (`LOCALES`, `DEFAULT_LOCALE`) | ✓ Yes |
| `i18n.ts` | i18next init (side effect) | ✗ No — client only |

**Never import `i18n.ts` from a Server Component.** Pass the locale string as a prop or route param instead.

## lib/api/

HTTP client helpers for when real endpoints replace mock `data.ts` getters. Not in active use during the static UI phase — do not call these from feature code yet.
