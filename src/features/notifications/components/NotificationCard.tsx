"use client";

import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight2,
  Calendar,
  Clock,
  CloseCircle,
  Flag,
  Message,
  Messages2,
  Notification as NotificationIcon,
  TickCircle,
} from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { Notification, NotificationType } from "../schema";

type IconType = ComponentType<{
  size?: number;
  color?: string;
  variant?: "Bold" | "Linear";
  className?: string;
}>;

/** Icon + tint per notification type. */
const META: Record<
  NotificationType,
  { Icon: IconType; tint: string; bg: string }
> = {
  "booking-requested": {
    Icon: Calendar,
    tint: "text-primary-lightskyblue",
    bg: "bg-primary-lightskyblue/10",
  },
  "booking-approved": {
    Icon: TickCircle,
    tint: "text-success",
    bg: "bg-success/10",
  },
  "booking-rejected": {
    Icon: CloseCircle,
    tint: "text-danger",
    bg: "bg-danger/10",
  },
  "booking-completed": {
    Icon: TickCircle,
    tint: "text-success",
    bg: "bg-success/10",
  },
  "booking-cancelled": {
    Icon: CloseCircle,
    tint: "text-danger",
    bg: "bg-danger/10",
  },
  reminder: { Icon: Clock, tint: "text-amber-600", bg: "bg-amber-500/10" },
  comment: {
    Icon: Message,
    tint: "text-primary-lightskyblue",
    bg: "bg-primary-lightskyblue/10",
  },
  reply: {
    Icon: Messages2,
    tint: "text-primary-lightskyblue",
    bg: "bg-primary-lightskyblue/10",
  },
  "report-update": { Icon: Flag, tint: "text-foreground", bg: "bg-surface" },
  system: { Icon: NotificationIcon, tint: "text-foreground", bg: "bg-surface" },
};

/** One notification row. Click marks it read and navigates to its target. */
export function NotificationCard({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}) {
  const { t, i18n } = useTranslation();
  const { Icon, tint, bg } = META[notification.type];
  const unread = !notification.read;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        "flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-shadow hover:shadow-md",
        unread
          ? "border-primary-lightskyblue/30 bg-primary-lightskyblue/5"
          : "border-border bg-background",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          bg,
        )}
      >
        <Icon size={20} color="currentColor" variant="Bold" className={tint} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-semibold">
            {notification.title}
          </p>
          {unread ? (
            <span className="bg-primary-lightskyblue h-2 w-2 shrink-0 rounded-full" />
          ) : null}
        </div>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          {notification.body}
        </p>
        <p className="text-muted mt-1.5 flex items-center gap-1.5 text-xs">
          <Clock size={12} color="currentColor" variant="Bold" />
          {formatRelativeTime(notification.createdAt, i18n.language)}
        </p>
      </div>

      <ArrowRight2
        size={18}
        color="currentColor"
        className="text-muted mt-1 shrink-0"
        aria-hidden
      />
      <span className="sr-only">{t("notifications.open")}</span>
    </button>
  );
}
