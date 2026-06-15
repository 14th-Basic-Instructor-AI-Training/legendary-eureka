import { create } from "zustand";
import { initialNotifications } from "./data";
import type { Notification } from "./schema";

/**
 * Notifications inbox store. Holds the mutable read-state for the session. There
 * is no notifications action in the permissions matrix — access is gated by the
 * `(traveler)` route group — so mutations are role-agnostic here; the real
 * backend will scope notifications to the authenticated user server-side.
 */
interface NotificationsState {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: initialNotifications(),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.read ? n : { ...n, read: true },
      ),
    })),
}));
