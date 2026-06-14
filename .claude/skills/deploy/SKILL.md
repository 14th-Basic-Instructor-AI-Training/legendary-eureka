---
name: deploy
description: >-
  Build and deploy the Jalat Next.js app — production build, env/secret checklist, and Vercel (or
  Node) deploy steps. Use when preparing a release or shipping a preview. (Frontend analog of the
  backend deploy skill.)
---

# Deploy (Jalat)

> The app isn't scaffolded yet — treat this as the deploy runbook to follow once it is. Fill in the
> hosting specifics when the target is chosen (Vercel is the natural default for Next.js 16).

## Pre-deploy checklist
- [ ] `npm run lint` clean and typecheck passes.
- [ ] `npm run build` succeeds locally.
- [ ] Tests green (see `testing`).
- [ ] **Secrets**: nothing sensitive in `NEXT_PUBLIC_*`; Auth.js, Knock, and any map/3rd-party keys
      are server-side env only. MapLibre uses the no-API-key option.
- [ ] All three locales (KH/KR/ENG) load; no missing-key console warnings.
- [ ] Env vars set in the host (not committed): Auth.js secret/URL, Knock keys, WebSocket endpoint.

## Build
```bash
npm run build      # production build
npm run start      # serve the build locally to smoke-test
```

## Deploy (Vercel — default)
1. Connect the repo; set the env vars above in the project settings (Production + Preview).
2. Pushes to feature branches create preview deploys; merges to the release branch deploy production.
3. Verify after deploy: the three role areas load, language switch works, and no secret leaked to the
   client bundle.

## Node/self-host (alternative)
`npm run build` then run `npm run start` behind a reverse proxy; ensure the WebSocket endpoint and
env are configured. Document the chosen target here once decided.
