---
name: ui-ux-pro-max
description: "UI/UX design intelligence for modern web apps (adapted for Jalat: Next.js 16 + React 19 + Tailwind v4 + HeroUI v3). 50+ styles, color systems, font pairing, product-type reasoning, and 99 UX guidelines across accessibility, interaction, performance, layout, typography/color, animation, forms, navigation, and charts. Actions: plan, build, design, implement, review, fix, improve a UI. Use when the task changes how a feature looks, feels, moves, or is interacted with."
metadata:
  type: reference
  adaptedFrom: "ui-ux-pro-max (original targeted React Native)"
  stack: "Next.js / React / TypeScript / Tailwind / HeroUI"
---

# UI/UX Pro Max — Design Intelligence (Jalat web edition)

Comprehensive design guide for **web** applications. This is the **inline-only** adaptation: the
original shipped a `scripts/search.py` CLI + CSV database that are **not bundled here**, so there are
no CLI commands — use the Quick Reference rules below directly.

> **Scope (adapted):** Jalat is a **Next.js web app**, not React Native. The original skill said
> "React Native (this project's only tech stack)" — that has been re-stacked to
> **Next.js / React / Tailwind / HeroUI**. Rules that are **mobile-native only** are tagged
> **`[native-only]`** — apply them with judgment (they matter for responsive/touch on web but not
> literally, e.g. no `hitSlop`/haptics on web). Pair this skill with `.claude/rules/styling-conventions.md`
> (HeroUI wrapper layer, Tailwind tokens) — when they overlap, the Jalat rules win.

## When to apply

Use whenever the task involves **UI structure, visual design, interaction patterns, or UX quality**:
new pages (landing, dashboard, admin, auth), creating/refactoring components (buttons, modals, forms,
tables, cards, charts), choosing color/type/spacing/layout systems, reviewing UI for a11y or polish,
or implementing navigation/animation/responsive behavior. **Skip** for pure backend/API/infra work.

**Decision criteria:** if the task changes how a feature **looks, feels, moves, or is interacted
with**, use this skill.

## Rule Categories by Priority

| Priority | Category | Impact | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, alt text, keyboard nav, aria-labels, visible focus | Removing focus rings, icon-only buttons without labels |
| 2 | Interaction | CRITICAL | Adequate hit targets, loading feedback, don't rely on hover alone | Hover-only actions, instant 0ms state changes |
| 3 | Performance | HIGH | Next/Image (WebP/AVIF), lazy load, reserve space (CLS < 0.1) | Layout thrashing, cumulative layout shift |
| 4 | Style Selection | HIGH | Match product type, consistency, SVG icons (Iconsax, no emoji) | Mixing flat & skeuomorphic, emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, no horizontal scroll, `min-h-dvh` | Horizontal scroll, fixed-px containers, disabling zoom |
| 6 | Typography & Color | MEDIUM | Base 16px, line-height 1.5, semantic tokens | Body < 12px, gray-on-gray, raw hex in components |
| 7 | Animation | MEDIUM | 150–300ms, motion conveys meaning, transform/opacity only | Decorative-only motion, animating width/height, no reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, error near field, helper text | Placeholder-only labels, errors only at top |
| 9 | Navigation | HIGH | Predictable back, active state, clear hierarchy | Overloaded nav, broken back, inconsistent placement |
| 10 | Charts & Data | LOW | Legends, tooltips, accessible colors, table alternative | Color-only meaning, pie for >5 categories |

## Quick Reference

