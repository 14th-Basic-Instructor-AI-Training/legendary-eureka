"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Calendar, Heart, Star1, TickCircle, Airplane } from "iconsax-reactjs";
import { Card, Skeleton, StatusChip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { formatDate } from "@/lib/format";
import { useTravelerStore } from "../store";
import { useResource } from "../hooks";
import { getRecentActivity } from "../data";
import type { ActivityKind } from "../schema";
import { EmptyState } from "./EmptyState";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

const ACTIVITY_ICON: Record<ActivityKind, IconType> = {
  bookmark: Heart,
  review: Star1,
  completedTrip: TickCircle,
};

/** Overview tab: a peek at upcoming trips + a recent-activity feed. */
export function OverviewTab() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();

  const bookings = useTravelerStore((s) => s.bookings);
  const activity = useResource(getRecentActivity);

  const upcoming = bookings
    .filter((b) => b.status === "pending" || b.status === "approved")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 2);

  return (
    <section className="flex flex-col gap-6">
      {/* Upcoming trips */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{t("profile.overview.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <EmptyState Icon={Airplane} message={t("profile.overview.noUpcoming")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {upcoming.map((b) => (
              <Card
                key={b.id}
                className="bg-background border-border flex items-center gap-3 rounded-2xl border p-3 shadow-sm"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={b.tour.thumbnail}
                    alt={b.tour.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{b.tour.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Calendar size={13} color="currentColor" variant="Bold" />
                    {formatDate(b.startDate, lng)}
                  </p>
                  <div className="mt-1.5">
                    <StatusChip status={b.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("profile.overview.recentActivity")}
        </h2>
        {activity.status === "loading" ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : activity.status === "error" || !activity.data || activity.data.length === 0 ? (
          <EmptyState message={t("profile.overview.noActivity")} />
        ) : (
          <Card className="bg-background border-border divide-border divide-y rounded-2xl border shadow-sm">
            {activity.data.map((item) => {
              const Icon = ACTIVITY_ICON[item.kind];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push("/traveler/profile?tab=bookings")}
                  className="hover:bg-surface/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                >
                  <span className="bg-primary/10 text-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon size={17} color="currentColor" variant="Bold" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="text-foreground">
                      {t(`profile.overview.activity.${item.kind}`, { subject: item.subject })}
                    </span>
                  </span>
                  <span className="text-muted shrink-0 text-xs">{formatDate(item.at, lng)}</span>
                </button>
              );
            })}
          </Card>
        )}
      </div>
    </section>
  );
}
