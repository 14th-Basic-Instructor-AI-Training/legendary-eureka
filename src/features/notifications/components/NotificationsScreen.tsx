"use client";

import { KNOCK_ENABLED } from "../knock-config";
import { useKnockFeed } from "../useKnockFeed";
import { useApiInbox } from "../useApiInbox";
import { NotificationsInbox } from "./NotificationsInbox";

/**
 * Traveler notifications inbox. Picks its data source at the top level so hooks
 * are called unconditionally:
 *  - Knock configured  → live feed via `useKnockFeed` (real-time + read-state)
 *  - otherwise         → the REST inbox via `useApiInbox` (`/notifications`)
 *
 * `KNOCK_ENABLED` is a build-time constant, so exactly one branch component
 * mounts per build and the rules of hooks are respected.
 */
export function NotificationsScreen() {
  return KNOCK_ENABLED ? <KnockInbox /> : <ApiInbox />;
}

function KnockInbox() {
  const data = useKnockFeed();
  return <NotificationsInbox {...data} />;
}

function ApiInbox() {
  const data = useApiInbox();
  return <NotificationsInbox {...data} />;
}
