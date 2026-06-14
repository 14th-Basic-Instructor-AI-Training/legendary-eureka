/**
 * Pure locale constants — no side effects, safe to import from Server Components,
 * middleware, and client code alike. (The i18next instance in `i18n.ts` has an
 * init side effect and must NOT be imported server-side.)
 */
export const LOCALES = ["en", "kh", "kr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
