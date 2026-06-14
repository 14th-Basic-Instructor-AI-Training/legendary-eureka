# i18n Conventions (Jalat)

No backend equivalent — Jalat is multilingual from day one. Three locales: **Khmer (KH), Korean
(KR), English (ENG)**.

## The rule
- **No hardcoded user-facing copy.** Every string renders through i18next (`t('namespace.key')`).
- **Every key exists in all three locales.** A key in `en` but missing in `kh`/`kr` is a bug — the
  i18n-expert agent and code review check for this.

## Keys & namespaces
- Namespace by feature, mirroring the feature folders: `bookings.*`, `activities.*`,
  `agencyOnboarding.*`, `tripPlans.*`, plus shared `common.*`.
- Locale files live per feature under `features/<feature>/i18n/{kh,kr,en}.json` (or a central
  `locales/{kh,kr,en}/<namespace>.json` — pick one and stay consistent).
- Key names describe meaning, not the English text: `bookings.status.pendingApproval`, not
  `bookings.waitingForAgency`.

## Formatting
- Use i18next interpolation (`t('key', { name })`) and plurals — never string concatenation.
- Dates, numbers, prices, ratings use locale-aware formatting. Khmer uses different numerals and has
  no inter-word spaces; Korean has its own date/number conventions. Don't assume Latin formatting.

## Workflow when adding a string
1. Add the key with an English value.
2. Provide KH and KR values; if a translation is uncertain, add it and flag for human review rather
   than leaving the key missing in that locale.
3. Reference via `t()`; grep the diff for quoted JSX copy that bypassed `t()` before finishing.

## Layout impact
- KH/KR strings can be longer or taller than English — build flexible layouts (see
  `styling-conventions.md`); never hardcode widths to English copy.
