"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * A collapsible, titled sidebar section. Wraps any filter control so every facet
 * shares the same header + expand/collapse affordance.
 */
export function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-border border-b py-4 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-foreground flex w-full items-center justify-between gap-2 text-sm font-semibold"
      >
        {title}
        <ArrowDown2
          size={16}
          color="currentColor"
          className={cn("text-muted transition-transform", open ? "rotate-180" : "rotate-0")}
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
