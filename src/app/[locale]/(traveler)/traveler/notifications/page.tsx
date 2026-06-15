import { NotificationsScreen } from "@/features/notifications/components/NotificationsScreen";

/**
 * Notifications inbox (`/[locale]/traveler/notifications`). Traveler-only — the
 * `(traveler)` shell guards the role. Thin: composes the feature screen, which
 * reads from the notifications store.
 */
export default function NotificationsPage() {
  return <NotificationsScreen />;
}
