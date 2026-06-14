"use client";

import { useTranslation } from "react-i18next";
import { Switch } from "@/ui";
import { useExploreStore } from "../../store";
import {
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  TOUR_ACTIVITY_OPTIONS,
  TOUR_PROVINCE_OPTIONS,
} from "../../data";
import { FilterGroup } from "./FilterGroup";
import { CheckboxGroup, type CheckboxOption } from "./CheckboxGroup";
import { SearchableSelect } from "./SearchableSelect";
import { RatingFilter } from "./RatingFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { toggleValue } from "./toggleValue";

/** Sidebar filters for the Tours tab. Reads/writes the store. */
export function TourFilters() {
  const { t } = useTranslation();
  const filter = useExploreStore((s) => s.tourFilter);
  const patch = useExploreStore((s) => s.patchTourFilter);

  return (
    <div className="flex flex-col">
      <FilterGroup title={t("explore.filters.destination")}>
        <SearchableSelect
          options={TOUR_PROVINCE_OPTIONS}
          value={filter.province}
          placeholder={t("explore.filters.anyDestination")}
          onChange={(province) => patch({ province })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.activityType")}>
        <CheckboxGroup
          options={TOUR_ACTIVITY_OPTIONS.map(
            (v): CheckboxOption<(typeof TOUR_ACTIVITY_OPTIONS)[number]> => ({
              value: v,
              label: t(`explore.tourActivities.${v}`),
            }),
          )}
          selected={filter.activityTypes}
          onToggle={(v) => patch({ activityTypes: toggleValue(filter.activityTypes, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.dateRange")}>
        <DateRangeFilter
          from={filter.dateFrom}
          to={filter.dateTo}
          onChange={(p) => patch(p)}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.price")}>
        <PriceRangeFilter
          min={filter.priceMin}
          max={filter.priceMax}
          onChange={(priceMin, priceMax) => patch({ priceMin, priceMax })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.duration")}>
        <CheckboxGroup
          options={DURATION_OPTIONS.map(
            (v): CheckboxOption<(typeof DURATION_OPTIONS)[number]> => ({
              value: v,
              label: t(`explore.durations.${v}`),
            }),
          )}
          selected={filter.durations}
          onToggle={(v) => patch({ durations: toggleValue(filter.durations, v) })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.rating")}>
        <RatingFilter
          value={filter.minRating}
          onChange={(minRating) => patch({ minRating })}
        />
      </FilterGroup>

      <FilterGroup title={t("explore.filters.language")}>
        <CheckboxGroup
          options={LANGUAGE_OPTIONS.map(
            (v): CheckboxOption<string> => ({ value: v, label: v }),
          )}
          selected={filter.languages}
          onToggle={(v) => patch({ languages: toggleValue(filter.languages, v) })}
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
