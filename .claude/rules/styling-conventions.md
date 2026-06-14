# Styling Conventions (Jalat)

How Tailwind + HeroUI work together. There is no backend equivalent — this is frontend-specific.

## Tailwind CSS (v4)
- Tailwind utilities are the styling primitive. Avoid ad-hoc CSS files; reach for utilities or the
  wrapper layer.
- Design tokens (colors, spacing, radii, typography) live in the Tailwind theme config and are the
  single source of truth. Don't hardcode hex values in components — use theme tokens.
- For conditional/variant class composition, use a consistent helper (e.g. `cn()` / `tailwind-merge`)
  rather than string concatenation that can produce conflicting classes.

## HeroUI wrapper layer (`src/ui/`)
- **Never import from `@heroui/react` in feature code.** Each primitive the app uses gets a local
  wrapped variant in `src/ui/` that bakes in Jalat's tokens, sizes, and default behavior.
- Variants and shared styling live in the wrapper — feature components compose wrapped components and
  pass props, they don't re-style HeroUI internals.
- When a new HeroUI primitive is needed, add its wrapper first, then use it.

## shadcn/ui
- **Sidebar only.** The shadcn sidebar lives in `src/components/sidebar/`. Do not introduce other
  shadcn components — use HeroUI (wrapped) for everything else.

## Animation & icons
- Motion via **Framer Motion**; icons via **Iconsax** — both surfaced through the wrapper layer for
  consistency. Keep animations subtle and respect `prefers-reduced-motion`.

## Responsiveness & theming
- Mobile-first; use Tailwind breakpoints. Support the app's light/dark theme through HeroUI/Tailwind
  theme tokens, not per-component overrides.
- Layouts must accommodate longer Khmer/Korean strings — don't fix widths to English copy length.
