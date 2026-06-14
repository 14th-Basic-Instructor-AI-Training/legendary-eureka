"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, ShieldTick, Edit2, UserAdd } from "iconsax-reactjs";
import { Panel } from "./Panel";
import type { ComponentType } from "react";
import type { ActivityFeedItem } from "../../schema";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/** Icon + accent token per moderation event kind. */
const KIND_META: Record<ActivityFeedItem["kind"], { Icon: IconType; colorVar: string; tintVar: string }> = {
  agencyApproved: { Icon: TickCircle, colorVar: "--green", tintVar: "--bg-lightgreen" },
  reportResolved: { Icon: ShieldTick, colorVar: "--blue", tintVar: "--bg-blue" },
  activityEdited: { Icon: Edit2, colorVar: "--purple", tintVar: "--bg-purple" },
  userJoined: { Icon: UserAdd, colorVar: "--primary-lightskyblue", tintVar: "--bg-aliceblue" },
};

/** A short feed of recent moderation events across the platform. */
export function ActivityFeedCard({ items }: { items: ActivityFeedItem[] }) {
  const { t } = useTranslation();

  return (
    <Panel title={t("admin.dashboard.feed.title")} subtitle={t("admin.dashboard.feed.subtitle")}>
      {items.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.dashboard.feed.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const { Icon, colorVar, tintVar } = KIND_META[item.kind];
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `var(${tintVar})`, color: `var(${colorVar})` }}
                >
                  <Icon size={16} color="currentColor" variant="Bold" />
                </span>
                <div className="min-w-0">
                  <p className="text-primary text-sm">
                    {t(`admin.dashboard.feed.kinds.${item.kind}`, { subject: item.subject })}
                  </p>
                  <p className="text-muted text-xs">{item.timeLabel}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
