"use client";

import { useEffect, useRef } from "react";
import {
  useCalendarApp,
  DayFlowCalendar,
  createMonthView,
  createWeekView,
  createDayView,
  createEventsPlugin,
  createEvent,
  ViewType,
  type CalendarType,
  type Event as DayFlowEvent,
} from "@dayflow/react";
import { createSidebarPlugin } from "@dayflow/plugin-sidebar";
import { createDragPlugin } from "@dayflow/plugin-drag";
import type { CalendarEntry, CalendarCategory, UICalendarProps } from "./Calendar";

function parseLocalDate(iso: string): Date {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toDayFlowEvent(entry: CalendarEntry): DayFlowEvent {
  const start = parseLocalDate(entry.start);
  const end = parseLocalDate(entry.end ?? entry.start);
  return createEvent({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    start,
    end,
    allDay: entry.allDay !== false,
    calendarId: entry.categoryId,
  });
}

function toCalendarType(cat: CalendarCategory): CalendarType {
  const hex = cat.color;
  return {
    id: cat.id,
    name: cat.name,
    source: cat.source,
    isVisible: true,
    colors: {
      eventColor: `${hex}28`,
      eventSelectedColor: hex,
      lineColor: hex,
      textColor: hex,
    },
    darkColors: {
      eventColor: `${hex}40`,
      eventSelectedColor: hex,
      lineColor: hex,
      textColor: hex,
    },
  };
}

type CalendarHandle = ReturnType<typeof useCalendarApp>;

export function CalendarInner({
  entries,
  categories = [],
  defaultView = "month",
  localeCode = "en",
  messages,
  readOnly = false,
}: UICalendarProps) {
  const calendarRef = useRef<CalendarHandle | null>(null);

  // Config built inline — no useMemo wrapping — to avoid Preact __H hook conflict.
  const calendar = useCalendarApp({
    views: [createDayView(), createWeekView(), createMonthView()],
    plugins: [
      createDragPlugin(),
      createEventsPlugin(),
      createSidebarPlugin({
        showEventDots: true,
        createCalendarMode: "modal",
      }),
    ],
    calendars: categories.map(toCalendarType),
    events: entries.map(toDayFlowEvent),
    defaultCalendar: categories[0]?.id,
    defaultView,
    locale: { code: localeCode, messages: messages ?? {} },
    readOnly: readOnly ? { draggable: false, viewable: true } : false,
    useCalendarHeader: true,
    useEventDetailDialog: true,
    switcherMode: "buttons",
    theme: { mode: "light" },
    callbacks: {
      onMoreEventsClick: (date: Date) => {
        calendarRef.current?.selectDate(date);
        calendarRef.current?.setCurrentDate(date);
        calendarRef.current?.changeView(ViewType.DAY);
      },
    },
  });

  useEffect(() => {
    calendarRef.current = calendar;
  });

  return (
    <div className="h-full w-full">
      <DayFlowCalendar calendar={calendar} />
    </div>
  );
}
