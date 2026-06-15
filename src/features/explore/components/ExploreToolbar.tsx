"use client";

import { useTranslation } from "react-i18next";
import { Grid2, RowVertical, Sort, Filter, SearchNormal1 } from "iconsax-reactjs";
import { Input, Select, ListBox } from "@/ui";
import { cn } from "@/lib/utils";
import { useExploreStore } from "../store";
import type { ExploreSort, ExploreView } from "../schema";

const SORTS: readonly ExploreSort[] = ["recommended", "priceAsc", "ratingDesc", "newest"];
const VIEWS: Array<{ key: ExploreView; icon: typeof Grid2 }> = [
  { key: "grid", icon: Grid2 },
  { key: "list", icon: RowVertical },
];

/**
 * Shared results toolbar: search, result count, grid/list view toggle, and the
 * sort dropdown. The mobile "Filters" button opens the off-canvas sidebar.
 */
export function ExploreToolbar({
  count,
  loading,
  onOpenFilters,
}: {
  count: number;
  loading: boolean;
  onOpenFilters: () => void;
}) {
  const { t } = useTranslation();
  const tab = useExploreStore((s) => s.tab);
  const view = useExploreStore((s) => s.view);
  const sort = useExploreStore((s) => s.sort);
  const setView = useExploreStore((s) => s.setView);
  const setSort = useExploreStore((s) => s.setSort);

  const query = useExploreStore((s) =>
    s.tab === "destinations" ? s.destinationFilter.query : s.tourFilter.query,
  );
  const patchDestination = useExploreStore((s) => s.patchDestinationFilter);
  const patchTour = useExploreStore((s) => s.patchTourFilter);
  const setQuery = (value: string) =>
    tab === "destinations" ? patchDestination({ query: value }) : patchTour({ query: value });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="border-border text-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium lg:hidden"
        >
          <Filter size={16} color="currentColor" />
          {t("explore.toolbar.filters")}
        </button>
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3">
          <SearchNormal1 size={18} color="currentColor" className="text-muted shrink-0" />
          <Input
            aria-label={t("explore.toolbar.searchPlaceholder")}
            placeholder={t("explore.toolbar.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus:ring-0"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-muted text-sm" aria-live="polite">
          {loading
            ? t("explore.toolbar.searching")
            : t("explore.toolbar.count", { count })}
        </span>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select
            aria-label={t("explore.toolbar.sortBy")}
            selectedKey={sort}
            onSelectionChange={(key) => key && setSort(String(key) as ExploreSort)}
          >
            <Select.Trigger className="h-10 justify-between gap-2 rounded-lg px-3 text-sm font-medium">
              <span className="text-muted flex items-center gap-1.5">
                <Sort size={16} color="currentColor" />
                <Select.Value />
              </span>
              <Select.Indicator className="text-muted" />
            </Select.Trigger>
            <Select.Popover className="w-fit">
              <ListBox>
                {SORTS.map((s) => (
                  <ListBox.Item
                    key={s}
                    id={s}
                    textValue={t(`explore.sort.${s}`)}
                    className="px-3 py-2.5"
                  >
                    {t(`explore.sort.${s}`)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {/* View toggle */}
          <div className="border-border flex items-center rounded-lg border p-0.5">
            {VIEWS.map(({ key, icon: Icon }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  aria-label={t(`explore.toolbar.view.${key}`)}
                  onClick={() => setView(key)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    active ? "bg-primary text-white" : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon size={18} color="currentColor" variant={active ? "Bold" : "Linear"} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
