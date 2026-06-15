"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

/**
 * Jalat Calendar — the single calendar seam for feature code, wrapping DayFlow
 * (`@dayflow/react`). Feature code passes a domain-light {@link CalendarEntry}
 * list plus colour {@link CalendarCategory categories}; the wrapper bakes in the
 * views, theme, read-only default, and locale messages.
 *
 * DayFlow constructs its (Preact-powered) app during render, so the actual
 * integration is loaded client-only via `next/dynamic({ ssr: false })` to keep
 * it out of the server render and avoid hydration mismatches.
 */

/** A colour group (legend row) — events reference it by `categoryId`. */
export type CalendarCategory = {
  id: string;
  /** Already-translated label. */
  name: string;
  /** Base colour (any CSS colour) used for the event chip + legend dot. */
  color: string;
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
};

const CalendarInner = dynamic(
  () => import("./CalendarInner").then((m) => m.CalendarInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[72vh] w-full rounded-xl" />,
  },
);

export function Calendar({ className, ...props }: UICalendarProps) {
  return (
    <div className={cn("border-border bg-surface w-full rounded-xl border", className)}>
      <CalendarInner {...props} />
    </div>
  );
}
