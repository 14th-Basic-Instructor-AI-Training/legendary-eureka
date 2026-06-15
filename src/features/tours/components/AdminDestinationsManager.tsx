"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Add, Location } from "iconsax-reactjs";
import { Button, Chip, Tabs } from "@/ui";
import { formatPrice } from "@/lib/format";
import { DestinationForm } from "./DestinationForm";
import type { DestinationResponse } from "@/lib/api/activities";

type DestinationTab = "all" | "mine";

/** UPPER_SNAKE enum → "Title Case" (province / travel-type labels). */
function prettyEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Admin: the platform destination catalog (GET /destinations) with a
 * New Destination button that creates via POST /destinations. Destinations are
 * fetched by the server component and passed in; after a create the modal
 * triggers a refresh.
 */
export function AdminDestinationsManager({
  destinations,
}: {
  destinations: DestinationResponse[];
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<DestinationTab>("all");

  const featured = destinations.filter((d) => d.featured);
  const shown = tab === "mine" ? featured : destinations;

  return (
    <div className="flex flex-col gap-4">
      {/* sub-tabs + New Destination button, same container */}
      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(key as DestinationTab)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("tours.admin.destinations.title")} className="bg-primary/15!">
              <Tabs.Tab id="all">
                <span className="whitespace-nowrap">{t("tours.admin.destinations.tabs.all")}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="mine">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {t("tours.admin.destinations.tabs.featured")}
                  {featured.length > 0 ? (
                    <Chip color="warning" variant="soft" size="sm">
                      {featured.length}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Button variant="primary" size="sm" onPress={() => setShowForm(true)}>
            <Add size={16} color="currentColor" />
            {t("tours.admin.destinations.new")}
          </Button>
        </div>
      </Tabs>

      <DestinationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => router.refresh()}
      />

      {shown.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.admin.destinations.empty")}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {shown.map((d) => (
            <li key={d.id} className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-primary">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Location size={12} color="currentColor" />
                    {prettyEnum(d.province)} · {prettyEnum(d.travelType)}
                  </p>
                </div>
                {d.featured ? (
                  <Chip color="accent" variant="soft" size="sm">
                    {t("tours.admin.destinations.tabs.featured")}
                  </Chip>
                ) : null}
              </div>

              <p className="text-muted line-clamp-2 text-sm">
                {d.shortDescription || d.description}
              </p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold">
                  {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
                </span>
                <span className="text-muted text-xs">{d.city}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
