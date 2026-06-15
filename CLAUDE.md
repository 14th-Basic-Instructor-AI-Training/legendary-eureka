# Jalat Frontend

This is the `destination/` Next.js 16 app. Claude Code loads the relevant CLAUDE.md automatically as you navigate the project.

**Project domain** (roles, capabilities, permissions matrix) → `../CLAUDE.md`
**Always-on frontend globals** (tech stack, project status, commands) → `.claude/CLAUDE.md`

## Auto-loaded per area

| When working in… | File | Covers |
|---|---|---|
| `src/app/` | `src/app/CLAUDE.md` | Routing, locale prefix, middleware, redirects |
| `src/features/` | `src/features/CLAUDE.md` | Shared feature conventions, data.ts seam |
| `src/features/auth/` | `src/features/auth/CLAUDE.md` | Auth flows, mock session, OTP |
| `src/features/admin/` | `src/features/admin/CLAUDE.md` | Admin panel, React Flow, Recharts |
| `src/features/agency/` | `src/features/agency/CLAUDE.md` | Zustand store, booking flow |
| `src/features/dashboard/` | `src/features/dashboard/CLAUDE.md` | Per-role cards, chart patterns |
| `src/features/destinations/` | `src/features/destinations/CLAUDE.md` | MapLibre map, landing backbone |
| `src/features/booking/` | `src/features/booking/CLAUDE.md` | Booking request lifecycle |
| `src/components/` | `src/components/CLAUDE.md` | Component conventions, HeroUI rules |
| `src/ui/` | `src/ui/CLAUDE.md` | @/ui wrapper inventory |
| `src/lib/` | `src/lib/CLAUDE.md` | permissions.ts, useResource, auth.ts |

## Convention rules (always loaded via `.claude/rules/`)

| Rule file | Covers |
|---|---|
| `auth-permissions.md` | `can()`/`assertCan()`, MATRIX, session source of truth |
| `component-conventions.md` | Server vs client, props, naming, data-driven states |
| `error-handling.md` | Typed results, error boundaries, Sileo toasts |
| `feature-structure.md` | Folder layout, data loading, schema-first |
| `i18n-conventions.md` | Key naming, 3-locale workflow, formatting |
| `styling-conventions.md` | Tailwind v4, HeroUI tokens, shadcn sidebar-only |
