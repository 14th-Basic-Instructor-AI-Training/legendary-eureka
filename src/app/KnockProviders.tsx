"use client";

import { useCallback, useEffect, useState } from "react";
import { KnockProvider } from "@knocklabs/react";
import { useSession } from "@/lib/auth";
import { clientApiFetch } from "@/lib/api/client";
import {
  KNOCK_ENABLED,
  KNOCK_ENHANCED_SECURITY,
  KNOCK_PUBLIC_API_KEY,
} from "@/features/notifications/knock-config";

/**
 * Mounts the Knock client for the signed-in user so any client component can read
 * their in-app feed. No-ops (renders children straight through) when Knock isn't
 * configured or there's no authenticated user — guests never initialize Knock.
 *
 * Must live inside <SessionProvider> so `useSession()` resolves. The user id here
 * must match the id the backend triggers Knock with (the user's UUID), which
 * Auth.js exposes as `session.user.id`.
 *
 * When `KNOCK_ENHANCED_SECURITY` is on, a backend-signed `userToken` (from
 * `/notifications/knock-token`) is required: we wait for it before mounting so
 * the first feed request is authenticated, and refresh it via
 * `onUserTokenExpiring`. In dev mode the public key alone is used.
 */
export function KnockProviders({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const userId = user?.id;

  const fetchToken = useCallback(async (): Promise<string | null> => {
    try {
      const data = await clientApiFetch<{ token: string | null }>(
        "/notifications/knock-token",
      );
      return data?.token ?? null;
    } catch {
      return null;
    }
  }, []);

  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    if (!KNOCK_ENABLED || !userId || !KNOCK_ENHANCED_SECURITY) return;
    let active = true;
    void fetchToken().then((t) => {
      if (active) {
        setToken(t);
        setTokenLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [userId, fetchToken]);

  if (!KNOCK_ENABLED || !userId) {
    return <>{children}</>;
  }

  // Enhanced security: hold off mounting until the signed token resolves so the
  // first request carries it. The feed simply isn't active during this brief wait.
  if (KNOCK_ENHANCED_SECURITY && !tokenLoaded) {
    return <>{children}</>;
  }

  return (
    <KnockProvider
      apiKey={KNOCK_PUBLIC_API_KEY}
      user={{ id: userId }}
      userToken={KNOCK_ENHANCED_SECURITY ? (token ?? undefined) : undefined}
      onUserTokenExpiring={
        KNOCK_ENHANCED_SECURITY
          ? async () => (await fetchToken()) ?? ""
          : undefined
      }
    >
      {children}
    </KnockProvider>
  );
}
