"use client";

import { useEffect, useMemo } from "react";
import {
  useKnockClient,
  useNotifications,
  useNotificationStore,
} from "@knocklabs/react";
import { KNOCK_FEED_CHANNEL_ID } from "./knock-config";
import type {
  Notification,
  NotificationCategory,
  NotificationType,
} from "./schema";

/**
 * Knock-backed data source for the notifications inbox. Wraps the headless
 * `@knocklabs/react` hooks and maps each Knock `FeedItem` onto our `Notification`
 * schema so the existing inbox components render unchanged. Real-time updates and
 * read-state are handled by the Knock feed store. Must be rendered inside
 * `<KnockProvider>` (mounted by `KnockProviders` for authenticated users).
 */

/** Minimal shape of a Knock feed item we rely on (rich mode). */
interface KnockFeedItem {
  id: string;
  inserted_at: string;
  read_at: string | null;
  source?: { key?: string };
  data?: Record<string, unknown> | null;
}

/**
 * Map a Knock workflow key → our card type + filter category. The backend
 * triggers exactly these five workflows; anything unmapped renders as "system".
 */
const WORKFLOW_META: Record<
  string,
  { type: NotificationType; category: NotificationCategory }
> = {
  "booking-approved": { type: "booking-approved", category: "bookings" },
  "booking-rejected": { type: "booking-rejected", category: "bookings" },
  // No dedicated "cancelled" card type — reuse the rejected (red) visual.
  "booking-cancelled": { type: "booking-rejected", category: "bookings" },
  "agency-status": { type: "system", category: "system" },
  "report-update": { type: "report-update", category: "reports" },
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNotification(item: KnockFeedItem): Notification {
  const meta = WORKFLOW_META[item.source?.key ?? ""] ?? {
    type: "system" as const,
    category: "system" as const,
  };
  const data = item.data ?? {};
  return {
    id: item.id,
    type: meta.type,
    category: meta.category,
    // The backend sends title/body/targetHref in the trigger `data`.
    title: str(data.title),
    body: str(data.body),
    createdAt: item.inserted_at,
    read: item.read_at != null,
    targetHref: str(data.targetHref),
  };
}

export interface NotificationsData {
  notifications: Notification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export function useKnockFeed(): NotificationsData {
  const knockClient = useKnockClient();
  const feedClient = useNotifications(knockClient, KNOCK_FEED_CHANNEL_ID, {
    mode: "rich",
  });
  const { items, metadata } = useNotificationStore(feedClient);

  useEffect(() => {
    void feedClient.fetch();
  }, [feedClient]);

  const notifications = useMemo(
    () => (items as KnockFeedItem[]).map(toNotification),
    [items],
  );

  const markRead = (id: string) => {
    const raw = items.find((i) => i.id === id);
    if (raw) void feedClient.markAsRead(raw);
  };

  const markAllRead = () => {
    void feedClient.markAllAsRead();
  };

  return {
    notifications,
    unread: metadata?.unread_count ?? 0,
    markRead,
    markAllRead,
  };
}
