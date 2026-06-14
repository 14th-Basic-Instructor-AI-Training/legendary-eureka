"use client";

import { Fragment } from "react";
import { ArrowRight2 } from "iconsax-reactjs";
import { LocaleLink } from "@/components/LocaleLink";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb trail for the detail hero (Home / Destinations / {name}). `tone`
 * "light" renders white-on-image for the hero overlay; "default" for in-page use.
 */
export function Breadcrumb({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "default" }) {
  const light = tone === "light";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm",
        light ? "text-white/70" : "text-muted",
      )}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={item.label}>
            {item.href && !last ? (
              <LocaleLink
                href={item.href}
                className={cn(
                  "transition-colors",
                  light ? "hover:text-white" : "hover:text-foreground",
                )}
              >
                {item.label}
              </LocaleLink>
            ) : (
              <span className={cn(last && (light ? "font-semibold text-white" : "text-foreground font-semibold"))}>
                {item.label}
              </span>
            )}
            {!last ? (
              <ArrowRight2
                size={13}
                color="currentColor"
                className={light ? "text-white/50" : "text-muted"}
              />
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
