"use client";

import { useEffect, useRef } from "react";
import { onRealtime } from "./realtime";

/**
 * Refetch a resource when a realtime event fires. Gives instant cross-browser
 * updates (e.g. an admin publish/archive/delete → the explore + landing pages
 * refetch live, no user interaction required).
 *
 * `reload` may change identity each render; the latest is always used via a ref,
 * so the subscription is set up once.
 */
export function useRealtimeReload(
  event: string | ((event: string) => boolean),
  reload: () => void,
): void {
  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    return onRealtime(event, () => reloadRef.current());
    // `event` is a stable tag/predicate from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
