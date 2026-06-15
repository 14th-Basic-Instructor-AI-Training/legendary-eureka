"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, ShieldTick, UserAdd, Bag2 } from "iconsax-reactjs";
import { formatDate } from "@/lib/format";
import { Panel } from "./Panel";
import type { ComponentType } from "react";
import type { AdminPlatformActivity } from "@/lib/api/admin";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/** Icon + accent token per backend feed `type`. */
const TYPE_META: Record<string, { Icon: IconType; colorVar: string; tintVar: string }> = {
  booking: { Icon: Bag2, colorVar: "--purple", tintVar: "--bg-purple" },
  approval: { Icon: ShieldTick, colorVar: "--green", tintVar: "--bg-lightgreen" },
  registration: { Icon: UserAdd, colorVar: "--primary-lightskyblue", tintVar: "--bg-aliceblue" },
};

const FALLBACK_META = {
  Icon: TickCircle as IconType,
  colorVar: "--blue",
  tintVar: "--bg-blue",
};

/** A short feed of recent moderation events across the platform. */
export function ActivityFeedCard({ items }: { items: AdminPlatformActivity[] }) {
  const { t, i18n } = useTranslation();

  return (
    <Panel title={t("admin.dashboard.feed.title")} subtitle={t("admin.dashboard.feed.subtitle")}>
      {items.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.dashboard.feed.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, i) => {
            const { Icon, colorVar, tintVar } = TYPE_META[item.type] ?? FALLBACK_META;
            return (
              <li key={`${item.type}-${item.occurredAt}-${i}`} className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `var(${tintVar})`, color: `var(${colorVar})` }}
                >
                  <Icon size={16} color="currentColor" variant="Bold" />
                </span>
                <div className="min-w-0">
                  <p className="text-primary text-sm font-medium">{item.label}</p>
                  <p className="text-muted truncate text-sm">{item.detail}</p>
                  <p className="text-muted text-xs">{formatDate(item.occurredAt, i18n.language)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
