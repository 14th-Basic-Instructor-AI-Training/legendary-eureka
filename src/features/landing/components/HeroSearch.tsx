"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SearchNormal1,
  Location,
  Calendar,
  Profile2User,
  Map1,
  MagicStar,
} from "iconsax-reactjs";
import { Button, Input, Select, ListBox, DatePicker, NumberStepper } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { PROVINCES } from "@/features/destinations/data";
import { ACTIVITY_FOCUS_OPTIONS } from "@/features/explore/data";
import { useExploreStore } from "@/features/explore/store";
import {
  EMPTY_DESTINATION_FILTER,
  EMPTY_TOUR_FILTER,
  type ActivityFocus,
} from "@/features/explore/schema";

const TABS = ["tours", "destinations", "activities"] as const;
type SearchTab = (typeof TABS)[number];

/** Sentinel for the "any province" / "all regions" option (maps to `undefined`). */
const ANY = "__all__";

/** An iconsax glyph component (exact prop type, incl. the `variant` union). */
type FieldIcon = typeof SearchNormal1;

/** Iconsax glyph for each tab's docked pill (pin · map · sparkle). */
const TAB_ICON: Record<SearchTab, FieldIcon> = {
  tours: Location,
  destinations: Map1,
  activities: MagicStar,
};

/**
 * One segment of the horizontal search bar: an uppercase label stacked over an
 * accent icon + control, so the row reads as a single connected bar (the icon is
 * optional — controls that ship their own glyph, e.g. the date picker, pass none).
 */
function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: FieldIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1 px-4 py-3", className)}>
      <span className="text-muted text-[11px] font-bold tracking-[0.06em] uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon size={17} color="currentColor" variant="Bold" className="text-primary shrink-0" />
        ) : null}
        {children}
      </div>
    </div>
  );
}

/**
 * Hero search bar — the design-handoff's horizontal segmented search (tabs docked
 * on top of a white panel, accent-iconed fields split by dividers, one solid
 * Search button), adapted to the landing page's light hero. Fields stay functional:
 * Search seeds `useExploreStore` (tab + filter) and routes to `/explore` so the
 * results page reflects the input. The design's teal accent maps to the project's
 * `primary` brand token. The "Plan a trip" CTA lives in the hero's left column.
 */
