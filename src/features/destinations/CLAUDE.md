# Feature: destinations

The "best places" data backbone shared across the landing page and destination detail pages.

## Routes

| Page | Path |
|---|---|
| Destination detail | `/[locale]/destinations/[slug]` |

The landing page (`/[locale]`) also heavily consumes this feature's data via `features/landing`.

## Landing page

`features/landing` composes the home page (trip.com-style, open to all roles including guests). Scroll-triggered **Framer Motion** reveals use the `@/ui` `Reveal` component. Signed-in travelers and agencies see a personalized "Recommended for you" row; guests see the standard public list.

`features/destinations` is the shared data backbone — landing imports from `features/destinations/data.ts`, not from its own fixtures.

## LocationMap

`features/destinations/components/detail/LocationMap.tsx` — **MapLibre GL JS** (`maplibre-gl`) 3D map showing the destination pin. No API key required.

Key notes:
- Client-only component (`"use client"`); wrap with `next/dynamic` and `{ ssr: false }`.
- Uses the free demo tile source for the static UI phase.

## Data

`features/destinations/data.ts` is the **single source** for destination mock data. Both `features/landing` and the destination detail page import from here — never duplicate fixtures elsewhere.
