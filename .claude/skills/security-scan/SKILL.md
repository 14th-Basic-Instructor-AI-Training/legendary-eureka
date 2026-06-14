---
name: security-scan
description: >-
  Scan the Jalat frontend for security issues — broken access control across the three roles, client
  trust mistakes, XSS, and secret/PII leakage. Use before merging auth/permission/data changes or on
  request. Pairs with the security-scan.py hook and security-patterns.json.
---

# Security Scan (Jalat)

Run a focused security pass, weighted toward **authorization** (the three-role model is the biggest
surface). Use `.claude/security-patterns.json` as the grep catalog and
`.claude/skills/claude-security-guidance.md` for the policy.

## Procedure
1. Scan changed (or all) `*.ts/tsx/js/jsx` for the patterns in `security-patterns.json`.
2. Manually audit the authorization-sensitive paths below.
3. Report severity-ranked findings (Critical/High/Medium/Low) with `file:line`, the exploit, and fix.

## What to check
- **Broken access control** — privileged action gated only in UI; missing server-side permission
  check; a role mutating something it shouldn't (agency editing a published activity directly instead
  of filing an edit request; traveler acting as admin; guest writing).
- **Authorization centralization** — every check goes through `lib/permissions.ts`; flag re-derived
  role logic.
- **Client trust** — role/identity from client state instead of the verified session; IDs trusted
  without an ownership check.
- **XSS** — `dangerouslySetInnerHTML` / unsanitized user content (comments, feedback, trip plans,
  agency profiles).
- **Secrets/PII** — keys in the client bundle or `NEXT_PUBLIC_*`; PII in logs/URLs; Knock/Auth
  secrets must be server-side; MapLibre must be no-API-key.
- **Third-party** — untrusted URLs/markup via Sileo toasts or MapLibre sources.

For a deep manual audit, use the `security-auditor` agent.
