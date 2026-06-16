import { clientApiFetch, type PagedData } from "@/lib/api/client";
import type {
  MarkReadResponse,
  NotificationCategoryWire,
  NotificationCountsResponse,
  NotificationListParams,
  NotificationResponse,
} from "@/lib/api/notifications";

/**
 * Notification inbox API — the traveler/agency in-app feed backed by the
 * `/notifications` endpoints. These run from client components (the header bell
 * and the inbox screen), so they use `clientApiFetch` (browser session token).
 * The backend scopes every row to the authenticated user.
 */

export function listNotifications(
  params?: NotificationListParams,
): Promise<PagedData<NotificationResponse>> {
  return clientApiFetch("/notifications", { params });
}

export function getNotificationCounts(): Promise<NotificationCountsResponse> {
  return clientApiFetch("/notifications/counts");
}

export function markNotificationRead(id: string): Promise<NotificationResponse> {
  return clientApiFetch(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead(
  category?: NotificationCategoryWire,
): Promise<MarkReadResponse> {
  return clientApiFetch("/notifications/read-all", {
    method: "PUT",
    params: category ? { category } : undefined,
  });
}

export function deleteNotification(id: string): Promise<void> {
  return clientApiFetch(`/notifications/${id}`, { method: "DELETE" });
}
