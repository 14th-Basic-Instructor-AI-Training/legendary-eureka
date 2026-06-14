# Claude Security Guidance (Jalat)

Frontend security policy Claude follows when working in this repo. Pairs with
`security-patterns.json` (grep catalog) and the `security-scan` skill / `security-auditor` agent.

## Threat model
Jalat's biggest surface is **authorization** across three roles (Admin, Tour Agency, Traveler) plus
unauthenticated Guests. Most real risk is broken access control, not exotic exploits.

## Rules
1. **Authorization is centralized.** All role checks go through `src/lib/permissions.ts`. Never
   re-derive role logic inline. A UI gate is UX; the mutation path (server action / API) must
   re-check. Guests are read-only.
2. **Trust the session, not the client.** Role/identity come from the verified Auth.js session, never
   from client-controllable state. Verify resource ownership before mutating; never trust a
   client-supplied ID or role.
3. **No secrets in the client.** Nothing sensitive in `NEXT_PUBLIC_*` or committed env. Auth.js,
   Knock, and any 3rd-party keys stay server-side. MapLibre must use the no-API-key option.
4. **Avoid XSS.** No `dangerouslySetInnerHTML` with user content. Treat comments, feedback, trip-plan
   text, and agency profiles as untrusted; sanitize/escape.
5. **No dynamic code.** No `eval` / `new Function` / dynamic `import()` of user-controlled paths.
6. **TLS only.** No plain `http://` to remote hosts. Validate external URLs (map sources, links).
7. **Don't leak PII.** Keep PII out of logs, URLs, and analytics.

## When you find an issue
Report severity (Critical/High/Medium/Low), `file:line`, a concrete exploit scenario (which role does
what they shouldn't), and the fix. Don't silently "fix" by weakening a check — escalate access-control
changes to the user.

## Boundaries
Assist with defensive security, fixing access-control bugs, and hardening. Don't add detection-evasion
or intentionally weaken authentication/authorization.
