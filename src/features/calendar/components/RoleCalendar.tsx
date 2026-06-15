"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Calendar, type CalendarCategory, type CalendarEntry } from "@/ui";
import { useResource } from "@/lib/useResource";
import type { Role } from "@/features/auth/schema";
import { eventsGetterFor } from "../data";
import type { CalendarEvent, CalendarEventType } from "../schema";

/**
 * Shared per-role calendar screen. Loads role-scoped events via the `data.ts`
 * seam, renders loading / error / empty / success explicitly, and feeds the
 * `@/ui` Calendar (DayFlow) with colour-coded, localized entries + legend.
 */

/** Base colour per event type — drives the chip colour and legend dot. */
const TYPE_COLOR: Record<CalendarEventType, string> = {
  booking: "#2F6FED",
  tripPlan: "#10B981",
  availability: "#F59E0B",
};

/** DayFlow ships only an `en` locale; map ours to its nearest base code. */
function dayflowLocaleCode(lng: string): string {
  return lng === "kr" ? "ko" : "en";
}

export function RoleCalendar({ role }: { role: Role }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const getter = eventsGetterFor(role);
  const { status, data, reload } = useResource(getter);

  const entries = useMemo<CalendarEntry[]>(
    () => (data ?? []).map((e: CalendarEvent) => ({
      id: e.id,
      title: e.title,
      description: [e.subtitle, e.status ? t(`status.${e.status}`) : null]
        .filter(Boolean)
        .join(" · "),
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      categoryId: e.type,
    })),
    [data, t],
  );

  // Legend reflects only the event types actually present for this role.
  const categories = useMemo<CalendarCategory[]>(() => {
    const present = new Set((data ?? []).map((e) => e.type));
    return [...present].map((type) => ({
      id: type,
      name: t(`calendar.types.${type}`),
      color: TYPE_COLOR[type],
    }));
  }, [data, t]);

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

  return (
    <div className="mx-auto flex h-full max-w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("calendar.title")}</h1>
        <p className="text-muted text-sm">{t(`calendar.subtitle.${role}`)}</p>
      </header>

      {status === "loading" ? (
        <div className="border-border bg-surface h-[72vh] w-full animate-pulse rounded-xl border" />
      ) : status === "error" ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted text-sm">{t("calendar.states.error")}</p>
          <Button variant="secondary" size="sm" onPress={reload}>
            {t("common.retry")}
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted text-sm">{t("calendar.states.empty")}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-muted text-xs font-semibold tracking-wider uppercase">
              {t("calendar.legend.title")}
            </span>
            {categories.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                />
                {c.name}
              </span>
            ))}
          </div>

          <Calendar
            entries={entries}
            categories={categories}
            defaultView="month"
            localeCode={dayflowLocaleCode(lng)}
            messages={messages}
          />
        </>
      )}
    </div>
  );
}
