"use client";

import { useNotificationsStore } from "../store";
import { KNOCK_ENABLED } from "../knock-config";
import { useKnockFeed } from "../useKnockFeed";
import { NotificationsInbox } from "./NotificationsInbox";

/**
 * Traveler notifications inbox. Picks its data source at the top level so hooks
 * are called unconditionally:
 *  - Knock configured  → live feed via `useKnockFeed` (real-time + read-state)
 *  - otherwise         → local fixture store (dev/no-Knock fallback)
 *
 * `KNOCK_ENABLED` is a build-time constant, so exactly one branch component
 * mounts per build and the rules of hooks are respected.
 */
export function NotificationsScreen() {
  return KNOCK_ENABLED ? <KnockInbox /> : <StoreInbox />;
}

function KnockInbox() {
  const data = useKnockFeed();
  return <NotificationsInbox {...data} />;
}

function StoreInbox() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsInbox
      notifications={notifications}
      unread={unread}
      markRead={markRead}
      markAllRead={markAllRead}
    />
  );
}
