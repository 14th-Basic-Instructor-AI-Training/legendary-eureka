/**
 * Public type surface for the traveler feature. The Zod schemas in `schema.ts`
 * stay the source of truth; these are the inferred types other modules import.
 */
export type {
  BadgeLevel,
  TravelerStats,
  TravelerProfile,
  Visibility,
  TripPlan,
  Bookmark,
  BookmarkKind,
  BookingStatus,
  RefundStatus,
  BookingHistory,
  BookingSegment,
  MyReview,
  ActivityKind,
  ActivityItem,
  PersonalInfoInput,
  PersonalInfoFormValues,
  PasswordChangeInput,
  NotificationPrefs,
  NotificationEvent,
  PrivacySettings,
} from "./schema";
