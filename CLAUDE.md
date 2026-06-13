@AGENTS.md

# Destination UI — System Overview & Role Features

Destination is a travel platform connecting travelers with tour agencies across Cambodia. It supports content discovery, tour booking, trip planning, and platform administration.

## Roles

The system has four roles. Auth state determines role: unauthenticated users are Guests; authenticated users are Travelers, Tour Agencies, or Admins.
****
| Role | Color Token | Auth Required |
|------|------------|---------------|
| Admin | `#042C53` | Yes |
| Tour Agency | `#185FA5` | Yes |
| Traveler | `#1F9E75` | Yes |
| Guest | — | No |

---

## Role: Admin

Full system control. Admins manage users, moderate content, investigate reports, and configure the platform.

### User Management
- View all users (agencies, travelers)
- Approve / Reject agency registrations
- Suspend / Ban users
- View user activity logs

### Content Management
- Edit / Delete any activity
- Approve agency edit requests
- Remove inappropriate content
- Manage tour packages

### Reports & Monitoring
- View reported agencies
- Investigate complaints
- View platform analytics
- Monitor bookings & revenue

### System Settings
- Configure platform settings
- Manage categories / types
- Set commission rates
- View system health

---

## Role: Tour Agency

Creates and manages travel content and handles incoming booking requests from travelers.

### Activity Management
- Create destinations / places
- Create things to do
- Create restaurants / food
- Create accommodations
- Edit own activities
- Request admin to edit (for locked content)
- Set pricing & images

### Tour Package Creation
- Create tour packages
- Build detailed itineraries
- Set day-by-day agenda
- Include activities in packages
- Publish / Archive packages

### Booking Management
- View booking requests
- Approve / Reject requests
- View booking details
- Access booking history
- Receive notifications

### Profile & Communication
- Edit agency profile
- Display contact info
- Show location on map
- View own ratings / reviews
- See traveler feedback

---

## Role: Traveler

Authenticated users who discover content, plan personal trips, and book tours.

### Discovery
- Browse newsfeed
- Search by province & activity type
- View trending places
- View top-rated packages
- View agency profiles

### Trip Planning
- Create personal trip plans
- Share trip plans publicly
- View others' public trips
- Bookmark places / activities

### Tour Booking
- Request / Register for tours
- Cancel booking requests
- View booking status
- View booking history
- Make online payments

### Engagement & Safety
- Rate & review activities
- Leave comments / suggestions
- Report agencies
- Receive notifications
- Edit personal profile

---

## Role: Guest

Unauthenticated visitors. Read-only discovery only — no booking, planning, reviewing, or reporting.

- Browse newsfeed
- Search by province & type
- View trending places
- View top-rated packages
- View agency profiles

---

## Permissions Matrix

| Feature / Module        | Admin | Agency | Traveler | Guest |
|-------------------------|:-----:|:------:|:--------:|:-----:|
| Newsfeed Access         | ✓     | ✓      | ✓        | ✓     |
| Create Activities       | ✓     | ✓      | ✗        | ✗     |
| Edit Activities         | ✓     | ✓      | ✗        | ✗     |
| Create Tour Packages    | ✓     | ✓      | ✗        | ✗     |
| Book / Request Tours    | ✗     | ✗      | ✓        | ✗     |
| Approve Bookings        | ✓     | ✓      | ✗        | ✗     |
| Create Trip Plans       | ✗     | ✗      | ✓        | ✗     |
| Rate & Review           | ✗     | ✗      | ✓        | ✗     |
| Report Agencies         | ✗     | ✗      | ✓        | ✗     |
| Manage Users            | ✓     | ✗      | ✗        | ✗     |
| Approve Edit Requests   | ✓     | ✗      | ✗        | ✗     |
| View Analytics          | ✓     | ✗      | ✗        | ✗     |
| Make Payments           | ✗     | ✓      | ✓        | ✗     |

---

## Frontend Implementation Notes

### Auth & Route Guards (`middleware.ts`)
- `/admin/*` — Admin only
- `/agency/*` — Tour Agency only
- `/traveler/*` — Traveler only
- `/auth/*` — Guest only (redirect authenticated users away)
- All other routes — publicly accessible (Guest + all roles)

### Conditional UI Rendering
Hide/show controls based on role rather than rendering separate pages where possible:

```ts
// Example pattern
const { role } = useAuth() // 'admin' | 'agency' | 'traveler' | 'guest'

{role === 'agency' && <CreateActivityButton />}
{role === 'traveler' && <BookTourButton />}
{(role === 'admin' || role === 'agency') && <ApproveBookingButton />}
```

### Unauthenticated State
`role === 'guest'` means no session. Discovery pages render fully; any action that requires auth should prompt login (not a hard redirect).

### Role Color Tokens
Use these consistently across badges, headers, and role indicators:
- Admin: `#042C53`
- Tour Agency: `#185FA5`
- Traveler / success states: `#1F9E75`
