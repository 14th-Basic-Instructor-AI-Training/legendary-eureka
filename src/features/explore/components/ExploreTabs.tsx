"use client";

import { useTranslation } from "react-i18next";
import { Map1, Routing2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { useExploreStore } from "../store";
import type { ExploreTab } from "../schema";

const TABS: Array<{ key: ExploreTab; icon: typeof Map1 }> = [
  { key: "destinations", icon: Map1 },
  { key: "tours", icon: Routing2 },
];

/** Destinations ↔ Tours switcher. Controls both the results grid and the sidebar. */
export function ExploreTabs() {
  const { t } = useTranslation();
  const tab = useExploreStore((s) => s.tab);
  const setTab = useExploreStore((s) => s.setTab);

  return (
    <div
      role="tablist"
      aria-label={t("explore.tabs.label")}
      className="bg-surface inline-flex items-center gap-1 rounded-full p-1"
    >
      {TABS.map(({ key, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon size={18} color="currentColor" variant={active ? "Bold" : "Linear"} />
            {t(`explore.tabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
