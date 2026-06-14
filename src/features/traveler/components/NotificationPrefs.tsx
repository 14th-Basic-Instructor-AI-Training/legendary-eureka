"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useTravelerStore } from "../store";
import type { NotificationEvent } from "../schema";

const EVENTS: NotificationEvent[] = [
  "bookingUpdates",
  "tripReminders",
  "reviewReplies",
  "promotions",
  "productNews",
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted mt-0.5 text-xs">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none",
          checked ? "bg-primary" : "bg-muted/30",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

/** Settings → notification preferences. Toggles persist immediately to the store. */
export function NotificationPrefs() {
  const { t } = useTranslation();
  const { role } = useSession();
  const prefs = useTravelerStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useTravelerStore((s) => s.setNotificationPrefs);

  const toggle = (event: NotificationEvent, value: boolean) => {
    setNotificationPrefs(role, { ...prefs, [event]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      {EVENTS.map((event) => (
        <ToggleRow
          key={event}
          label={t(`settings.notifications.${event}.label`)}
          description={t(`settings.notifications.${event}.description`)}
          checked={prefs[event]}
          onChange={(v) => toggle(event, v)}
        />
      ))}
    </div>
  );
}
