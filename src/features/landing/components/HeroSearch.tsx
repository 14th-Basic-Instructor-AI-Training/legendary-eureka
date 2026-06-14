"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchNormal1, Location, ArrowRight, Profile2User } from "iconsax-reactjs";
import { Button, Input, Select, ListBox, DatePicker, NumberStepper, Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { PROVINCES } from "@/features/destinations/data";

const TABS = ["tours", "destinations", "activities"] as const;
type SearchTab = (typeof TABS)[number];
const ANY_PROVINCE = "__all__";

/** Small framed label + control cell so the multi-field search reads as one bar. */
function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-col gap-1 rounded-xl border px-3 py-2 md:border-0 md:px-0 md:py-0",
        className,
      )}
    >
      <span className="text-muted px-1 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Hero search panel — the tabbed search the brief asks for, on HeroUI `Tabs`
 * (Tours · Destinations · Activities). The tabs share one keyword + location +
 * date + traveler-count filter; the placeholder swaps per tab and the Destinations
 * tab adds a check-out date (date range). One primary "Search" CTA opens the browse
 * page. The "Plan a trip" CTA lives in the hero's left column (see `Hero.tsx`).
 */
export function HeroSearch() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  const [tab, setTab] = useState<SearchTab>("tours");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [travelers, setTravelers] = useState(2);

  const exploreNow = () => router.push("/destinations");
  const isRange = tab === "destinations";

  const renderFields = () => (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end md:gap-4 md:divide-x md:divide-border">
        <Field label={t("landing.heroSearch.keyword")} className="md:pr-4">
          <div className="flex items-center gap-2">
            <SearchNormal1 size={18} color="currentColor" className="text-primary shrink-0" />
            <Input
              aria-label={t("landing.heroSearch.keyword")}
              placeholder={t(`landing.heroSearch.placeholder.${tab}`)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
            />
          </div>
        </Field>

        <Field label={t("landing.heroSearch.location")} className="md:px-4">
          <div className="flex items-center gap-2">
            <Location size={18} color="currentColor" variant="Bold" className="text-primary shrink-0" />
            <Select
              aria-label={t("landing.heroSearch.location")}
              selectedKey={province ?? ANY_PROVINCE}
              onSelectionChange={(key) =>
                setProvince(key === ANY_PROVINCE || key === null ? undefined : String(key))
              }
              className="flex-1"
            >
              <Select.Trigger className="h-9 w-full justify-between gap-2 border-0 px-0 text-sm font-medium shadow-none">
                <Select.Value />
                <Select.Indicator className="text-text-input-color" />
              </Select.Trigger>
              <Select.Popover className="w-fit max-w-[calc(100vw-2rem)]">
                <ListBox>
                  <ListBox.Item
                    id={ANY_PROVINCE}
                    textValue={t("discover.search.allProvinces")}
                    className="px-3 py-2.5"
                  >
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
          </div>
        </Field>

        <Field
          label={isRange ? t("landing.heroSearch.dateFrom") : t("landing.heroSearch.date")}
          className="md:px-4"
        >
          <DatePicker
            aria-label={isRange ? t("landing.heroSearch.dateFrom") : t("landing.heroSearch.date")}
            value={dateFrom}
            onChange={setDateFrom}
            className="border-0 bg-transparent px-0 pl-7 shadow-none focus:ring-0"
          />
          {isRange ? (
            <DatePicker
              label={t("landing.heroSearch.dateTo")}
              aria-label={t("landing.heroSearch.dateTo")}
              value={dateTo}
              onChange={setDateTo}
              min={dateFrom || undefined}
              className="mt-2 border-0 bg-transparent px-0 pl-7 shadow-none focus:ring-0"
            />
          ) : null}
        </Field>

        <Field label={t("landing.heroSearch.travelers")} className="md:pl-4">
          <div className="flex items-center gap-2">
            <Profile2User size={18} color="currentColor" variant="Bold" className="text-primary shrink-0" />
            <NumberStepper
              label={t("landing.heroSearch.travelersValue", { count: travelers })}
              value={travelers}
              onChange={setTravelers}
              min={1}
              max={20}
              className="flex-1"
            />
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Button variant="primary" size="lg" className="w-full sm:w-auto" onPress={exploreNow}>
          {t("landing.heroSearch.exploreNow")}
          <ArrowRight size={18} color="currentColor" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="bg-surface/95 shadow-primary border-border w-full rounded-3xl border p-3 backdrop-blur sm:p-4">
      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key as SearchTab)}
        variant="primary"
      >
        <Tabs.List aria-label={t("landing.heroSearch.keyword")}>
          {TABS.map((tb) => (
            <Tabs.Tab key={tb} id={tb}>
              {t(`landing.heroSearch.tabs.${tb}`)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {TABS.map((tb) => (
          <Tabs.Panel key={tb} id={tb} className="pt-4">
            {renderFields()}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
