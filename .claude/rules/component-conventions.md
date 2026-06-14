# Component Conventions (Jalat)

Frontend analog of the backend `java-conventions.md`. How React/Next.js components are written.

## Server vs client components
- **Server Components by default.** Add `"use client"` only when a component needs state, effects,
  refs, or browser-only APIs. Push the client boundary as low in the tree as possible.
- Data fetching and permission checks belong on the server side / in the data module, not in client
  components reading raw fixtures.

## Structure
- One component per file; the file name matches the component (`PascalCase.tsx`).
- Co-locate a component's styles, sub-components, and tests with it inside its feature folder
  (see `feature-structure.md`).
- Props are typed with an explicit `Props` type/interface (or `z.infer` when derived from a schema).
  No `any`. Prefer discriminated unions over boolean prop soup.

## UI library
- **Use HeroUI only through the local wrapper layer** (`@/ui/*`), never `@heroui/react` directly in
  feature code. shadcn/ui is for the **sidebar only**.
- Available in `@/ui`: `Button`, `Input`, `TextArea`, `Card`, `Select`, `Chip`, `StatusChip`,
  `Skeleton`, `Reveal` (scroll motion), plus pass-throughs `Form`, `Label`, `Avatar`, `Spinner`,
  `Separator`, `Link`, `Dropdown`, `Tabs`, `Modal`, `AlertDialog`. Add a wrapper before using a new
  HeroUI primitive.
- **HeroUI v3 `Button` is not polymorphic** — it has no `as`/`href`. Navigate with
  `onPress={() => router.push(path)}`, not `<Button as={Link}>`.
- Motion via Framer Motion, icons via Iconsax — always through the wrapper.

## Data-driven components
- Render **loading / error / empty / success** explicitly. The conventional way: call
  `useResource(getter)` (`@/lib/useResource`) and branch on `status` — skeletons while loading, an
  error state with a `reload()` retry, an empty state, then the list. See `DestinationSection`,
  `PackagesPanel`, `ActivitiesAdmin` for the pattern.
- Status pills use `<StatusChip status="pending|approved|…" />` (localized `status.*` labels).

## State & data
- Local UI state: `useState`/`useReducer`. Cross-component/app state: Zustand stores (one per
  feature domain). Select narrowly from stores to avoid needless re-renders.
- Components read data from the feature's data module, never from fixture files directly.

## Every component handles
- **Loading, empty, and error** states explicitly — no screen that only renders the happy path.
- **Role-conditional UI** via the permissions module, not inline role string comparisons.
- **All copy through i18next** (`t('namespace.key')`) — see `i18n-conventions.md`.

## Naming
- Components `PascalCase`; hooks `useCamelCase`; stores `useXStore`; Zod schemas `XSchema`; types
  `X`. Event handlers `handleX`; props passing handlers `onX`.
