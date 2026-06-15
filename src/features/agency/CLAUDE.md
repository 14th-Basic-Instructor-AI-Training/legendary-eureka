# Feature: agency

The Tour Agency workspace — booking management, activity authoring, and package creation.

## Routes

| Page | Path |
|---|---|
| Dashboard | `/[locale]/agency/dashboard` |
| Booking requests | `/[locale]/agency/bookings` |
| Activities | `/[locale]/agency/activities` |
| Packages | `/[locale]/agency/packages` |
| Tours | `/[locale]/agency/tours` |
| Calendar | `/[locale]/agency/calendar` |
| Profile | `/[locale]/agency/profile` |

## Store

`features/agency/store.ts` (Zustand) handles permission-checked state transitions. Every action calls `can(actor, action)` from `lib/permissions.ts` before mutating:

- **Booking approve / reject**: `can(actor, 'approveBookings')`
- **Activity create**: `can(actor, 'createActivities')`
- **Activity edit**: `can(actor, 'editActivities')`
- **Edit request submit**: `can(actor, 'requestEdit')`

Never rely on UI visibility alone as the authorization gate — the store is the second layer.

## Activity authoring flow

1. Agency creates a **draft** activity (destination, thing-to-do, restaurant, or accommodation).
2. Agency edits the draft freely before publishing.
3. Once published, direct edits are locked — the agency files an **edit request** instead.
4. Admin reviews the request in `/admin/requests` and approves or rejects it.
5. Admin can always edit any activity directly at any time.

## Booking lifecycle (agency side)

Traveler submits a booking request → appears in `/agency/bookings` as `pending` → agency approves or rejects → status propagates to the traveler's booking history. Full lifecycle detail: `src/features/booking/CLAUDE.md`.
