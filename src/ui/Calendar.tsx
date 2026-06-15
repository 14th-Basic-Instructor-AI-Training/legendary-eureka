"use client";

import { useState, useEffect } from "react";
import { CalendarInner } from "./CalendarInner";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

/** A colour group (legend row) — events reference it by `categoryId`. */
export type CalendarCategory = {
  id: string;
  /** Already-translated label. */
  name: string;
  /** Base colour (any CSS colour) used for the event chip + legend dot. */
  color: string;
  /**
   * Optional sidebar group heading (e.g. "Booked Tours", "Personal Events").
   * Calendars with the same `source` value are grouped together in the sidebar.
   */
  source?: string;
};

/** A single all-day calendar entry (date strings are ISO `YYYY-MM-DD`). */
export type CalendarEntry = {
  id: string;
  title: string;
  description?: string;
  start: string;
  /** Inclusive end; defaults to `start` for single-day entries. */
  end?: string;
  /** Defaults to true — v1 entries are all-day ranges. */
  allDay?: boolean;
  /** Links the entry to a {@link CalendarCategory} for colour. */
  categoryId?: string;
};

export type CalendarView = "day" | "week" | "month" | "agenda";

/** Translated chrome labels handed to DayFlow's locale. */
export type CalendarMessages = Partial<
  Record<
    | "today"
    | "day"
    | "week"
    | "month"
    | "year"
    | "agenda"
    | "more"
    | "noEvents"
    | "allDay",
    string
  >
>;

export type UICalendarProps = {
  entries: CalendarEntry[];
  categories?: CalendarCategory[];
  defaultView?: CalendarView;
  /** Intl locale code for date formatting (e.g. "en", "ko"). */
  localeCode?: string;
  messages?: CalendarMessages;
  /** Read-only view (no drag/create). Defaults to true. */
  readOnly?: boolean;
  /** Extra classes for the sized container (defaults to a tall panel). */
  className?: string;
  /**
   * Opaque version string — when this changes, CalendarInner is remounted so
   * DayFlow reinitialises with the new events/categories.
   */
  version?: string;
};

export function Calendar({ className, version, ...props }: UICalendarProps) {
  // CalendarInner uses Preact internally; rendering it server-side or during
  // React hydration corrupts Preact's currentComponent state and causes __H errors.
  // Guard with a mounted flag so DayFlow only ever renders on the live client DOM.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        "border-border bg-surface h-[76vh] min-h-[520px] w-full overflow-hidden rounded-xl border",
        className,
      )}
    >
      {mounted ? (
        <CalendarInner key={version} {...props} />
      ) : (
        <Skeleton className="h-full w-full rounded-xl" />
      )}
    </div>
  );
}
