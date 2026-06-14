import type { NextAuthConfig } from "next-auth";

// Locale list duplicated here (not imported from lib/locales.ts) to keep this
// file free of any non-edge-safe imports — it runs in the middleware Edge Runtime.
const LOCALES = ["en", "kh", "kr"] as const;

/** Routes that require auth and a specific role (locale prefix is stripped first). */
const PROTECTED: Array<{ prefix: string; role: string }> = [
  { prefix: "/agency", role: "agency" },
  { prefix: "/admin", role: "admin" },
  { prefix: "/traveler", role: "traveler" },
];

function getLocale(pathname: string): string {
  return LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? "en";
}

function getBasePath(pathname: string): string {
  const locale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  return locale ? pathname.slice(locale.length + 1) || "/" : pathname;
}

/**
 * Shared Auth.js config — safe for the Edge Runtime (no Credentials provider,
 * no Node.js-only APIs). Spread into auth.ts and imported by middleware.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const basePath = getBasePath(pathname);
      const locale = getLocale(pathname);

      const rule = PROTECTED.find(
        (r) => basePath === r.prefix || basePath.startsWith(`${r.prefix}/`),
      );

      if (rule) {
        if (!session?.user) {
          return Response.redirect(
            new URL(`/${locale}/login`, request.nextUrl.origin),
          );
        }
        // Session type is augmented in auth.ts — cast to read the role field.
        const sessionRole = (session as unknown as Record<string, unknown>).role as string | undefined;
        if (sessionRole !== rule.role) {
          // Wrong role → send to the landing page for that locale.
          return Response.redirect(new URL(`/${locale}`, request.nextUrl.origin));
        }
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, unknown>;
        token.accessToken = u.accessToken as string;
        token.refreshToken = u.refreshToken as string;
        token.role = u.role as string;
        token.userId = user.id as string;
      }
      return token;
    },

    session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        role: token.role as string,
        user: {
          ...session.user,
          id: token.userId as string,
        },
      };
    },
  },

  // Providers are added in auth.ts (Node runtime only).
  providers: [],
};
