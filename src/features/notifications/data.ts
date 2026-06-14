import { NOTIFICATIONS } from "./fixtures";
import type { Notification } from "./schema";

/**
 * The ONE data seam for notifications. The read-only getter exercises
 * loading/error in the static phase; the inbox's mutable read-state is seeded
 * into the Zustand store via `initialNotifications()`. Swapping for Knock /
 * route handlers later is a one-file change.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getNotifications(): Promise<Result<Notification[]>> {
  await delay();
  return { ok: true, data: NOTIFICATIONS };
}

/** Seed the store (newest first). Never read fixtures in components. */
export function initialNotifications(): Notification[] {
  return [...NOTIFICATIONS].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