### 1. Accessibility (CRITICAL)
- `color-contrast` — ≥4.5:1 for normal text (3:1 large). HeroUI tokens are designed for this; verify custom colors.
- `focus-states` — visible focus ring (2–4px) on every interactive element. Never remove it. HeroUI provides `:focus-visible` rings — keep them.
- `alt-text` — descriptive `alt` on meaningful images (`next/image` `alt`).
- `aria-labels` — `aria-label` on icon-only buttons.
- `keyboard-nav` — tab order matches visual order; everything operable by keyboard.
- `form-labels` — real `<Label htmlFor>` (HeroUI `Label`), not placeholder-as-label.
- `skip-links` — "skip to main content" for keyboard users on content-heavy pages.
- `heading-hierarchy` — sequential `h1→h6`, no skipped levels.
- `color-not-only` — never convey meaning by color alone; add icon/text.
- `reduced-motion` — respect `prefers-reduced-motion`; reduce/disable animation.
- `dynamic-type` — support browser zoom / text scaling without truncation. `[native-only]` exact Dynamic Type API.
- `screen-reader` — logical reading order, meaningful labels. `[native-only]` VoiceOver specifics.
- `escape-routes` — cancel/close in modals and multi-step flows.

### 2. Interaction (CRITICAL)
- `target-size` — comfortable click/tap targets (≈40–44px min for touch; mobile breakpoints especially).
- `target-spacing` — ≥8px gap between adjacent targets.
- `hover-vs-tap` — primary actions on click/tap; never rely on hover alone (no hover on touch).
- `loading-buttons` — disable + spinner during async (HeroUI `Button isPending`).
- `error-feedback` — clear message near the problem.
- `cursor-pointer` — clickable elements get `cursor-pointer`.
- `tap-delay` — `touch-action: manipulation` to avoid 300ms delay where relevant.
- `press-feedback` — visible pressed state (HeroUI handles `[data-pressed]`).
- `gesture-alternative` — never gesture-only for critical actions; always a visible control.
- `haptic-feedback`, `safe-area`, `system-gestures`, `no-precision-required`, `swipe-clarity`, `drag-threshold` — `[native-only]`.

### 3. Performance (HIGH)
- `image-optimization` — `next/image` (WebP/AVIF, responsive `sizes`), lazy-load non-critical.
- `image-dimension` — set width/height or `aspect-ratio` to prevent CLS.
- `font-loading` — `next/font` with `display: swap`; reserve space.
- `critical-css` / `bundle-splitting` — route/feature code-splitting (`next/dynamic`, Suspense) to cut TTI.
- `lazy-loading` — `loading="lazy"` below the fold; dynamic-import heavy components.
- `reduce-reflows` — batch DOM reads/writes; avoid layout thrash.
- `content-jumping` — reserve space for async content (skeletons) to avoid CLS.
- `virtualize-lists` — virtualize 50+ item lists.
- `progressive-loading` — skeleton/shimmer for >1s loads, not a blocking spinner.
- `debounce-throttle` — for scroll/resize/input handlers.
- `input-latency` — keep interaction feedback < ~100ms.

### 4. Style Selection (HIGH)
- `style-match` — style fits the product (Jalat: clean, content-first travel UI).
- `consistency` — same style across all pages.
- `no-emoji-icons` — **use SVG icons (Iconsax via the `@/ui` layer), never emojis.**
- `color-palette-from-product` — palette from product/industry; use semantic tokens.
- `effects-match-style` — shadows/blur/radius align with the chosen style.
- `state-clarity` — distinct hover/pressed/disabled states (HeroUI state layers).
- `elevation-consistent` — one shadow/elevation scale for cards/sheets/modals.
- `dark-mode-pairing` — design light/dark together; test contrast in each.
- `icon-style-consistent` — one icon set + stroke/weight (Iconsax, consistent `variant`).
- `primary-action` — one primary CTA per screen; secondaries subordinate.

### 5. Layout & Responsive (HIGH)
- `viewport-meta` — `width=device-width, initial-scale=1`; never disable zoom (Next sets this).
- `mobile-first` — design mobile-up; scale to tablet/desktop.
- `breakpoint-consistency` — systematic Tailwind breakpoints (sm/md/lg/xl).
- `readable-font-size` — ≥16px body on mobile (avoids iOS auto-zoom).
- `line-length-control` — ~35–60 chars mobile, 60–75 desktop.
- `horizontal-scroll` — none on mobile; content fits viewport.
- `spacing-scale` — 4/8px spacing system (Tailwind spacing).
- `container-width` — consistent desktop max-width (`max-w-6xl/7xl`).
- `z-index-management` — defined z-index scale.
- `viewport-units` — prefer `min-h-dvh` over `100vh` on mobile.
- `content-priority` — core content first on mobile; fold secondary.
- `visual-hierarchy` — hierarchy via size/spacing/contrast, not color alone.
- `safe-area`, `system-bar-clearance` — `[native-only]`.

