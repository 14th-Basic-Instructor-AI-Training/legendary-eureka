import type {
  NotificationCategoryWire,
  NotificationResponse,
  NotificationTypeWire,
} from "@/lib/api/notifications";
import type {
  Notification,
  NotificationCategory,
  NotificationType,
} from "./schema";

/**
 * Map the backend notification read-model onto the feature's `Notification`
 * schema so the inbox/bell render unchanged regardless of the data source
 * (REST inbox here, Knock feed in `useKnockFeed`). Backend enums are
 * UPPER_SNAKE; the UI uses kebab `type` (drives the card icon) and camel
 * `category` (drives the filter tabs).
 */

const TYPE_MAP: Record<NotificationTypeWire, NotificationType> = {
  BOOKING_REQUESTED: "booking-requested",
  BOOKING_APPROVED: "booking-approved",
  BOOKING_REJECTED: "booking-rejected",
  BOOKING_COMPLETED: "booking-completed",
  BOOKING_CANCELLED: "booking-cancelled",
  BOOKING_REMINDER: "reminder",
  COMMENT_REPLY: "comment",
  REVIEW_REPLY: "reply",
  REPORT_UPDATE: "report-update",
  AGENCY_STATUS: "system",
  EDIT_REQUEST_UPDATE: "system",
  SYSTEM: "system",
};

const CATEGORY_MAP: Record<NotificationCategoryWire, NotificationCategory> = {
  BOOKINGS: "bookings",
  TRIP_PLANS: "tripPlans",
  COMMENTS: "comments",
  REPORTS: "reports",
  SYSTEM: "system",
};

export function notificationResponseToNotification(
  r: NotificationResponse,
): Notification {
  return {
    id: r.id,
    type: TYPE_MAP[r.type] ?? "system",
    category: CATEGORY_MAP[r.category] ?? "system",
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    read: r.read,
    targetHref: r.targetHref ?? "",
  };
}
