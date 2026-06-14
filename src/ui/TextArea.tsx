import type { ComponentProps } from "react";
import { TextArea as HeroTextArea } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Jalat TextArea — thin wrapper over HeroUI v3's TextArea. Variants are
 * slot-based, so we merge className and pass `variant`/`fullWidth`/native props
 * through (Card/Chip-style). Bakes in full-width rounded defaults.
 */
export type UITextAreaProps = ComponentProps<typeof HeroTextArea>;

export function TextArea({ className, ...props }: UITextAreaProps) {
  return (
    <HeroTextArea
      className={cn("w-full rounded-lg placeholder:text-text-input-color", className)}
      {...props}
    />
  );
}
