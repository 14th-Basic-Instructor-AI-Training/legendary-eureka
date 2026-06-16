import type { PageParams } from "./client";

// ── Enums (backend casing) ────────────────────────────────────────────────────

/** Mirrors `NotificationType` on the backend. */
export type NotificationTypeWire =
  | "BOOKING_REQUESTED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "BOOKING_COMPLETED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "COMMENT_REPLY"
  | "REVIEW_REPLY"
  | "REPORT_UPDATE"
  | "AGENCY_STATUS"
  | "EDIT_REQUEST_UPDATE"
  | "SYSTEM";

/** Mirrors `NotificationCategory` on the backend. */
export type NotificationCategoryWire =
  | "BOOKINGS"
  | "TRIP_PLANS"
  | "COMMENTS"
  | "REPORTS"
  | "SYSTEM";

// ── Response types ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  type: NotificationTypeWire;
  category: NotificationCategoryWire;
  title: string;
  body: string;
  /** Locale-relative path the card opens (e.g. `/traveler/bookings/{id}`). */
  targetHref: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCountsResponse {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}

export interface MarkReadResponse {
  markedCount: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface NotificationListParams extends PageParams {
  category?: NotificationCategoryWire;
  unreadOnly?: boolean;
}
