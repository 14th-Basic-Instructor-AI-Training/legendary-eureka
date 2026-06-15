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

export function formatPrice(amount: number, currency: string, lng: string): string {
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

/** Locale-aware short date (e.g. "Jun 15, 2026") from an ISO timestamp. */
export function formatDate(iso: string, lng: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale(lng), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
