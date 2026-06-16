"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Calendar,
  type CalendarCategory,
  type CalendarEntry,
  type CalendarEventInput,
  type CalendarGroupInput,
} from "@/ui";
import { useResource } from "@/lib/useResource";
import type { Role } from "@/features/auth/schema";
import {
  createPersonalEvent,
  updatePersonalEvent,
  deletePersonalEvent,
  createPersonalCalendar,
  updatePersonalCalendar,
  deletePersonalCalendar,
} from "@/services/calendar.service";
import { eventsGetterFor } from "../data";
import type { CalendarEvent } from "../schema";

const PERSONAL_GROUP = "personal";
const PERSONAL_COLOR = "#10B981";

/**
 * Shared per-role calendar screen.
 *
 * - Traveler: "Booked Tours" group (blue) + "Personal Events" group (green)
 * - Agency/Admin: one colour group per tour package + "Personal Events" group
 *
 * Events are created/edited directly on the calendar grid:
 *   1. Double-click a day  → `onEventCreate` → POST a personal event (gets a
 *      real server id). DayFlow keeps the new event on screen so the editor
 *      stays open — we deliberately do NOT reload here.
 *   2. Adjust date/time + save → `onEventUpdate` → PUT the change, then reload.
 *
 * DayFlow assigns its own temporary id to a newly drawn event, while the API
 * returns a different server id; `dayflowToServerId` bridges the two so the
 * follow-up update/delete targets the right record.
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
      (data?.events ?? []).map((e: CalendarEvent) => ({
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

    // Personal group always exists so grid-created events have a home and the
    // sidebar shows it even before the first personal event is added.
    groupMap.set(PERSONAL_GROUP, {
      name: personalLabel,
      color: PERSONAL_COLOR,
      source: personalLabel,
    });

    // User-defined personal calendars become sub-groups under "Personal Events".
    // Registered before events so an event in a custom calendar picks it up.
    for (const cal of data?.calendars ?? []) {
      groupMap.set(cal.id, { name: cal.name, color: cal.color, source: personalLabel });
    }

    for (const e of data?.events ?? []) {
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

  // IDs of events that are personal (and therefore safe to edit/delete via the
  // personal-events API). Bookings/trips are not editable here.
  const personalIds = useMemo(
    () => new Set((data?.events ?? []).filter((e) => e.isPersonal).map((e) => e.id)),
    [data],
  );

  // IDs of user-defined personal calendars (safe to rename/delete via the API).
  const personalCalendarIds = useMemo(
    () => new Set((data?.calendars ?? []).map((c) => c.id)),
    [data],
  );

  // Maps DayFlow's temporary event id (assigned when a new event is drawn on the
  // grid) to the server id returned by POST, so the follow-up save can update it.
  const dayflowToServerId = useRef<Map<string, string>>(new Map());

  // Resolve a grid event id to its persisted server id, if any.
  const resolveServerId = useCallback(
    (id: string): string | null => {
      const mapped = dayflowToServerId.current.get(id);
      if (mapped) return mapped;
      return personalIds.has(id) ? id : null;
    },
    [personalIds],
  );

  // Resolve the DayFlow calendar an event sits under to a personal-calendar id
  // (null for the default "personal" group or non-personal calendars).
  const resolveCalendarId = useCallback(
    (categoryId?: string): string | null =>
      categoryId && personalCalendarIds.has(categoryId) ? categoryId : null,
    [personalCalendarIds],
  );

  // Double-click create: persist immediately so the event survives a refresh.
  // No reload — DayFlow keeps the event/editor open for the follow-up save.
  // Personal events are date-only → always all-day.
  const handleEventCreate = useCallback(
    async (e: CalendarEventInput) => {
      const created = await createPersonalEvent({
        title: e.title?.trim() || t("calendar.personal.untitled"),
        description: e.description || undefined,
        startDate: e.start,
        endDate: e.end,
        allDay: true,
        calendarId: resolveCalendarId(e.categoryId),
      });
      dayflowToServerId.current.set(e.id, created.id);
    },
    [resolveCalendarId, t],
  );

  // Save after editing (or drag/resize/recategorize): persist the change.
  // Bookings are not editable, so a reload reverts any change made to them.
  const handleEventUpdate = useCallback(
    async (e: CalendarEventInput) => {
      const serverId = resolveServerId(e.id);
      if (serverId) {
        await updatePersonalEvent(serverId, {
          title: e.title?.trim() || t("calendar.personal.untitled"),
          description: e.description || undefined,
          startDate: e.start,
          endDate: e.end,
          allDay: true,
          calendarId: resolveCalendarId(e.categoryId),
        });
      }
      setRefreshKey((k) => k + 1);
    },
    [resolveServerId, resolveCalendarId, t],
  );

  const handleEventDelete = useCallback(
    async (id: string) => {
      const serverId = resolveServerId(id);
      if (serverId) {
        await deletePersonalEvent(serverId);
      }
      setRefreshKey((k) => k + 1);
    },
    [resolveServerId],
  );

  // Creating a calendar via the "+" on the Personal group: persist it, then
  // reload so it re-renders (with its real id) under the Personal Events heading.
  const handleCalendarCreate = useCallback(
    async (g: CalendarGroupInput) => {
      await createPersonalCalendar({
        name: g.name?.trim() || t("calendar.calendars.untitled"),
        color: g.color,
      });
      setRefreshKey((k) => k + 1);
    },
    [t],
  );

  // Rename/recolor and delete only apply to user-defined personal calendars;
  // the default "personal" group and booking groups are system-managed.
  const handleCalendarUpdate = useCallback(
    async (g: CalendarGroupInput) => {
      if (personalCalendarIds.has(g.id)) {
        await updatePersonalCalendar(g.id, {
          name: g.name?.trim() || t("calendar.calendars.untitled"),
          color: g.color,
        });
      }
      setRefreshKey((k) => k + 1);
    },
    [personalCalendarIds, t],
  );

  const handleCalendarDelete = useCallback(
    async (id: string) => {
      if (personalCalendarIds.has(id)) {
        await deletePersonalCalendar(id);
      }
      setRefreshKey((k) => k + 1);
    },
    [personalCalendarIds],
  );

  return (
    <div className="mx-auto flex max-w-full max-h-fit flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("calendar.title")}</h1>
        <p className="text-muted text-sm">{t(`calendar.subtitle.${role}`)}</p>
      </header>

      {status === "loading" ? (
        <div className="border-border bg-surface h-fit !min-h-fit w-full overflow-hidden rounded-xl border" />
      ) : status === "error" ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted text-sm">{t("calendar.states.error")}</p>
          <Button variant="secondary" size="sm" onPress={reload}>
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        /* DayFlow calendar — sidebar shows the legend + mini-calendar natively.
           Double-click a day to add a personal event directly on the grid. */
        <Calendar
          entries={entries}
          categories={categories}
          defaultView="month"
          localeCode={dayflowLocaleCode(lng)}
          messages={messages}
          version={calendarVersion}
          defaultCalendarId={PERSONAL_GROUP}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onCalendarCreate={handleCalendarCreate}
          onCalendarUpdate={handleCalendarUpdate}
          onCalendarDelete={handleCalendarDelete}
          addCalendarSourceLabel={t("calendar.groups.personal")}
        />
      )}
    </div>
  );
}
