"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { cn } from "@/lib/utils";
import { DestinationCard } from "@/features/destinations/components/DestinationCard";
import { TourCard } from "@/features/destinations/components/TourCard";
import { useTravelerProfileData } from "../context";
import type { Bookmark } from "../schema";
import { PlanCard } from "./PlanCard";
import { EmptyState } from "./EmptyState";

type SubKey = "destinations" | "tours" | "tripPlans";

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

/** Bookmarks tab: saved Destinations · Tours · Trip Plans behind sub-tabs. */
export function BookmarksTab() {
  const { t } = useTranslation();
  const [active, setActive] = useState<SubKey>("destinations");
  const { bookmarks } = useTravelerProfileData();

  const visible =
    active === "destinations"
      ? bookmarks
      : active === "tours"
        ? bookmarks.filter((b) => b.kind === "tour")
        : bookmarks.filter((b) => b.kind === "tripPlan");

  return (
    <section className="flex flex-col gap-5">
      <div className="border-border flex gap-1 border-b">
        {(["destinations", "tours", "tripPlans"] as SubKey[]).map((key) => {
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

      {visible.length === 0 ? (
        <EmptyState Icon={Heart} message={t("bookmarks.empty")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((bookmark, i) => (
            <Reveal key={bookmark.id} delay={Math.min(i, 3) * 0.05}>
              {renderBookmark(bookmark)}
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
