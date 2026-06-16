/**
 * Neutral placeholder used when a backend image URL is missing/empty. Passing an
 * empty string to next/image triggers a runtime warning and a full-page re-fetch,
 * so image fallbacks resolve to this instead of "". It is an inline SVG data URI:
 * data URLs are served as-is by next/image (no optimizer, no remote fetch, no 404).
 */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='400'%20height='300'%3E%3Crect%20width='400'%20height='300'%20fill='%23e5e7eb'/%3E%3C/svg%3E";
