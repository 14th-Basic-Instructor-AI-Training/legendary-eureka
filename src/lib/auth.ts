"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/features/auth/schema";
import { homePathFor } from "@/lib/permissions";
import { localePath, useLocale } from "@/lib/locale";

/**
 * Read the current Auth.js session. Returns the same shape as the former
 * mock session so callers don't need to change.
 */
export function useSession() {
  const { data: session, status } = useNextAuthSession();

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.role as Role,
      }
    : null;

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: status === "authenticated",
    /** True once the session has resolved (loading is false). */
    hasHydrated: status !== "loading",
  };
}

/**
 * Client route guard. Once the session is resolved:
 *  - no user        → redirect to /login
 *  - wrong role     → redirect to that role's own home
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
