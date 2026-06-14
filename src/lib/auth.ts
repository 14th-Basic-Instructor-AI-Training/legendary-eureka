"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import type { Role } from "@/features/auth/schema";
import { homePathFor } from "@/lib/permissions";
import { localePath, useLocale } from "@/lib/locale";

/** Read the current mock session. Mirrors the shape a real Auth.js session will expose. */
export function useSession() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    hasHydrated,
  };
}

/**
 * Client route guard. Once the session has hydrated:
 *  - no user            → redirect to /login
 *  - wrong role         → redirect to that user's own dashboard
 * Returns `ready` so the page can hold rendering until the check passes.
 */
export function useRequireRole(role: Role) {
  const { user, hasHydrated } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace(localePath(locale, "/login"));
    } else if (user.role !== role) {
      router.replace(localePath(locale, homePathFor(user.role)));
    }
  }, [user, hasHydrated, role, router, locale]);

  return { ready: hasHydrated && user?.role === role, user };
}
