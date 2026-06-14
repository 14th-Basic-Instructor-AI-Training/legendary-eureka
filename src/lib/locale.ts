"use client";

import { useParams, useRouter } from "next/navigation";
import { LOCALES, type Locale } from "./i18n";

/** The active locale from the `[locale]` route segment (falls back to en). */
export function useLocale(): Locale {
  const params = useParams();
  const raw = params?.locale;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return LOCALES.includes(value as Locale) ? (value as Locale) : "en";
}

/** Persist the chosen locale so unprefixed visits (and middleware) honor it. */
export function persistLocaleCookie(locale: string): void {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Prefix a logical app path with a locale. External URLs pass through unchanged. */
export function localePath(locale: string, path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith("#")) return path;
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Router wrapper that keeps navigation inside the active locale. Use instead of
 * `useRouter` for in-app navigation so links never drop the `/[locale]` prefix.
 */
export function useLocalizedRouter() {
  const router = useRouter();
  const locale = useLocale();
  return {
    push: (path: string) => router.push(localePath(locale, path)),
    replace: (path: string) => router.replace(localePath(locale, path)),
  };
}