### 6. Typography & Color (MEDIUM)
- `line-height` — 1.5–1.75 for body.
- `line-length` — 65–75 chars per line.
- `font-pairing` — heading/body personalities match.
- `font-scale` — consistent type scale (12 14 16 18 24 32).
- `contrast-readability` — dark text on light surfaces.
- `weight-hierarchy` — bold headings (600–700), regular body (400), medium labels (500).
- `color-semantic` — semantic tokens (primary, surface, foreground, muted, danger), **not raw hex** in components. Jalat uses HeroUI tokens + Tailwind theme.
- `color-dark-mode` — desaturated/lighter tonal variants in dark mode, not inverted; test contrast separately.
- `color-accessible-pairs` — fg/bg ≥4.5:1 (AA).
- `number-tabular` — `tabular-nums` for data columns, prices, timers.
- `whitespace-balance` — intentional whitespace to group/separate.

### 7. Animation (MEDIUM)
- `duration-timing` — 150–300ms micro-interactions; ≤400ms complex; avoid >500ms.
- `transform-performance` — animate `transform`/`opacity` only; never width/height/top/left.
- `loading-states` — skeleton/progress when load > ~300ms.
- `excessive-motion` — 1–2 key animated elements per view.
- `easing` — ease-out entering, ease-in exiting; avoid linear for UI.
- `motion-meaning` — every animation expresses cause→effect, not decoration.
- `exit-faster-than-enter` — exits ~60–70% of enter duration.
- `stagger-sequence` — stagger list entrances 30–50ms/item.
- `interruptible` / `no-blocking-animation` — user input cancels animation; never block input.
- `modal-motion` — modals/sheets animate from their trigger (scale+fade/slide).
- `layout-shift-avoid` — animation must not cause reflow/CLS (use transform).
- Jalat uses **Framer Motion** for app animation; HeroUI v3 itself is CSS-based (no motion dep needed for it).

### 8. Forms & Feedback (MEDIUM)
- `input-labels` — visible `<Label>` per input (not placeholder-only).
- `error-placement` — error directly below the related field.
- `submit-feedback` — loading → success/error state on submit.
- `required-indicators` — mark required fields.
- `empty-states` — helpful message + action when no content.
- `toast-dismiss` — auto-dismiss toasts in 3–5s (Jalat uses **Sileo**).
- `confirmation-dialogs` — confirm before destructive actions.
- `input-helper-text` — persistent helper below complex inputs.
- `disabled-states` — reduced opacity + `disabled` semantics + cursor.
- `inline-validation` — validate on blur, not per-keystroke. (Jalat: RHF + Zod resolver.)
- `input-type-keyboard` — semantic input `type` (email/tel/number) for correct mobile keyboards.
- `password-toggle` — show/hide toggle for password fields.
- `autofill-support` — `autocomplete` attributes so the browser can autofill.
- `error-clarity` — state cause + how to fix, not just "Invalid input".
- `focus-management` — after a submit error, focus the first invalid field.
- `error-summary` — multiple errors → summary at top with anchor links.
- `destructive-emphasis` — destructive actions use the danger color, separated from primary.
- `aria-live-errors` — form errors via `aria-live`/`role="alert"`; toasts don't steal focus.

