"use client";

import { useEffect, useState } from "react";

/** Anything a `data.ts` getter returns: a tagged success/failure result. */
export type Loadable<T> = { ok: true; data: T } | { ok: false };

export type ResourceStatus = "loading" | "success" | "error";

export interface ResourceState<T> {
  status: ResourceStatus;
  data: T | null;
  reload: () => void;
}

/**
 * Generic loader for any `data.ts` getter. Tracks loading / success / error so
 * every screen can render all three states (per error-handling rules), and
 * exposes `reload()` for an error-state retry. Pass a stable (module-level)
 * fetcher; cancellation guards against state-after-unmount.
 */
export function useResource<T>(fetcher: () => Promise<Loadable<T>>): ResourceState<T> {
  const [state, setState] = useState<{ status: ResourceStatus; data: T | null }>({
    status: "loading",
    data: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    fetcher().then((res) => {
      if (!active) return;
      setState(
        res.ok
          ? { status: "success", data: res.data }
          : { status: "error", data: null },
      );
    });
    return () => {
      active = false;
    };
  }, [fetcher, nonce]);

  const reload = () => {
    setState({ status: "loading", data: null });
    setNonce((n) => n + 1);
  };

  return { ...state, reload };
}
