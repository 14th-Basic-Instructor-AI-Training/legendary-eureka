# @/ui — Wrapper Component Inventory

`src/ui/` is the HeroUI extended-variant wrapper layer. **All feature code imports from here, never from `@heroui/react` directly.**

## Available wrappers

| Export | Wraps | Notes |
|---|---|---|
| `Button` | HeroUI Button | Not polymorphic — use `onPress` for navigation |
| `Input` | HeroUI Input | Bakes in Jalat label / error styles |
| `TextArea` | HeroUI Textarea | |
| `Card` | HeroUI Card | Default shadow / radius tokens |
| `Select` | HeroUI Select | |
| `Chip` | HeroUI Chip | |
| `StatusChip` | HeroUI Chip | Reads `status.*` i18n keys; maps status → color variant |
| `Skeleton` | HeroUI Skeleton | Used in loading states |
| `Reveal` | Framer Motion | Scroll-triggered reveal animation |
| `Form` | pass-through | RHF `<form>` wrapper |
| `Label` | HeroUI label | |
| `Avatar` | HeroUI Avatar | |
| `Spinner` | HeroUI Spinner | |
| `Separator` | HeroUI Divider | |
| `Link` | HeroUI Link | |
| `Dropdown` | HeroUI Dropdown | |
| `Tabs` | HeroUI Tabs | |
| `Modal` | HeroUI Modal | |
| `AlertDialog` | HeroUI AlertDialog | |
| `ConfirmDialog` | Custom | Wraps Modal; pair with `useConfirm()` hook |

## Adding a new wrapper

1. Check that HeroUI has the primitive.
2. Add the wrapper file in `src/ui/`.
3. Export it from `src/ui/index.ts`.
4. Only then use it in feature code.

Never reach for `@heroui/react` directly in a feature — even for a one-off.

## Styling wrappers

Wrapper variants bake in Jalat's design tokens (colors, spacing, radii from `tailwind.config.ts`). Don't override HeroUI internals inside feature components — extend via wrapper props or add a variant in the wrapper file.

Use `cn()` / `tailwind-merge` for conditional class composition, never string concatenation.
