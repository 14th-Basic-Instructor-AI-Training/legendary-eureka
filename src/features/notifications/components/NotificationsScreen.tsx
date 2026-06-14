"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button } from "@/ui";
import { cn } from "@/lib/utils";
import { useLocalizedRouter } from "@/lib/locale";
import { EmptyState } from "@/features/traveler/components/EmptyState";
import { useNotificationsStore } from "../store";
import {
  NotificationFilterSchema,
  type Notification,
  type NotificationFilter,
} from "../schema";
import { NotificationCard } from "./NotificationCard";

const FILTERS = NotificationFilterSchema.options;

/** Traveler notifications inbox: filter tabs + mark-all-read + card list. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const [filter, setFilter] = useState<NotificationFilter>("all");

  const unread = notifications.filter((n) => !n.read).length;
  const visible =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  const open = (n: Notification) => {
    markRead(n.id);
    router.push(n.targetHref);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("notifications.title")}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {unread > 0
              ? t("notifications.unread", { count: unread })
              : t("notifications.allCaughtUp")}
          </p>
        </div>
        {unread > 0 ? (
          <Button variant="secondary" size="sm" onPress={markAllRead}>
            <TickCircle size={16} color="currentColor" />
            {t("notifications.markAllRead")}
          </Button>
        ) : null}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary-lightskyblue bg-primary-lightskyblue/10 text-primary-lightskyblue"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {t(`notifications.filters.${f}`)}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          Icon={TickCircle}
          message={t("notifications.empty.title")}
          hint={t("notifications.empty.hint")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((n) => (
            <NotificationCard key={n.id} notification={n} onOpen={open} />
          ))}
        </div>
      )}
    </div>
  );
}
