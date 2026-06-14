"use client";

import { useTranslation } from "react-i18next";
import { SearchNormal1, CloseCircle } from "iconsax-reactjs";
import { Button, Input, Select, ListBox } from "@/ui";
import { PROVINCES, TRAVEL_TYPES } from "../data";
import type { DiscoverFilter, TravelType } from "../schema";

const ALL = "__all__";

/**
 * Discover search + filter bar: free-text query + province + travel-type selects.
 * Controlled — lifts all state to the parent `DiscoverScreen` via `onChange`
 * (a shallow patch merge), so the filter is the single source of truth.
 */
export function DiscoverSearchBar({
  filter,
  onChange,
  onClear,
}: {
  filter: DiscoverFilter;
  onChange: (patch: Partial<DiscoverFilter>) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();

  const hasFilters =
    Boolean(filter.query.trim()) ||
    Boolean(filter.province) ||
    Boolean(filter.travelType) ||
    Boolean(filter.category);

  return (
    <div className="bg-surface/95 flex w-full flex-col gap-2 rounded-2xl p-2 shadow-primary backdrop-blur md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-2">
        <div className="text-text-input-color pl-2">
          <SearchNormal1 size={20} color="currentColor" />
        </div>
        <Input
          aria-label={t("discover.search.placeholder")}
          placeholder={t("discover.search.placeholder")}
          value={filter.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="flex-1 border-0 bg-transparent shadow-none focus:ring-0"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Province */}
        <Select
          aria-label={t("discover.search.province")}
          selectedKey={filter.province ?? ALL}
          onSelectionChange={(key) =>
            onChange({ province: key === ALL || key === null ? undefined : String(key) })
          }
          className="w-full md:w-auto"
        >
          <Select.Trigger className="h-10 w-full justify-between gap-3 rounded-lg px-3 text-sm font-medium md:w-44">
            <Select.Value />
            <Select.Indicator className="text-text-input-color" />
          </Select.Trigger>
          <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
            <ListBox>
              <ListBox.Item id={ALL} textValue={t("discover.search.allProvinces")} className="px-3 py-2.5">
                {t("discover.search.allProvinces")}
              </ListBox.Item>
              {PROVINCES.map((p) => (
                <ListBox.Item key={p} id={p} textValue={p} className="px-3 py-2.5">
                  {p}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* Travel type */}
        <Select
          aria-label={t("discover.search.travelType")}
          selectedKey={filter.travelType ?? ALL}
          onSelectionChange={(key) =>
            onChange({
              travelType: key === ALL || key === null ? undefined : (String(key) as TravelType),
            })
          }
          className="w-full md:w-auto"
        >
          <Select.Trigger className="h-10 w-full justify-between gap-3 rounded-lg px-3 text-sm font-medium md:w-44">
            <Select.Value />
            <Select.Indicator className="text-text-input-color" />
          </Select.Trigger>
          <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
            <ListBox>
              <ListBox.Item id={ALL} textValue={t("discover.search.allTypes")} className="px-3 py-2.5">
                {t("discover.search.allTypes")}
              </ListBox.Item>
              {TRAVEL_TYPES.map((tt) => (
                <ListBox.Item
                  key={tt}
                  id={tt}
                  textValue={t(`discover.travelTypes.${tt.toLowerCase()}`)}
                  className="px-3 py-2.5"
                >
                  {t(`discover.travelTypes.${tt.toLowerCase()}`)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {hasFilters ? (
          <Button
            variant="secondary"
            size="md"
            onPress={onClear}
            aria-label={t("discover.search.clear")}
            className="shrink-0"
          >
            <span className="flex items-center gap-1.5">
              <CloseCircle size={16} color="currentColor" />
              <span className="hidden sm:inline">{t("discover.search.clear")}</span>
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
