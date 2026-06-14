import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// auth() from authConfig (no providers = edge-safe) wraps the middleware so
// the authorized callback runs first (handles route protection + role checks).
const { auth } = NextAuth(authConfig);

const LOCALES = ["en", "kh", "kr"] as const;
const DEFAULT_LOCALE = "en";

/**
 * Combined middleware:
 *  1. The `auth` wrapper runs the `authorized` callback (see auth.config.ts) to
 *     protect /agency, /admin, and /traveler routes by role.
 *  2. The function body handles locale routing — every public page lives under
 *     /[locale]/… so unprefixed paths are redirected to a locale.
 */
export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (hasLocale) return NextResponse.next();

  // Redirect to the visitor's saved locale (cookie), falling back to the default.
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = LOCALES.includes(cookie as (typeof LOCALES)[number])
    ? cookie
    : DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
});

export const config = {
  // Skip Next internals, API routes, and any file with an extension (favicon, etc.).
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
