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
import type {
  CalendarEntry,
  CalendarCategory,
  CalendarEventInput,
  CalendarGroupInput,
  UICalendarProps,
} from "./Calendar";

function parseLocalDate(iso: string): Date {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** DayFlow stores dates as Temporal values; their ISO string starts with YYYY-MM-DD. */
function toIsoDate(value: unknown): string {
  return String(value).slice(0, 10);
}

/** Normalise a DayFlow event into the neutral shape the feature layer persists. */
function fromDayFlowEvent(e: DayFlowEvent): CalendarEventInput {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    start: toIsoDate(e.start),
    end: toIsoDate(e.end),
    allDay: e.allDay !== false,
    categoryId: e.calendarId,
  };
}

/** Normalise a DayFlow calendar (group) into the neutral shape we persist. */
function fromDayFlowCalendar(c: CalendarType): CalendarGroupInput {
  return {
    id: c.id,
    name: c.name,
    color: c.colors?.eventSelectedColor ?? c.colors?.lineColor ?? "#10B981",
  };
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
  defaultCalendarId,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onCalendarCreate,
  onCalendarUpdate,
  onCalendarDelete,
  addCalendarSourceLabel,
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
    defaultCalendar: defaultCalendarId ?? categories[0]?.id,
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
      // Persist grid-driven create / edit / drag / resize / delete so events
      // survive a refresh instead of living only in DayFlow's memory.
      onEventCreate: onEventCreate
        ? (e: DayFlowEvent) => onEventCreate(fromDayFlowEvent(e))
        : undefined,
      onEventUpdate: onEventUpdate
        ? (e: DayFlowEvent) => onEventUpdate(fromDayFlowEvent(e))
        : undefined,
      onEventDelete: onEventDelete ? (id: string) => onEventDelete(id) : undefined,
      // Persist sidebar calendar (group) create / rename / delete.
      onCalendarCreate: onCalendarCreate
        ? (c: CalendarType) => onCalendarCreate(fromDayFlowCalendar(c))
        : undefined,
      onCalendarUpdate: onCalendarUpdate
        ? (c: CalendarType) => onCalendarUpdate(fromDayFlowCalendar(c))
        : undefined,
      onCalendarDelete: onCalendarDelete ? (id: string) => onCalendarDelete(id) : undefined,
    },
  });

  useEffect(() => {
    calendarRef.current = calendar;
  });

  // Inject a "+" button next to each sidebar group name. DayFlow has no native
  // affordance for this, so we attach it to the rendered `.df-sidebar-source-label`
  // and drive DayFlow's own "New Calendar" context-menu action programmatically.
  useEffect(() => {
    const addPlusButtons = () => {
      const labels = document.querySelectorAll(".df-sidebar-source-label");

      labels.forEach((label) => {
        if (label.querySelector(".group-plus-btn")) return;

        const labelEl = label as HTMLElement;

        // Only the configured group (Personal Events) gets the inline + button.
        if (addCalendarSourceLabel && labelEl.textContent?.trim() !== addCalendarSourceLabel) {
          return;
        }

        labelEl.style.display = "inline-flex";
        labelEl.style.alignItems = "center";
        labelEl.style.gap = "6px";

        const plusBtn = document.createElement("span");

        plusBtn.textContent = "+";
        plusBtn.className = "group-plus-btn";
        plusBtn.setAttribute("role", "button");
        plusBtn.setAttribute("tabindex", "0");

        plusBtn.style.width = "12px";
        plusBtn.style.height = "12px";
        plusBtn.style.borderRadius = "50%";
        plusBtn.style.backgroundColor = "#10B981";
        plusBtn.style.color = "#ffffff";
        plusBtn.style.display = "inline-flex";
        plusBtn.style.alignItems = "center";
        plusBtn.style.justifyContent = "center";
        plusBtn.style.fontSize = "10px";
        plusBtn.style.lineHeight = "1";
        plusBtn.style.cursor = "pointer";

        plusBtn.onpointerdown = (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };

        plusBtn.onmousedown = (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };

        plusBtn.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const sourceToggle = labelEl.closest(
            ".df-sidebar-source-toggle",
          ) as HTMLElement | null;

          if (!sourceToggle) return;

          // Open DayFlow context menu off-screen
          sourceToggle.dispatchEvent(
            new MouseEvent("contextmenu", {
              bubbles: true,
              cancelable: true,
              view: window,
              button: 2,
              buttons: 2,
              clientX: -9999,
              clientY: -9999,
            }),
          );

          setTimeout(() => {
            const newCalendarItem = Array.from(
              document.querySelectorAll(".df-context-menu-item"),
            ).find((item) => item.textContent?.trim() === "New Calendar") as
              | HTMLElement
              | undefined;

            if (!newCalendarItem) return;

            newCalendarItem.click();

            // Hide/remove the intermediate context menu
            requestAnimationFrame(() => {
              document
                .querySelectorAll(
                  ".df-context-menu, .df-portal:not(.df-create-calendar-dialog-backdrop)",
                )
                .forEach((el) => el.remove());
            });
          }, 50);
        };

        labelEl.appendChild(plusBtn);
      });
    };

    addPlusButtons();

    const observer = new MutationObserver(addPlusButtons);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [addCalendarSourceLabel]);

  return (
    <div className="h-full w-full">
      <DayFlowCalendar calendar={calendar} />
    </div>
  );
}
