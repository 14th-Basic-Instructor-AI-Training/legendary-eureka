"use client";

import type { ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Element4, Heart, Map1, Receipt21, Star1, Setting2 } from "iconsax-reactjs";
import { Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { OverviewTab } from "./OverviewTab";
import { BookmarksTab } from "./BookmarksTab";
import { TripPlansTab } from "./TripPlansTab";
import { BookingHistoryTab } from "./BookingHistoryTab";
import { ReviewsTab } from "./ReviewsTab";
import { SettingsTab } from "./SettingsTab";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

type TabKey = "overview" | "bookmarks" | "tripPlans" | "bookings" | "reviews" | "settings";

const TABS: { key: TabKey; Icon: IconType; Panel: ComponentType }[] = [
  { key: "overview", Icon: Element4, Panel: OverviewTab },
  { key: "bookmarks", Icon: Heart, Panel: BookmarksTab },
  { key: "tripPlans", Icon: Map1, Panel: TripPlansTab },
  { key: "bookings", Icon: Receipt21, Panel: BookingHistoryTab },
  { key: "reviews", Icon: Star1, Panel: ReviewsTab },
  { key: "settings", Icon: Setting2, Panel: SettingsTab },
];

function isTabKey(value: string | null): value is TabKey {
  return value !== null && TABS.some((tab) => tab.key === value);
}

/**
 * Profile section nav: a top horizontal tab bar (HeroUI Tabs), mirroring the
 * agency workspace. The active tab is the single source of truth via the `?tab=`
 * query param (deep-linkable + survives refresh); React Aria mounts only the
 * active panel, so each tab's data load still fires lazily on selection.
 */
export function ProfileTabs() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const active: TabKey = isTabKey(raw) ? raw : "overview";

  return (
    <Tabs
      selectedKey={active}
      onSelectionChange={(key) => router.replace(`/traveler/profile?tab=${String(key)}`)}
      variant="primary"
    >
      <Tabs.List aria-label={t("profile.title")}>
        {TABS.map(({ key, Icon }) => (
          <Tabs.Tab key={key} id={key}>
            <span className="flex items-center gap-1.5">
              <Icon size={16} color="currentColor" variant={key === active ? "Bold" : "Linear"} />
              {t(`profile.tabs.${key}`)}
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {TABS.map(({ key, Panel }) => (
        <Tabs.Panel key={key} id={key} className="pt-6">
          <Panel />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
