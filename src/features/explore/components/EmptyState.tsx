"use client";

import { useTranslation } from "react-i18next";
import { SearchNormal1 } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useExploreStore } from "../store";

/** Shown when the active filters match nothing. Offers a one-tap reset. */
export function EmptyState() {
  const { t } = useTranslation();
  const clearFilters = useExploreStore((s) => s.clearFilters);

  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
      <span className="bg-surface text-muted flex h-16 w-16 items-center justify-center rounded-full">
        <SearchNormal1 size={28} color="currentColor" />
      </span>
      <div>
        <p className="text-foreground font-semibold">{t("explore.states.emptyTitle")}</p>
        <p className="text-muted mt-1 text-sm">{t("explore.states.emptyHint")}</p>
      </div>
      <Button variant="secondary" size="sm" onPress={clearFilters}>
        {t("explore.filters.clearAll")}
      </Button>
    </div>
  );
}