export function HeroSearch() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  const [tab, setTab] = useState<SearchTab>("tours");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [interest, setInterest] = useState<ActivityFocus | undefined>(undefined);
  const [date, setDate] = useState("");
  // Travelers is display-only: there is no capacity filter in the backend yet, so
  // it is intentionally not passed to the explore store on search.
  const [travelers, setTravelers] = useState(2);

  const f = (key: string) => t(`landing.heroSearch.fields.${key}`);
  const ph = (key: string) => t(`landing.heroSearch.placeholder.${key}`);

  const handleSearch = () => {
    const { setTab: setExploreTab, patchTourFilter, patchDestinationFilter } =
      useExploreStore.getState();

    if (tab === "destinations") {
      setExploreTab("destinations");
      patchDestinationFilter({
        ...EMPTY_DESTINATION_FILTER,
        query,
        province,
        activityFocus: interest ? [interest] : [],
      });
    } else {
      // Tours and Activities both resolve to the explore "tours" tab; the keyword
      // (incl. an activity term) becomes the free-text query.
      setExploreTab("tours");
      patchTourFilter({
        ...EMPTY_TOUR_FILTER,
        query,
        province,
        dateFrom: date || undefined,
      });
    }
    router.push("/explore");
  };

  // ── Reusable controls (borderless so they blend into the bar) ───────────────
  const keywordInput = (
    <Input
      aria-label={f(`${tab}.keyword`)}
      placeholder={ph(`${tab}.keyword`)}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="text-foreground placeholder:text-text-input-color flex-1 border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0"
    />
  );

  const provinceSelect = (placeholderKey: string, label: string) => (
    <Select
      aria-label={label}
      selectedKey={province ?? ANY}
      onSelectionChange={(key) =>
        setProvince(key === ANY || key === null ? undefined : String(key))
      }
      className="flex-1"
    >
      <Select.Trigger className="h-7 w-full justify-between gap-2 border-0 bg-transparent px-0 text-sm font-medium shadow-none">
        <Select.Value />
        <Select.Indicator className="text-text-input-color" />
      </Select.Trigger>
      <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
        <ListBox>
          <ListBox.Item id={ANY} textValue={ph(placeholderKey)} className="px-3 py-2.5">
            {ph(placeholderKey)}
          </ListBox.Item>
          {PROVINCES.map((p) => (
            <ListBox.Item key={p} id={p} textValue={p} className="px-3 py-2.5">
              {p}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );

  const interestSelect = (
    <Select
      aria-label={f("destinations.interest")}
      selectedKey={interest ?? ANY}
      onSelectionChange={(key) =>
        setInterest(key === ANY || key === null ? undefined : (String(key) as ActivityFocus))
      }
      className="flex-1"
    >
      <Select.Trigger className="h-7 w-full justify-between gap-2 border-0 bg-transparent px-0 text-sm font-medium shadow-none">
        <Select.Value />
        <Select.Indicator className="text-text-input-color" />
      </Select.Trigger>
      <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
        <ListBox>
          <ListBox.Item
            id={ANY}
            textValue={ph("destinations.interest")}
            className="px-3 py-2.5"
          >
            {ph("destinations.interest")}
          </ListBox.Item>
          {ACTIVITY_FOCUS_OPTIONS.map((a) => (
            <ListBox.Item key={a} id={a} textValue={a} className="px-3 py-2.5">
              {a}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );

  const dateField = (
    <DatePicker
      aria-label={f(`${tab}.when`)}
      value={date}
      onChange={setDate}
      className="border-0 bg-transparent py-0 pl-7 text-sm font-medium shadow-none focus:ring-0"
    />
  );

  const travelersStepper = (
    <NumberStepper
      label={t("landing.heroSearch.travelersValue", { count: travelers })}
      value={travelers}
      onChange={setTravelers}
      min={1}
      max={20}
      className="flex-1"
    />
  );

  const renderFields = () => {
    if (tab === "destinations") {
      return (
        <>
          <Field label={f("destinations.keyword")} icon={SearchNormal1}>
            {keywordInput}
          </Field>
          <Field label={f("destinations.region")} icon={Location}>
            {provinceSelect("destinations.region", f("destinations.region"))}
          </Field>
          <Field label={f("destinations.interest")} icon={MagicStar}>
            {interestSelect}
          </Field>
        </>
      );
    }
    if (tab === "activities") {
      return (
        <>
          <Field label={f("activities.keyword")} icon={MagicStar}>
            {keywordInput}
          </Field>
          <Field label={f("activities.province")} icon={Location}>
            {provinceSelect("activities.province", f("activities.province"))}
          </Field>
          <Field label={f("activities.when")} icon={Calendar}>
            {dateField}
          </Field>
        </>
      );
    }
    // tours
    return (
      <>
        <Field label={f("tours.keyword")} icon={SearchNormal1}>
          {keywordInput}
        </Field>
        <Field label={f("tours.province")} icon={Location}>
          {provinceSelect("tours.province", f("tours.province"))}
        </Field>
        <Field label={f("tours.when")} icon={Calendar}>
          {dateField}
        </Field>
        <Field label={f("tours.travelers")} icon={Profile2User}>
          {travelersStepper}
        </Field>
      </>
    );
  };

  return (
    <div className="w-full">
      {/* Docked tabs */}
      <div className="flex gap-1 pl-1" role="tablist" aria-label={t("landing.heroSearch.tabs.tours")}>
        {TABS.map((tb) => {
          const Icon = TAB_ICON[tb];
          const active = tab === tb;
          return (
            <button
              key={tb}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tb)}
              className={cn(
                "flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors sm:px-5",
                active
                  ? "bg-surface text-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                  : "bg-background/50 text-muted hover:text-foreground",
              )}
            >
              <Icon
                size={15}
                color="currentColor"
                variant="Bold"
                className={active ? "text-primary" : "text-muted"}
              />
              {t(`landing.heroSearch.tabs.${tb}`)}
            </button>
          );
        })}
      </div>

      {/* Search panel */}
      <div className="bg-surface shadow-primary border-border rounded-2xl rounded-tl-none border p-2">
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div className="divide-border flex flex-1 flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
            {renderFields()}
          </div>
          <div className="flex items-center p-2 md:pl-2">
            <Button
              variant="primary"
              size="lg"
              onPress={handleSearch}
              className="w-full gap-2 md:w-auto"
            >
              <SearchNormal1 size={18} color="currentColor" />
              {t("landing.heroSearch.search")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
