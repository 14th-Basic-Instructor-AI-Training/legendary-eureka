"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications.service";
import { notificationResponseToNotification } from "./mappers";
import type { Notification } from "./schema";
import type { NotificationsData } from "./useKnockFeed";

/**
 * REST-backed data source for the notifications inbox + header bell — the
 * default when Knock isn't configured. Fetches the authenticated user's inbox
 * from `/notifications`, then exposes the same `NotificationsData` shape as
 * `useKnockFeed` so the bell and inbox components are source-agnostic.
 *
 * Read-state is updated optimistically and persisted via the API; a failed call
 * (e.g. an unauthenticated guest header) degrades to an empty inbox instead of
 * crashing.
 */

const PAGE_SIZE = 50;

export function useApiInbox(): NotificationsData {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;
    listNotifications({ size: PAGE_SIZE })
      .then((page) => {
        if (active) {
          setNotifications(page.content.map(notificationResponseToNotification));
        }
      })
      .catch(() => {
        if (active) setNotifications([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    void markNotificationRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
    void markAllNotificationsRead().catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return { notifications, unread, markRead, markAllRead };
}
