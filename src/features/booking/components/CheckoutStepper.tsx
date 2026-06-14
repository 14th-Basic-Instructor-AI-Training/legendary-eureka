"use client";

import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { CheckoutStepSchema, type CheckoutStep } from "../schema";

const STEPS = CheckoutStepSchema.options;

/** Horizontal progress header for the 3-step checkout. */
export function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const { t } = useTranslation();
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done && "bg-primary-lightskyblue text-white",
                  active &&
                    "border-primary-lightskyblue text-primary-lightskyblue border-2",
                  !done && !active && "border-border text-muted border",
                )}
              >
                {done ? (
                  <TickCircle size={18} color="currentColor" variant="Bold" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  active ? "text-foreground" : "text-muted",
                  "hidden sm:inline",
                )}
              >
                {t(`booking.steps.${step}`)}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  done ? "bg-primary-lightskyblue" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
