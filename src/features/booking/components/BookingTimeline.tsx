"use client";

import { useTranslation } from "react-i18next";
import { CloseCircle, TickCircle } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/features/traveler/schema";
import { deriveTimeline } from "../data";
import type { TimelineStep } from "../schema";

/** Resolve the i18n label key for a step (the decision step flips on outcome). */
function labelKeyFor(step: TimelineStep): string {
  if (step.key === "decision") {
    return step.state === "rejected" ? "rejected" : "approved";
  }
  return step.key;
}

/** Vertical 4-step status timeline for a booking. */
export function BookingTimeline({ status }: { status: BookingStatus }) {
  const { t } = useTranslation();
  const steps = deriveTimeline(status);

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const done = step.state === "done";
        const current = step.state === "current";
        const rejected = step.state === "rejected";
        const key = labelKeyFor(step);

        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                  done && "bg-success",
                  rejected && "bg-danger",
                  current && "bg-primary-lightskyblue",
                  !done && !rejected && !current && "bg-border",
                )}
              >
                {done ? (
                  <TickCircle size={18} color="currentColor" variant="Bold" />
                ) : rejected ? (
                  <CloseCircle size={18} color="currentColor" variant="Bold" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              {!last ? (
                <span
                  className={cn(
                    "min-h-8 w-0.5 flex-1",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "text-sm font-semibold",
                  rejected
                    ? "text-danger"
                    : done || current
                      ? "text-foreground"
                      : "text-muted",
                )}
              >
                {t(`booking.status.timeline.${key}.title`)}
              </p>
              <p className="text-muted mt-0.5 text-sm">
                {t(`booking.status.timeline.${key}.desc`)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
