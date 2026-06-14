"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Add, CloseCircle, Location } from "iconsax-reactjs";
import { Button, Chip, Tabs } from "@/ui";
import { formatPrice } from "@/lib/format";
import { DestinationForm } from "./DestinationForm";
import { useToursStore } from "../store";

/** The name stored as the owner of admin-created destinations (Flow 1). */
const ADMIN_OWNER_NAME = "Jalat Admin";

type DestinationTab = "all" | "requests";

/**
 * Admin: create destinations agencies can build tour packages on (Flow 1) and
 * review the destinations agencies created themselves (Flow 2) as "create
 * requests". Both lists share one container with the New Destination button.
 */
export function AdminDestinationsManager() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const destinations = useToursStore((s) => s.destinations);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<DestinationTab>("all");

  // Agency-created destinations are the "create destination" requests (Flow 2);
  // the "all" tab shows the full catalog including admin-created ones (Flow 1).
  const requests = destinations.filter((d) => d.origin === "agency");
  const shown = tab === "requests" ? requests : destinations;

  return (
    <div className="flex flex-col gap-4">
      {/* sub-tabs + New Destination button, same container */}
      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(key as DestinationTab)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs.ListContainer>
            <Tabs.List
              aria-label={t("tours.admin.destinations.title")}
              className="bg-primary/15!"
            >
              <Tabs.Tab id="all">
                {t("tours.admin.destinations.tabs.all")}
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="requests">
                {t("tours.admin.destinations.tabs.requests")}
                {requests.length > 0 ? (
                  <Chip color="warning" variant="soft" size="sm" className="ml-1.5">
                    {requests.length}
                  </Chip>
                ) : null}
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Button variant="primary" size="sm" onPress={() => setShowForm((v) => !v)}>
            {showForm ? (
              <CloseCircle size={16} color="currentColor" />
            ) : (
              <Add size={16} color="currentColor" />
            )}
            {t("tours.admin.destinations.new")}
          </Button>
        </div>
      </Tabs>

      {showForm ? (
        <DestinationForm
          origin="admin"
          ownerName={ADMIN_OWNER_NAME}
          onDone={() => setShowForm(false)}
        />
      ) : null}

      {shown.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">
          {t(
            tab === "requests"
              ? "tours.admin.destinations.requestsEmpty"
              : "tours.admin.destinations.empty",
          )}
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {shown.map((d) => (
            <li
              key={d.id}
              className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Location size={12} color="currentColor" />
                    {t(`destinations.provinces.${d.province}`)} ·{" "}
                    {t(`destinations.travelTypes.${d.travelType}`)}
                  </p>
                </div>
                <Chip color={d.origin === "admin" ? "accent" : "default"} variant="soft" size="sm">
                  {t(`tours.destinations.origin.${d.origin}`)}
                </Chip>
              </div>

              <p className="text-muted line-clamp-2 text-sm">{d.summary}</p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold">
                  {t("tours.destinations.from")} {formatPrice(d.priceFrom, d.currency, lng)}
                </span>
                <span className="text-muted text-xs">{d.ownerName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
