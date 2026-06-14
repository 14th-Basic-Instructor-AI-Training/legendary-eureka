# Error Handling (Jalat)

Frontend analog of the backend `exception-handling.md`. How failures surface in the UI and data
layer.

## Data layer (`data.ts` / server actions)
- Functions return **typed results**, not thrown strings. Prefer a discriminated result
  (`{ ok: true, data } | { ok: false, error }`) or throw a typed `AppError` the UI maps to copy.
- **Validate at the boundary** with the shared Zod schema. A failed parse is an error result, not a
  crash. Never trust client-supplied IDs/roles without an ownership + permission check.
- Mock data layer behaves like the real one: it can return error results too, so error states are
  built and tested now (not bolted on after the backend lands).

## Components
- Every data-driven component renders **loading / empty / error** explicitly. No happy-path-only UI.
- Use React **error boundaries** at route/section level for render-time failures; show a recoverable
  fallback, not a white screen.
- Next.js: use `error.tsx` and `not-found.tsx` per route segment.

## User feedback
- Transient success/failure → **Sileo** toasts. Persistent/blocking errors → inline UI in the
  affected region.
- All error copy goes through **i18next** (KH/KR/ENG) — never hardcode error strings.
- Show users actionable messages; log technical detail to the console/observability, not to the UI.

## Domain-flow errors
- Illegal state transitions (booking, agency onboarding, edit-requests) are rejected by the state
  machine and surfaced as a clear, localized message — not silently ignored.
- Permission denials route through the permissions module and render a consistent "not allowed"
  state, never a partial/edit-disabled-but-still-submittable form.
