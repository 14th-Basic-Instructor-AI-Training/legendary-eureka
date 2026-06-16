import { NotificationsScreen } from "@/features/notifications/components/NotificationsScreen";

/**
 * Agency notifications inbox (`/[locale]/agency/notifications`). Agency-only — the
 * `(agency)` shell guards the role. Reuses the shared, data-source-agnostic
 * notifications screen; the Knock feed is scoped to the signed-in agency user.
 */
export default function AgencyNotificationsPage() {
  return <NotificationsScreen />;
}
