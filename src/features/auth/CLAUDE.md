# Feature: auth

Handles all authentication flows. No real backend yet — everything is mock via `data.ts`.

## Routes

| Page | Path |
|---|---|
| Login | `/[locale]/login` |
| Register | `/[locale]/register` |
| Verify OTP | `/[locale]/verify-otp` |
| Forgot password | `/[locale]/forgot-password` |
| Reset password | `/[locale]/reset-password` |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@jalat.test` | `Admin@123` |
| Agency | `agency@jalat.test` | `Agency@123` |
| Traveler | `traveler@jalat.test` | `Traveler@123` |

OTP demo code: **`123456`**

## Forms

All forms use **React Hook Form + Zod** — `schema.ts` defines the shapes and `zodResolver` wires them into RHF. Validation runs client-side today; the same schemas validate server-side once a real backend exists.

## Register flow

The register page supports two paths:

1. **New Traveler** — standard account creation.
2. **Become a Tour Agency** — submits a registration request to Admin. Role stays `traveler` until Admin approves; once confirmed the session role flips to `agency`. See the agency onboarding flow in the root `../CLAUDE.md`.

## Mock session

`src/lib/auth.ts` exposes `useSession()` and `useRequireRole(role)` with the same `{ user, role }` shape the future Auth.js session will have. Never read role from client-controllable state — always from the session hook.

After login, redirect with `homePathFor(role)` from `lib/permissions.ts`:
- Admin → `/admin`
- Traveler / Agency → `/` (landing)

## OTP verification

After registration or password reset, users land on `/verify-otp`. The mock accepts `123456` as the valid code. The real flow will verify a server-issued code via the Auth.js adapter.
