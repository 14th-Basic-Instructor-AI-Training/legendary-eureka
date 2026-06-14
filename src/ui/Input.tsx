import type { ComponentProps } from "react";
import { Input as HeroInput } from "@heroui/react";
import { tv } from "tailwind-variants";

/**
 * Jalat Input — extended variant of HeroUI v3's Input. Bakes in Jalat defaults
 * (full width by default, rounded). HeroUI's own `variant` (primary/secondary)
 * and all native input attributes still pass through.
 */
const jalatInput = tv({ base: "w-full rounded-lg placeholder:text-text-input-color" });

export type UIInputProps = Omit<ComponentProps<typeof HeroInput>, "className"> & {
  className?: string;
};

export function Input({ className, ...props }: UIInputProps) {
  return <HeroInput className={jalatInput({ className })} {...props} />;
}
