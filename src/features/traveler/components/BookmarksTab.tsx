"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { cn } from "@/lib/utils";
import { DestinationCard } from "@/features/destinations/components/DestinationCard";
import { TourCard } from "@/features/destinations/components/TourCard";
import { useResource } from "../hooks";
import {
  getDestinationBookmarks,
  getTourBookmarks,
  getTripPlanBookmarks,
  type Result,
} from "../data";
import type { Bookmark } from "../schema";
import { PlanCard } from "./PlanCard";
import { EmptyState } from "./EmptyState";
import { GridSkeleton, ErrorState } from "./states";

type SubKey = "destinations" | "tours" | "tripPlans";

const SUBTABS: { key: SubKey; getter: () => Promise<Result<Bookmark[]>> }[] = [
  { key: "destinations", getter: getDestinationBookmarks },
  { key: "tours", getter: getTourBookmarks },
  { key: "tripPlans", getter: getTripPlanBookmarks },
];

function renderBookmark(bookmark: Bookmark) {
  switch (bookmark.kind) {
    case "destination":
      return <DestinationCard destination={bookmark.item} />;
    case "tour":
      return <TourCard tour={bookmark.item} />;
    case "tripPlan":
      return <PlanCard plan={bookmark.item} />;
  }
}

/** One bookmarks sub-tab — owns its data load so it remounts cleanly per tab. */
function BookmarkPanel({ getter }: { getter: () => Promise<Result<Bookmark[]>> }) {
  const { t } = useTranslation();
  const resource = useResource(getter);

  if (resource.status === "loading") return <GridSkeleton />;
  if (resource.status === "error") return <ErrorState onRetry={resource.reload} />;
  if (!resource.data || resource.data.length === 0) {
    return <EmptyState Icon={Heart} message={t("bookmarks.empty")} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {resource.data.map((bookmark, i) => (
        <Reveal key={bookmark.id} delay={Math.min(i, 3) * 0.05}>
          {renderBookmark(bookmark)}
        </Reveal>
      ))}
    </div>
  );
}

/** Bookmarks tab: saved Destinations · Tours · Trip Plans behind sub-tabs. */
export function BookmarksTab() {
  const { t } = useTranslation();
  const [active, setActive] = useState<SubKey>("destinations");
  const current = SUBTABS.find((s) => s.key === active) ?? SUBTABS[0];

  return (
    <section className="flex flex-col gap-5">
      <div className="border-border flex gap-1 border-b">
        {SUBTABS.map(({ key }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActive(key)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "text-muted hover:text-foreground border-transparent",
              )}
            >
              {t(`bookmarks.subtabs.${key}`)}
            </button>
          );
        })}
      </div>

      <BookmarkPanel key={active} getter={current.getter} />
    </section>
  );
}
