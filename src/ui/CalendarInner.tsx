"use client";

import { useMemo } from "react";
import {
  useCalendarApp,
  DayFlowCalendar,
  createMonthView,
  createWeekView,
  createDayView,
  createAgendaView,
  createEventsPlugin,
  createAllDayEvent,
  type CalendarAppConfig,
  type CalendarType,
  type Event as DayFlowEvent,
  type Locale,
} from "@dayflow/react";
// Use DayFlow's component-only stylesheet — NOT `styles.css`, which bundles a full
// copy of Tailwind's global preflight reset (`*`, `html`, `h1-h6`, `a`, `button`…)
// that would clobber the app's own styling wherever the calendar loads. This file
// has all the `df-*` calendar styles (scoped via @layer) without that global reset.
import "@dayflow/core/dist/styles.components.css";
import type { CalendarEntry, UICalendarProps } from "./Calendar";

/**
 * DayFlow integration (client-only — see `Calendar.tsx`). Converts Jalat's
 * domain-light entries/categories into DayFlow events + calendar colour types,
 * wires the month/week/day/agenda views, and applies the read-only + locale
 * config. Kept thin: all Jalat-facing API lives in `Calendar.tsx`.
 */

/** Parse an ISO `YYYY-MM-DD` (or full ISO) into a LOCAL Date — avoids the UTC
 *  midnight day-shift that `new Date("2026-06-20")` causes in western zones. */
function parseLocalDate(iso: string): Date {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toDayFlowEvent(entry: CalendarEntry): DayFlowEvent {
  const start = parseLocalDate(entry.start);
  const end = parseLocalDate(entry.end ?? entry.start);
  return createAllDayEvent({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    start,
    end,
    calendarId: entry.categoryId,
  });
}

function toCalendarType(category: {
  id: string;
  name: string;
  color: string;
}): CalendarType {
  return {
    id: category.id,
    name: category.name,
    colors: {
      eventColor: category.color,
      eventSelectedColor: category.color,
      lineColor: category.color,
      textColor: "#ffffff",
    },
  };
}

export function CalendarInner({
  entries,
  categories = [],
  defaultView = "month",
  localeCode = "en",
  messages,
  readOnly = true,
}: UICalendarProps) {
  // Fingerprint the inputs so the calendar app rebuilds when data/locale change.
  const version = useMemo(
    () =>
      [
        localeCode,
        defaultView,
        readOnly ? "ro" : "rw",
        entries.map((e) => `${e.id}:${e.start}:${e.end ?? e.start}`).join("|"),
      ].join("#"),
    [localeCode, defaultView, readOnly, entries],
  );

  const config = useMemo<CalendarAppConfig>(() => {
    const locale: Locale = { code: localeCode, messages: messages ?? {} };
    return {
      views: [
        createMonthView(),
        createWeekView(),
        createDayView(),
        createAgendaView(),
      ],
      plugins: [createEventsPlugin()],
      events: entries.map(toDayFlowEvent),
      calendars: categories.map(toCalendarType),
      defaultCalendar: categories[0]?.id,
      defaultView,
      locale,
      readOnly: readOnly ? { draggable: false, viewable: true } : false,
      useCalendarHeader: true,
      useEventDetailPanel: true,
      switcherMode: "buttons",
      theme: { mode: "light" },
    };
    // Inputs are captured via the `version` fingerprint above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const calendar = useCalendarApp(config, version);

  return <DayFlowCalendar calendar={calendar} />;
}
