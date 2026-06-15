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

## Page & component consistency (enforced)

These rules are derived from the actual admin pages (overview, requests, reports, content, bookings,
users, settings) — the canonical reference UI for the whole app. Every new page and component must
match these patterns. Never apply ad-hoc values in feature or page files; add a wrapper variant
instead.

---

### Color — text & background

All colors come from Tailwind theme tokens. No hardcoded hex. No `text-[#abc]` / `bg-[#abc]`.

**Text tokens in use:**

| Token | Role |
|---|---|
| `text-primary` | Page titles (`h1`), KPI values, section headings, active toggle |
| `text-muted` | Subtitles, captions, labels, empty-state copy, secondary text |
| `text-foreground` | Default body text |
| `text-text-primary` | Card primary content (names, titles inside cards) |
| `text-text-secondary` | Table cell secondary content |
| `text-danger` | Destructive action buttons, reject labels |
| `text-warning` | Warning severity labels |
| `text-green` | Approved/success labels |
| `text-red` | Rejected labels |

**Background tokens in use:**

| Token | Role |
|---|---|
| `bg-surface` | All cards, panels, stat tiles |
| `bg-bg-ghostwhite` | Table headers, card action footers, view-toggle container |
| `bg-primary/8` | Pending-count banner (primary tint) |
| `bg-primary/10` | Icon badge tint — primary/pending |
| `bg-warning/10` | Icon badge tint — warning |
| `bg-green/10` | Icon badge tint — approved/success |
| `bg-red/10` | Icon badge tint — rejected |
| `bg-danger/10` | Icon badge tint — danger |
| `bg-muted/10` | Icon badge tint — neutral / empty state icon |
| `bg-muted/40` | Severity rail — low |

**Border tokens:**

| Token | Role |
|---|---|
| `border-border` | Standard card/table border |
| `border-primary/20` | Pending banner border |
| `border-warning/30` | Warning banner border |

**Shadow:** `shadow-primary` on all card surfaces (`bg-surface`).

Dark/light is handled by the token — never add `dark:` overrides in feature code.

---

### Typography — font family, size, weight

Font family is set once in the root layout via the Tailwind theme. Components never override it.

**Font sizes:**

| Usage | Class |
|---|---|
| Page title (`h1`) | `text-2xl` |
| KPI / stat value | `text-3xl` (dashboard StatCard) · `text-2xl` (ReportsQueue StatTile) |
| Section heading (Panel `h3`) | `text-base` (default, semibold) |
| Card primary text | `text-sm font-semibold` |
| Body / label | `text-sm` |
| Secondary / caption | `text-xs` |
| Micro-label (uppercase `tracking-wide`) | `text-[10px]` — only for column/field labels inside cards |
| Tiny center label | `text-[11px]` — SVG overlays only |

Avoid arbitrary sizes except the two exceptions above; add a theme token if a new size is needed.

**Font weights:**

| Token | Usage |
|---|---|
| `font-bold` | Page titles, KPI numbers |
| `font-semibold` | Card titles, table headers, section headings |
| `font-medium` | Status text, banner labels, micro-labels |
| `font-normal` | Body, captions |

No numeric weights (`font-[500]`) — use the semantic tokens above.

**Tracking:** `tracking-tight` on all page titles and KPI values. `tracking-wide uppercase` on micro-labels inside cards.

---

### Spacing

No arbitrary values (`p-[13px]`, `gap-[18px]`). Stick to the scale below:

**Card padding:**

| Card type | Padding |
|---|---|
| Queue card / ReportCard | `p-4` |
| Dashboard Panel / StatCard | `p-5` |
| Card action footer | `px-4 py-2.5` |
| Table cell | `px-4 py-3` |

**Gap scale by level:**

| Level | Gap |
|---|---|
| Page-level sections | `gap-6` |
| Component-level flex/grid | `gap-4` or `gap-5` |
| Tight rows (badges, filters) | `gap-3` |
| Inline pairs (icon + text) | `gap-2` or `gap-2.5` |
| Tiny pairs (arrow + pct) | `gap-1.5` or `gap-0.5` |

**Vertical nudge:** `mt-1` for subtitle under `h1`; `mt-0.5` for subtitle under card heading; `mt-3` before diff blocks.

---

### Rounded / border radius

One radius per component type — encode in the wrapper variant, never inline per-page.

| Component type | Radius |
|---|---|
| Cards (all) | `rounded-2xl` |
| Panels / dashboard tiles | `rounded-2xl` |
| Pending banners | `rounded-xl` |
| Reason / note boxes inside cards | `rounded-xl` (reason) · `rounded-lg` (admin note) |
| Table container | `rounded-xl` |
| Large icon badge (`h-9 w-9`) | `rounded-xl` |
| Small icon badge (`h-7 w-7`) | `rounded-lg` |
| Filter pill buttons | `rounded-full` |
| View-toggle inner buttons | `rounded-md` |
| View-toggle container | `rounded-lg` |
| Empty-state icon circle (`h-12 w-12`) | `rounded-full` |
| Status/severity dot (`h-2 w-2`) | `rounded-full` |

