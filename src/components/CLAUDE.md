# Components — Conventions

## Server vs client boundary

**Server Components by default.** Add `"use client"` only when a component needs state, effects, refs, or browser-only APIs. Push the client boundary as low in the tree as possible.

## Structure

- One component per file; file name matches the component (`PascalCase.tsx`).
- Co-locate sub-components and tests inside the feature folder (see `src/features/CLAUDE.md`).
- Props: explicit `Props` type/interface or `z.infer` from schema. No `any`. Prefer discriminated unions over boolean prop soup.
- Naming: components `PascalCase`; hooks `useCamelCase`; stores `useXStore`; Zod schemas `XSchema`. Event handlers `handleX`; prop callbacks `onX`.

## UI library rules

**Never import from `@heroui/react` in feature code.** Use the local wrapper layer at `@/ui/` instead. See `src/ui/CLAUDE.md` for the full wrapper inventory.

**shadcn/ui is for the sidebar only** (`src/components/sidebar/`). Do not add other shadcn components.

## HeroUI v3 `Button` caveat

`Button` is not polymorphic — it has no `as` or `href` prop. For navigation use `onPress`:

```tsx
// ✓ correct
<Button onPress={() => router.push(path)}>Go</Button>

// ✗ wrong — will not compile
<Button as={Link} href={path}>Go</Button>
```

## Shared components

`src/components/layout/` — shared layout shells (header, footer, app shell).
`src/components/sidebar/` — shadcn sidebar (the only place shadcn is used).
`@/components/LanguageSwitcher` — locale switcher present on every page.

## Every component must handle

- **Loading, empty, and error states** — no happy-path-only screens.
- **Role-conditional UI** via `can(actor, action)` from `lib/permissions.ts` — not inline role string comparisons.
- **All copy through `t('namespace.key')`** — no hardcoded strings.

## State & data

- Local UI state: `useState` / `useReducer`.
- Cross-component state: Zustand stores (one per feature). Select narrowly to avoid needless re-renders.
- Read data through `data.ts` getters + `useResource`, never from `fixtures.ts` directly.
