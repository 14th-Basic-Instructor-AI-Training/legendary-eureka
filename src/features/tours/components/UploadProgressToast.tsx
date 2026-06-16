"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { CloseCircle, DocumentUpload, Gallery, Location, TickCircle } from "iconsax-reactjs";
import { useUploadProgressStore, type UploadPhase } from "../uploadProgressStore";

/**
 * The body of the Sileo upload toast: it morphs through each step (cover upload →
 * photos upload → create), each sliding in from the right and out to the left,
 * with a progress bar (determinate for the file uploads, indeterminate for the
 * create call). Rendered as a Sileo toast `description`, so it reads the live
 * phase from the store rather than props.
 */
const STEP_ORDER = ["cover", "photos", "create"] as const;

function ProgressBar({
  percent,
  indeterminate,
  reduce,
}: {
  percent?: number;
  indeterminate?: boolean;
  reduce: boolean | null;
}) {
  if (indeterminate) {
    return (
      <div className="bg-muted/20 relative h-2 w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-primary absolute inset-y-0 left-0 w-1/3 rounded-full"
          animate={reduce ? { opacity: [0.4, 1, 0.4] } : { x: ["-120%", "360%"] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
        />
      </div>
    );
  }
  return (
    <div className="bg-muted/20 h-2 w-full overflow-hidden rounded-full">
      <motion.div
        className="bg-primary h-full rounded-full"
        initial={false}
        animate={{ width: `${percent ?? 0}%` }}
        transition={{ ease: "easeOut", duration: 0.3 }}
      />
    </div>
  );
}

export function UploadProgressContent() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const phase = useUploadProgressStore((s) => s.phase);
  const isEditing = useUploadProgressStore((s) => s.isEditing);

  if (!phase) return null;

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: 64, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -64, opacity: 0 },
      };

  const stepIndex = STEP_ORDER.indexOf(phase.step as (typeof STEP_ORDER)[number]);

  function renderBody(p: UploadPhase) {
    if (p.step === "error") {
      return (
        <div className="flex items-center gap-2.5">
          <span className="bg-danger/10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <CloseCircle size={20} color="currentColor" className="text-danger" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-text-primary text-sm font-semibold">
              {t("tours.destinations.upload.error")}
            </p>
            <p className="text-muted truncate text-xs">{p.message}</p>
          </div>
        </div>
      );
    }

    if (p.step === "done") {
      return (
        <div className="flex items-center gap-2.5">
          <span className="bg-green/10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <TickCircle size={20} color="currentColor" className="text-green" variant="Bold" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-text-primary text-sm font-semibold">
              {t(isEditing ? "tours.destinations.upload.doneSave" : "tours.destinations.upload.doneCreate")}
            </p>
            <p className="text-muted text-xs">
              {/* Name rendered bold + a touch larger — matches the approval-page
                  toasts (see PackagesAdmin `nameDesc`). */}
              <Trans
                i18nKey={
                  isEditing
                    ? "tours.destinations.upload.doneSaveDesc"
                    : "tours.destinations.upload.doneCreateDesc"
                }
                values={{ name: p.name }}
                components={{ b: <span style={{ fontWeight: 700, fontSize: "1.05em" }} /> }}
              />
            </p>
          </div>
        </div>
      );
    }

    const meta =
      p.step === "cover"
        ? { icon: <DocumentUpload size={20} color="currentColor" className="text-primary" />, title: t("tours.destinations.upload.cover"), percent: p.percent }
        : p.step === "photos"
          ? { icon: <Gallery size={20} color="currentColor" className="text-primary" />, title: t("tours.destinations.upload.photos"), percent: p.percent }
          : {
              icon: (
                <motion.span
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="inline-flex"
                >
                  <Location size={20} color="currentColor" className="text-primary" />
                </motion.span>
              ),
              title: t(isEditing ? "tours.destinations.upload.save" : "tours.destinations.upload.create"),
              percent: undefined as number | undefined,
            };

    return (
      <>
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            {meta.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-text-primary text-sm font-semibold">{meta.title}</p>
            <p className="text-muted text-xs">
              {t("tours.destinations.upload.stepOf", { current: stepIndex + 1, total: STEP_ORDER.length })}
            </p>
          </div>
          {meta.percent !== undefined ? (
            <span className="text-primary text-sm font-semibold tabular-nums">{meta.percent}%</span>
          ) : null}
        </div>
        <ProgressBar percent={meta.percent} indeterminate={meta.percent === undefined} reduce={reduce} />
      </>
    );
  }

  return (
    <div className="w-72 max-w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase.step}
          initial={slide.initial}
          animate={slide.animate}
          exit={slide.exit}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="flex flex-col gap-3"
        >
          {renderBody(phase)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
