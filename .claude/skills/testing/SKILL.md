---
name: testing
description: >-
  Run and reason about Jalat's test suite — how to run all tests or a single test, what to cover, and
  how to interpret failures. Use when running tests, adding coverage, or diagnosing a failing test.
---

# Testing (Jalat)

> No test runner is configured yet. When one is added, update this file and `CLAUDE.md` with the
> exact commands. The proposed stack is **Vitest + React Testing Library** (units) and **Playwright**
> (end-to-end flows).

## Commands (fill in once configured)
```bash
# all tests
npm run test
# watch mode
npm run test -- --watch
# a single file
npm run test -- src/features/bookings/bookings.test.ts
# a single test by name
npm run test -- -t "agency can approve a pending booking"
# end-to-end
npm run test:e2e
```

## Coverage priorities
1. The central permissions module (role × action × resource) — exhaustive.
2. Domain-flow state machines: agency onboarding, booking lifecycle, edit-requests.
3. Zod schema parse/reject paths.
4. Forms (RHF + Zod) valid/invalid paths.
5. Components: loading/empty/error + role-conditional UI.
6. Playwright happy paths for each cross-cutting flow.

## Conventions
- Co-locate unit tests with the feature (`features/<feature>/*.test.ts(x)`).
- Use the same per-feature fixtures the app uses; don't invent parallel mock data.
- A feature isn't done with failing or skipped tests. See `tdd` / the `tdd-guide` agent for writing
  tests first.
