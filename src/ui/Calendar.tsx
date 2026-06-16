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

/**
 * Neutral event shape passed back to the feature layer when the user creates,
 * edits, drags, or deletes an event directly on the calendar grid. Dates are
 * ISO `YYYY-MM-DD` — DayFlow's internal Temporal values are normalised here so
 * the UI layer stays framework-agnostic.
 */
export type CalendarEventInput = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  /** The DayFlow calendar/group the event was created under. */
  categoryId?: string;
};

/**
 * Neutral calendar-group (DayFlow "calendar") shape passed back when the user
 * creates / renames / deletes a group via the sidebar.
 */
export type CalendarGroupInput = {
  id: string;
  name: string;
  color: string;
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
  /** Calendar/group new grid-created events default to (e.g. "personal"). */
  defaultCalendarId?: string;
  /** Fired when the user creates an event directly on the calendar grid. */
  onEventCreate?: (event: CalendarEventInput) => void | Promise<void>;
  /** Fired when the user edits/drags/resizes an event on the grid. */
  onEventUpdate?: (event: CalendarEventInput) => void | Promise<void>;
  /** Fired when the user deletes an event from the grid. */
  onEventDelete?: (id: string) => void | Promise<void>;
  /** Fired when the user creates a new calendar group in the sidebar. */
  onCalendarCreate?: (group: CalendarGroupInput) => void | Promise<void>;
  /** Fired when the user renames/recolors a calendar group. */
  onCalendarUpdate?: (group: CalendarGroupInput) => void | Promise<void>;
  /** Fired when the user deletes a calendar group. */
  onCalendarDelete?: (id: string) => void | Promise<void>;
  /**
   * Translated label of the group that gets the inline "+" add-calendar button.
   * Only the sidebar source heading matching this text shows the button.
   */
  addCalendarSourceLabel?: string;
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
        "border-border bg-surface h-fit min-h-fit w-full overflow-hidden rounded-xl border",
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
