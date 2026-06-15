/**
 * Locale-aware formatting. Maps Jalat's i18next locale codes (en/kh/kr) to BCP-47
 * Intl locales so prices, numbers, and ratings render with the right numerals and
 * conventions (Khmer numerals, Korean grouping, etc.). Never format with hardcoded
 * Latin assumptions — route through here.
 */
const INTL_LOCALE: Record<string, string> = {
  en: "en-US",
  kh: "km-KH",
  kr: "ko-KR",
};

export function intlLocale(lng: string): string {
  return INTL_LOCALE[lng] ?? "en-US";
}

export function formatPrice(
  amount: number,
  currency: string,
  lng: string,
): string {
  return new Intl.NumberFormat(intlLocale(lng), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, lng: string): string {
  return new Intl.NumberFormat(intlLocale(lng)).format(value);
}

export function formatRating(value: number, lng: string): string {
  return new Intl.NumberFormat(intlLocale(lng), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

<<<<<<< HEAD
/** Locale-aware short date (e.g. "Jun 15, 2026") from an ISO timestamp. */
export function formatDate(iso: string, lng: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale(lng), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
=======
export function formatDate(value: string | number | Date, lng: string): string {
  return new Intl.DateTimeFormat(intlLocale(lng), {
    dateStyle: "medium",
  }).format(new Date(value));
}

/**
 * Locale-aware relative time ("2 hours ago", "il y a 3 jours"). Picks the
 * largest sensible unit. Used by feeds/notifications where an absolute date is
 * less useful than recency.
 */
export function formatRelativeTime(
  value: string | number | Date,
  lng: string,
): string {
  const then = new Date(value).getTime();
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lng), { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (abs >= secs) return rtf.format(Math.round(diffSec / secs), unit);
  }
  return rtf.format(diffSec, "second");
>>>>>>> 2d673ed7538579d7af67789c239619f46f219203
}
