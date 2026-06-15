"use client";

import { useTranslation } from "react-i18next";
import { Switch } from "@/ui";
import { useExploreStore } from "../../store";
import {
  ACTIVITY_FOCUS_OPTIONS,
  DESTINATION_PROVINCE_OPTIONS,
  REGION_OPTIONS,
  REGION_TYPE_OPTIONS,
  SEASON_OPTIONS,
} from "../../data";
import { FilterGroup } from "./FilterGroup";
import { CheckboxGroup, type CheckboxOption } from "./CheckboxGroup";
import { SearchableSelect } from "./SearchableSelect";
import { toggleValue } from "./toggleValue";

/** Sidebar filters for the Destinations tab. Reads/writes the store. */
export function DestinationFilters() {
  const { t } = useTranslation();
  const filter = useExploreStore((s) => s.destinationFilter);
  const patch = useExploreStore((s) => s.patchDestinationFilter);

  const opts = <T extends string>(
    values: readonly T[],
    ns: string,
  ): CheckboxOption<T>[] => values.map((v) => ({ value: v, label: t(`explore.${ns}.${v}`) }));

  return (
    <div className="flex flex-col">
      <FilterGroup title={t("explore.filters.region")}>
        <CheckboxGroup
          options={opts(REGION_OPTIONS, "regions")}
          selected={filter.regions}
          onToggle={(v) => patch({ regions: toggleValue(filter.regions, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.province")}>
        <SearchableSelect
          options={DESTINATION_PROVINCE_OPTIONS}
          value={filter.province}
          placeholder={t("explore.filters.anyProvince")}
          onChange={(province) => patch({ province })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.season")}>
        <CheckboxGroup
          options={opts(SEASON_OPTIONS, "seasons")}
          selected={filter.seasons}
          onToggle={(v) => patch({ seasons: toggleValue(filter.seasons, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.regionType")}>
        <CheckboxGroup
          options={opts(REGION_TYPE_OPTIONS, "regionTypes")}
          selected={filter.regionTypes}
          onToggle={(v) => patch({ regionTypes: toggleValue(filter.regionTypes, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.activityFocus")}>
        <CheckboxGroup
          options={opts(ACTIVITY_FOCUS_OPTIONS, "activityFocus")}
          selected={filter.activityFocus}
          onToggle={(v) => patch({ activityFocus: toggleValue(filter.activityFocus, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.familyFriendly")}>
        <Switch
          label={t("explore.filters.familyFriendlyLabel")}
          checked={filter.familyFriendly}
          onCheckedChange={(familyFriendly) => patch({ familyFriendly })}
        />
      </FilterGroup>
    </div>
  );
}
