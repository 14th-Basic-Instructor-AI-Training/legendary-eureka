import { beforeEach, describe, expect, it } from "vitest";
import { initialNotifications } from "./data";
import { useNotificationsStore } from "./store";

const reset = () =>
  useNotificationsStore.setState({ notifications: initialNotifications() });
const get = () => useNotificationsStore.getState();
const unread = () => get().notifications.filter((n) => !n.read).length;

describe("notifications store", () => {
  beforeEach(reset);

  it("seeds with at least one unread notification", () => {
    expect(unread()).toBeGreaterThan(0);
  });

  it("marks a single notification read", () => {
    const target = get().notifications.find((n) => !n.read)!;
    const before = unread();
    get().markRead(target.id);
    expect(get().notifications.find((n) => n.id === target.id)?.read).toBe(
      true,
    );
    expect(unread()).toBe(before - 1);
  });

  it("marking an already-read notification is a no-op for the unread count", () => {
    const read = get().notifications.find((n) => n.read)!;
    const before = unread();
    get().markRead(read.id);
    expect(unread()).toBe(before);
  });

  it("marks all notifications read", () => {
    get().markAllRead();
    expect(unread()).toBe(0);
  });
});
