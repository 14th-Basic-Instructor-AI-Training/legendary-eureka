# Feature: booking

Handles the traveler booking request flow and booking history.

## Routes

| Page | Path |
|---|---|
| Book a tour | `/[locale]/traveler/booking/[tourId]` |
| Booking history list | `/[locale]/traveler/bookings` |
| Booking detail | `/[locale]/traveler/bookings/[bookingId]` |

## Full lifecycle

```
Traveler submits request      → status: pending
Agency approves               → status: confirmed
Agency rejects                → status: rejected
Trip runs (confirmed date)    → status: completed
  └─ Traveler can now rate & comment on each activity and service
Traveler cancels (pre-confirm)→ status: cancelled
```

Status values: `pending` | `confirmed` | `rejected` | `completed` | `cancelled`

Render status with `<StatusChip status={booking.status} />` — it reads localized labels from `status.*` i18n keys.

## Permissions

| Action | Who |
|---|---|
| Submit booking request | Traveler only (`can(actor, 'bookTours')`) |
| Cancel pending request | Traveler only |
| Approve / Reject | Agency + Admin |
| Rate & review after completion | Traveler only |

## Store

`features/booking/store.ts` (Zustand) holds in-progress booking state and history. Every transition action re-checks `can(actor, action)` before mutating.

## Illegal transitions

Travelers cannot approve their own bookings; agencies cannot book tours. Illegal transitions are caught by the state machine and surfaced as a localized "not allowed" message — never silently ignored or partially rendered.
