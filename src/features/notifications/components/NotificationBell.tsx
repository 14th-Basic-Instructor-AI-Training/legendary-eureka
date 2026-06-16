"use client";

import { useTranslation } from "react-i18next";
import { Notification as BellIcon } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { useLocalizedRouter } from "@/lib/locale";
import { useNotificationsStore } from "../store";
import { KNOCK_ENABLED } from "../knock-config";
import { useKnockFeed } from "../useKnockFeed";

/**
 * Header bell with a live unread badge, linking to the notifications inbox.
 * Same data-source split as the inbox: Knock feed when configured (real-time
 * count), otherwise the local fixture store. `KNOCK_ENABLED` is a build-time
 * constant so exactly one branch component mounts (rules of hooks hold).
 */
export function NotificationBell({ href }: { href: string }) {
  return KNOCK_ENABLED ? (
    <KnockBell href={href} />
  ) : (
    <StoreBell href={href} />
  );
}

function KnockBell({ href }: { href: string }) {
  const { unread } = useKnockFeed();
  return <BellButton href={href} unread={unread} />;
}

function StoreBell({ href }: { href: string }) {
  const unread = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
  return <BellButton href={href} unread={unread} />;
}

function BellButton({ href, unread }: { href: string; unread: number }) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      aria-label={
        unread > 0
          ? t("notifications.unread", { count: unread })
          : t("notifications.title")
      }
      className="hover:bg-surface relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
    >
      <BellIcon
        size={20}
        color="currentColor"
        variant="Linear"
        className="text-foreground"
      />
      {unread > 0 ? (
        <span
          className={cn(
            "bg-danger absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center",
            "justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white",
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </button>
  );
}