---

### Alignment & layout

These patterns repeat across every admin page — use them exactly, don't invent local variations.

**Page wrapper:**
```
<div className="flex flex-col gap-6">
```

**Page header block:**
```
<header>
  <h1 className="text-primary text-2xl font-bold tracking-tight">{t(...)}</h1>
  <p className="text-muted mt-1">{t(...)}</p>
</header>
```
When the header has a right-side action (e.g. view toggle):
```
<div className="flex items-start justify-between gap-4">
  <div> {/* h1 + p */} </div>
  {/* action */}
</div>
```

**KPI / stat grid:**
```
grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3
```

**Auto-fill card grid (queue cards):**
```
grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4
```

**Report / fixed-column card grid:**
```
grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3
```

**List of items (edit-request queue):**
```
<ul className="flex flex-col gap-3">
```

**Search + filter bar:**
```
<div className="flex flex-wrap items-center gap-3">
  <div className="relative min-w-48 flex-1"> {/* Input with icon */} </div>
  {/* Tabs or pill filters */}
</div>
```
Search icon position: `pointer-events-none absolute top-1/2 left-3 -translate-y-1/2`; Input gets `className="pl-9"`.

**Empty state:**
```
<div className="flex flex-col items-center gap-3 py-14 text-center">
  <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
    <IconName size={22} color="currentColor" className="text-muted" />
  </span>
  <p className="text-muted text-sm">{t("...")}</p>
</div>
```

**Card action footer:**
```
<div className="border-t border-border bg-bg-ghostwhite flex items-center justify-end gap-2 px-4 py-2.5">
  <Button variant="tertiary" size="sm" className="text-danger"> … </Button>
  <Button variant="primary" size="sm"> … </Button>
</div>
```

**Pending banner:**
```
{/* primary */}
<div className="bg-primary/8 border-primary/20 flex items-center gap-2 rounded-xl border px-4 py-2.5">
  <span className="text-primary text-sm font-medium">{t(...)}</span>
</div>

{/* warning */}
<div className="bg-warning/10 border-warning/30 flex items-center gap-2 rounded-xl border px-4 py-2.5">
  <span className="text-warning text-sm font-medium">{t(...)}</span>
</div>
```

**Table:**
```
{/* container */}
<div className="border-border overflow-hidden rounded-xl border">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-bg-ghostwhite border-b border-border">
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">…</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border last:border-0 transition-colors hover:bg-bg-ghostwhite">
        <td className="px-4 py-3">…</td>
      </tr>
    </tbody>
  </table>
</div>
```
For complex tables use the `<Table>` wrapper from `@/ui` instead of a raw `<table>`.

---

### All components go through `src/ui/`

Available wrappers (from `src/ui/index.ts`):
`Button`, `Input`, `TextArea`, `Card`, `Select`, `Chip`, `StatusChip`, `Skeleton`, `Reveal`,
`Form`, `Label`, `Avatar`, `Spinner`, `Separator`, `Link`, `Dropdown`, `Tabs`, `Modal`,
`AlertDialog`, `Table`, `Pagination`, `PasswordInput`, `SearchField`, `RatingBadge`,
`RatingInline`, `PriceTag`, `NumberStepper`, `RangeSlider`, `Switch`, `DatePicker`,
`Autocomplete`, `ConfirmDialog` / `useConfirm`.

Rules:
- **No raw `@heroui/react` import in feature code.** Use the wrapper.
- If a style variation doesn't exist yet, **add a named variant to the wrapper** and use that —
  never one-off it on the page.
- Before building a new component, check `src/ui/` first. Extend an existing wrapper rather than
  creating a parallel component.

---

### Quick reference

| Concern | Token / class | Notes |
|---|---|---|
| Card background | `bg-surface` | All cards and panels |
| Table/footer bg | `bg-bg-ghostwhite` | Headers, footers, toggles |
| Card shadow | `shadow-primary` | Every `bg-surface` card |
| Card border | `border border-border` | Standard card edge |
| Page title | `text-primary text-2xl font-bold tracking-tight` | h1 on every page |
| Subtitle | `text-muted mt-1` | p after h1 |
| KPI value | `text-primary text-3xl font-bold tracking-tight` | Dashboard StatCard |
| Section heading | `text-primary font-semibold tracking-tight` | Panel h3 |
| Card radius | `rounded-2xl` | All cards |
| Icon badge (lg) | `h-9 w-9 rounded-xl` | With status tint bg |
| Icon badge (sm) | `h-7 w-7 rounded-lg` | With status tint bg |
| Empty-state icon | `h-12 w-12 rounded-full bg-muted/10` | Every empty state |
| Page gap | `flex flex-col gap-6` | Top-level page wrapper |
| Card padding | `p-4` (queue) · `p-5` (dashboard) | Consistent per type |
