---
name: tdd
description: >-
  Drive a Jalat feature test-first — write the failing test (Vitest + React Testing Library, or
  Playwright for flows), watch it fail, implement the minimum to pass, refactor. Use when building
  with TDD or hardening the permissions module and domain state machines.
---

# TDD (Jalat)

Red → green → refactor. The test encodes the requirement before the code exists.

## Loop
1. Write the smallest failing test that states the next requirement.
2. Run it; confirm it fails for the right reason.
3. Implement the minimum to make it pass.
4. Refactor with the test green. Repeat.

## Highest-value targets (test these first)
- **`lib/permissions.ts`** — table-driven tests over (role × action × resource) for Admin/Agency/
  Traveler/Guest. Authorization bugs concentrate here; cover exhaustively.
- **Domain state machines** — agency onboarding, booking lifecycle, activity edit-requests: assert
  legal transitions pass and illegal ones are rejected.
- **Zod schemas** — valid fixtures parse; invalid inputs reject.
- **Forms** — RHF + Zod validation: valid submit + each invalid field.
- **Components** — render with mock data; assert loading/empty/error and role-conditional UI.

## Conventions
Vitest + React Testing Library for units; Playwright for end-to-end flows. Test behavior, not
internals. Read mock data from the same per-feature fixture modules the app uses. Never finish with
failing or skipped tests. See the `tdd-guide` agent for deeper help and `testing` for running the
suite.
