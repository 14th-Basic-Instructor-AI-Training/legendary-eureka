---
name: sileo-toast
description: >-
  How to show toast notifications in Jalat with Sileo — the installed, project-standard toast
  library. Use whenever you need transient success/error/info feedback after an action (create,
  publish, archive, delete, approve, reject, save, upload). Covers the standard call shape, the
  bold-entity-name description pattern, i18n, multi-step (upload) toasts, and the Sileo gotchas
  (shared-id removal, autopilot collapse). Keywords: toast, Sileo, sileo, notification, snackbar,
  Toaster, success/error feedback.
metadata:
  author: jalat
  version: "1.0.0"
---

# Sileo Toasts (Jalat)

`sileo` (v0.1.5) is the project's **chosen, installed** toast library — the "Sileo" entry that the
tech-stack docs mark as the notification surface. Use it for **transient success/failure feedback**
(`.claude/rules/error-handling.md`: "Transient success/failure → Sileo toasts"). Persistent /
blocking errors stay inline in the affected region — not a toast.

## Already configured — do NOT re-configure

- The single global `<Toaster>` is mounted once in `src/app/providers.tsx`:
  ```tsx
  import { Toaster } from "sileo";
  import "sileo/styles.css";
  // …inside <I18nextProvider>, sibling of <ConfirmRoot/>:
  <Toaster position="top-center" theme="system" />
  ```
- **Never mount another `<Toaster>`** and never re-import `sileo/styles.css` elsewhere.
- In feature code, import only the imperative API:
  ```tsx
  import { sileo } from "sileo";
  ```

## The standard toast

Every toast is **top-center**, copy comes from **i18next**, and the affected **entity name is
bold + slightly larger**.

```tsx
sileo.success({
  title: t("feature.toast.archived"),               // short result
  description: nameDesc("feature.toast.archivedDesc", item.title), // detail w/ bold name
  position: "top-center",                            // ALWAYS top-center
});
// failure:
sileo.error({ title: t("feature.toast.archiveError"), position: "top-center" });
```

`sileo.*` methods: `success` · `error` · `warning` · `info` · `show` · `dismiss(id)` · `clear()`.
Options (`SileoOptions`): `title`, `description` (string **or ReactNode**), `position`, `duration`
(ms; **default 6000**, `null` = persist until dismissed), `icon`, `autopilot`, `button`, `styles`.

### Bold entity name in the description

The detail line names the thing acted on, with the **name bold and a touch larger** so it stands
out. Render it through i18next's `<Trans>` so translations keep the markup:

```tsx
import { Trans } from "react-i18next";
import type { ReactNode } from "react";

/** Toast description with the entity name rendered bold + a little larger. */
const nameDesc = (i18nKey: string, name: string): ReactNode => (
  <Trans
    i18nKey={i18nKey}
    values={{ name }}
    components={{ b: <span style={{ fontWeight: 700, fontSize: "1.05em" }} /> }}
  />
);
```

The exact span style — `fontWeight: 700, fontSize: "1.05em"` — is the **canonical, consistent**
emphasis. `1.05em` is relative, so it stays "a little bigger" whatever the toast text size.

i18n value wraps the name in `<b>…</b>` (the tag mapped above), in **all three locales**
(`en` / `kh` / `kr`):

```json
"archivedDesc": "<b>{{name}}</b> is now hidden from travelers.",
```

### Wiring it to an action (reference pattern)

Toast on the success/failure of a mutation, after the action resolves. See
`src/features/admin/components/PackagesAdmin.tsx` and
`src/features/tours/components/TourApprovalsQueue.tsx`:

```tsx
const run = async (id, action, messages) => {
  const res = await action(id);
  if (res?.ok) {
    if (messages) sileo.success({ ...messages.success, position: "top-center" });
  } else if (messages) {
    sileo.error({ ...messages.error, position: "top-center" });
  }
};
// caller passes { success: { title, description: nameDesc(...) }, error: { title, description } }
```

## Multi-step / progress toasts (uploads)

For a pipeline (e.g. cover → photos → create → done), use **one** persistent toast whose body is a
React component reading a store, and morph it **in place**. Reference:
`src/features/tours/components/DestinationForm.tsx` + `UploadProgressToast.tsx` +
`uploadProgressStore.ts`.

```tsx
// one persistent toast; its <body/> reads the live step from a Zustand store
const id = sileo.show({ duration: null, position: "top-center", icon: null,
                        description: <UploadProgressContent /> });
setPhase({ step: "cover", percent: 0 });   // … photos … create …
setPhase({ step: "done", name });          // SAME toast morphs — no second sileo.* call
// auto-dismiss yourself (duration was null):
setTimeout(() => sileo.dismiss(id), 5000);
```

Why: updating the **store** re-renders the toast body without a new `sileo.*` call, so the toast
keeps its identity and never replays its enter animation. A second `sileo.*` call would replace the
toast (new internal `instanceId`) and visibly **close-then-reopen**.

> Track the toast id / dismiss timer at **module scope**, not in `useRef` or a component-level
> `let` — the React Compiler forbids reading refs or reassigning module bindings from render/handler
> code. Wrap the writes in module-scope functions (see `showUploadToast` / `scheduleUploadDismiss`
> in `DestinationForm.tsx`).

## Gotchas (these have already bitten us)

1. **Shared default id.** A toast with no explicit `id` gets the id `"sileo-default"`. So
   `sileo.dismiss(idFromShow)` then `sileo.success(...)` is a trap: `dismiss` schedules a delayed
   removal of that shared id and **deletes the success toast ~600ms later**. To swap a progress
   toast for a result, just call the next `sileo.*` (same id → it replaces/morphs in place) — do
   **not** dismiss-then-show.

2. **Autopilot collapses the description.** By default Sileo expands the description, then
   auto-**collapses** it after ~4s, leaving just the title while the toast lingers. If a description
   must stay visible the whole time: prefer rendering your own body (multi-step pattern above), or
   pin `autopilot: { collapse: <duration> }` so it only collapses at exit.

3. **Persistent toasts need manual dismissal.** `duration: null` never auto-dismisses — you must
   `sileo.dismiss(id)` it yourself.

## Checklist

- [ ] `import { sileo } from "sileo"` (never mount a second `<Toaster>`).
- [ ] `position: "top-center"` on every call.
- [ ] All copy through `t(...)`; entity name bold via `nameDesc` + i18n `<b>{{name}}</b>` in en/kh/kr.
- [ ] Success **and** failure paths both toast.
- [ ] Multi-step → one `sileo.show` + store-driven morph, dismiss manually.
- [ ] No dismiss-then-show on the same (default) id.
