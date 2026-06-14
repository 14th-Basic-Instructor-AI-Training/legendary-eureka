import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "kh", "kr"] as const;
const DEFAULT_LOCALE = "en";

/**
 * Locale routing: every page lives under `/[locale]/…`. Requests without a
 * locale prefix are redirected to one — preferring the visitor's saved
 * `NEXT_LOCALE` cookie, otherwise the default (en).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = LOCALES.includes(cookie as (typeof LOCALES)[number])
    ? cookie
    : DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, and any file with an extension (favicon, etc.).
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