### 9. Navigation (HIGH)
- `back-behavior` — predictable, consistent back; preserve scroll/state.
- `deep-linking` — key screens reachable via URL (Next routes/route groups — Jalat uses `(admin)/(agency)/(traveler)`).
- `nav-label-icon` — nav items have icon **and** text label.
- `nav-state-active` — current location visually highlighted (`aria-current`).
- `nav-hierarchy` — primary nav vs secondary (drawer/settings) clearly separated.
- `breadcrumb-web` — breadcrumbs for 3+ level deep hierarchies.
- `state-preservation` — back restores scroll/filter/input.
- `adaptive-navigation` — ≥1024px prefer sidebar; small screens top/bottom nav. (Jalat shell: sidebar on `md+`.)
- `navigation-consistency` — same placement across pages; don't mix Tab+Sidebar+Bottom at one level.
- `modal-vs-navigation` — modals are not primary navigation.
- `destructive-nav-separation` — logout/delete separated from normal nav.
- `bottom-nav-limit`, `tab-bar-ios`, `gesture-nav` — `[native-only]`.

### 10. Charts & Data (LOW)
- `chart-type` — trend→line, comparison→bar, proportion→pie/donut (≤5 categories).
- `color-guidance` — accessible palettes; avoid red/green-only pairs.
- `data-table` — provide a table alternative for screen readers.
- `pattern-texture` — supplement color with pattern/shape.
- `legend-visible` / `tooltip-on-interact` — legend near chart; tooltips on hover/tap.
- `responsive-chart` — reflow/simplify on small screens.
- `empty-data-state` / `loading-chart` / `error-state-chart` — meaningful empty/loading/error, never a blank axis.
- `number-formatting` — locale-aware numbers/dates/currency (ties to Jalat i18n: KH/KR/ENG).
- `sortable-table` — `aria-sort` indicating current sort.
- `gridline-subtle` — low-contrast gridlines; emphasize data over decoration.
- `screen-reader-summary` — text summary / `aria-label` of the chart's key insight.

## Common Rules for Professional UI (web-adapted)

Frequently-overlooked issues that make UI look unprofessional:

- **No emoji as structural icons** — use vector icons (Iconsax via `@/ui`), never 🎨🚀⚙️ for nav/settings.
- **Vector-only assets** — SVG/vector that scale cleanly and theme correctly; no blurry raster icons.
- **Stable interaction states** — press states via color/opacity/elevation, never layout-shifting transforms.
- **Correct brand logos** — official assets, correct proportions/clear space.
- **Consistent icon sizing** — icon-size tokens (e.g. 16/20/24), not arbitrary mixes.
- **Stroke & filled/outline discipline** — one stroke width and one fill/outline style per hierarchy level (Iconsax `variant`).
- **Icon alignment & contrast** — align to text baseline; meet contrast in light and dark.
- **Token-driven theming** — semantic tokens per theme across surfaces/text/icons; no ad-hoc per-screen hex.
- **Scrim/modal legibility** — modal scrim strong enough (≈40–60% black) to isolate foreground.
- **8px spacing rhythm** — consistent 4/8px spacing at component/section/page levels.

## How to use (inline)

1. **New page/component:** pick category by priority (1→10). Start with Style Selection (§4) +
   Typography/Color (§6) for the look, then enforce §1–§3 (a11y, interaction, performance).
2. **Reviewing/fixing UI:** walk the Quick Reference top-down; §1–§3 are CRITICAL/HIGH — treat as blockers.
3. **Before delivery:** run the checklist below; test at 375px width; verify with reduced-motion on and
   in dark mode (contrast checked independently).

### Pre-Delivery Checklist (web)
- [ ] No emoji icons; one consistent icon family (Iconsax via `@/ui`)
- [ ] Semantic tokens only (HeroUI/Tailwind), no ad-hoc hex in components
- [ ] All interactive elements have visible focus + pressed feedback (don't remove HeroUI focus rings)
- [ ] Comfortable target sizes and spacing on touch breakpoints
- [ ] Primary text ≥4.5:1, secondary ≥3:1 — in **both** light and dark
- [ ] Labels on inputs; errors beside fields; first invalid field focused on submit
- [ ] Animations 150–300ms, transform/opacity only, respect `prefers-reduced-motion`
- [ ] No horizontal scroll; verified at 375px, tablet, desktop; `min-h-dvh` not `100vh`
- [ ] Images via `next/image` with dimensions (no CLS); skeletons for >300ms loads
- [ ] All copy via i18next (KH/KR/ENG) — no hardcoded strings
