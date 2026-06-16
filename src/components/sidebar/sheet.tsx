"use client";

import type { ComponentProps, ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/** Minimal left-anchored sheet (Radix Dialog) used for the mobile off-canvas sidebar. */
export const Sheet = DialogPrimitive.Root;

export function SheetContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { title?: string; children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "sheet-content bg-surface border-border fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r shadow-primary outline-none",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">{title ?? "Navigation"}</DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
