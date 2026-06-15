"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Calendar, type CalendarCategory, type CalendarEntry } from "@/ui";
import { useResource } from "@/lib/useResource";
import type { Role } from "@/features/auth/schema";
import type { PersonalEventResponse } from "@/lib/api/calendar";
import { eventsGetterFor } from "../data";
import type { CalendarEvent } from "../schema";
import { PersonalEventsPanel } from "./PersonalEventsPanel";

/**
 * Shared per-role calendar screen.
 *
 * - Traveler: "Booked Tours" group (blue) + "Personal Events" group (green)
 * - Agency/Admin: one colour group per tour package + "Personal Events" group
 *
 * Personal events are included in the combined data returned by the role getter.
 * The `PersonalEventsPanel` below the calendar derives its list from that data
 * and fires `onChanged` (increments `refreshKey`) when a personal event is
 * added/deleted, which causes the getter to re-run via a new function reference.
 */

function dayflowLocaleCode(lng: string): string {
  return lng === "kr" ? "ko" : "en";
}

export function RoleCalendar({ role }: { role: Role }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  // Increment to force a full data reload after a personal event mutation.
  const [refreshKey, setRefreshKey] = useState(0);

  // A new function reference per (role, refreshKey) pair causes useResource to re-fetch.
  const getter = useCallback(
    () => eventsGetterFor(role)(),
    // refreshKey intentionally included to re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, refreshKey],
  );

  const { status, data, reload } = useResource(getter);

  // ── DayFlow entries ───────────────────────────────────────────────────────────
  const entries = useMemo<CalendarEntry[]>(
    () =>
      (data ?? []).map((e: CalendarEvent) => ({
        id: e.id,
        title: e.title,
        description: [e.subtitle, e.status ? t(`status.${e.status}`) : null]
          .filter(Boolean)
          .join(" · "),
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        categoryId: e.group ?? e.type,
      })),
    [data, t],
  );

  // ── Categories for DayFlow sidebar groups ────────────────────────────────────
  // Each unique `group` in the data becomes a CalendarType in the sidebar.
  // The `source` field groups related calendars under a heading in the sidebar.
  const categories = useMemo<CalendarCategory[]>(() => {
    const groupMap = new Map<
      string,
      { name: string; color: string; source: string }
    >();

    const bookedLabel = t("calendar.groups.bookings");
    const personalLabel = t("calendar.groups.personal");

    for (const e of data ?? []) {
      const gid = e.group ?? e.type;
      if (!groupMap.has(gid)) {
        const isPersonalGroup = gid === "personal";
        const name = isPersonalGroup
          ? personalLabel
          : gid === "bookings"
            ? bookedLabel
            : (e.groupLabel ?? t(`calendar.types.${e.type}`));
        const source = isPersonalGroup ? personalLabel : bookedLabel;
        groupMap.set(gid, {
          name,
          color: e.groupColor ?? "#888888",
          source,
        });
      }
    }

    return [...groupMap.entries()].map(([id, { name, color, source }]) => ({
      id,
      name,
      color,
      source,
    }));
  }, [data, t]);

  // Fingerprint used as React key on CalendarInner — forces a clean remount
  // when events or categories change so DayFlow reinitialises with fresh data.
  const calendarVersion = useMemo(
    () =>
      entries.map((e) => `${e.id}:${e.start}`).join("|") +
      "#" +
      categories.map((c) => c.id).join(","),
    [entries, categories],
  );

  const messages = useMemo(
    () => ({
      today: t("calendar.chrome.today"),
      day: t("calendar.chrome.day"),
      week: t("calendar.chrome.week"),
      month: t("calendar.chrome.month"),
      year: t("calendar.chrome.year"),
      agenda: t("calendar.chrome.agenda"),
      more: t("calendar.chrome.more"),
      noEvents: t("calendar.chrome.noEvents"),
      allDay: t("calendar.chrome.allDay"),
    }),
    [t],
  );

  // ── Personal events for the side panel ───────────────────────────────────────
  const panelPersonalEvents = useMemo<PersonalEventResponse[]>(
    () =>
      (data ?? [])
        .filter((e) => e.isPersonal)
        .map((e) => ({
          id: e.id,
          title: e.title,
          description: e.subtitle,
          startDate: e.start,
          endDate: e.end,
          allDay: e.allDay,
          createdAt: "",
        })),
    [data],
  );

  const handlePersonalEventChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="mx-auto flex h-full max-w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("calendar.title")}</h1>
        <p className="text-muted text-sm">{t(`calendar.subtitle.${role}`)}</p>
      </header>

      {status === "loading" ? (
        <div className="border-border bg-surface h-[76vh] min-h-[520px] w-full animate-pulse rounded-xl border" />
      ) : status === "error" ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted text-sm">{t("calendar.states.error")}</p>
          <Button variant="secondary" size="sm" onPress={reload}>
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <>
          {/* DayFlow calendar — sidebar shows the legend + mini-calendar natively */}
          <Calendar
            entries={entries}
            categories={categories}
            defaultView="month"
            localeCode={dayflowLocaleCode(lng)}
            messages={messages}
            version={calendarVersion}
          />

          {/* Personal events panel — add / delete personal events */}
          <PersonalEventsPanel
            events={panelPersonalEvents}
            onChanged={handlePersonalEventChanged}
          />
        </>
      )}
    </div>
  );
}
