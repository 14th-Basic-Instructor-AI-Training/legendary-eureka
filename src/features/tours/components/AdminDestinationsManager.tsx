"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Add, Location, More, Edit2, Trash } from "iconsax-reactjs";
import { Button, Chip, Dropdown, Tabs, useConfirm } from "@/ui";
import { CardImage } from "@/ui/CardImage";
import { useLocalizedRouter } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { sendRealtime, DESTINATIONS_CHANGED } from "@/lib/realtime";
import { DestinationForm } from "./DestinationForm";
import { deleteDestinationAction } from "@/actions/tours";
import type { DestinationResponse } from "@/lib/api/destinations";

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
  const localizedRouter = useLocalizedRouter();
  const confirm = useConfirm();

  const openDetail = (id: string) => localizedRouter.push(`/admin/content/destinations/${id}`);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DestinationResponse | null>(null);
  const [tab, setTab] = useState<string>("all");

  // Distinct travel types present in the payload — each becomes a tab beside "All".
  const travelTypes = Array.from(new Set(destinations.map((d) => d.travelType))).sort();
  const shown =
    tab === "all" ? destinations : destinations.filter((d) => d.travelType === tab);

  const handleDelete = (d: DestinationResponse) =>
    confirm({
      title: t("tours.admin.destinations.deleteConfirm.title"),
      description: t("tours.admin.destinations.deleteConfirm.description", { name: d.name }),
      intent: "danger",
      confirmLabel: t("common.delete"),
      onConfirm: async () => {
        await deleteDestinationAction(d.id);
        sendRealtime({ event: DESTINATIONS_CHANGED, data: { id: d.id } });
        router.refresh();
      },
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* sub-tabs + New Destination button, same container */}
      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("tours.admin.destinations.title")} className="bg-primary/15!">
              <Tabs.Tab id="all">
                <span className="whitespace-nowrap">{t("tours.admin.destinations.tabs.all")}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              {travelTypes.map((type) => (
                <Tabs.Tab key={type} id={type}>
                  <span className="whitespace-nowrap">{prettyEnum(type)}</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
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

      <DestinationForm
        isOpen={editing !== null}
        destination={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          if (editing) sendRealtime({ event: DESTINATIONS_CHANGED, data: { id: editing.id } });
          setEditing(null);
          router.refresh();
        }}
      />

      {/* Only the card list scrolls — the sub-tabs above stay fixed. */}
      <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
      {shown.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.admin.destinations.empty")}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {shown.map((d) => (
            <li
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => openDetail(d.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDetail(d.id);
                }
              }}
              className="bg-surface shadow-primary hover:ring-primary/30 flex cursor-pointer flex-col gap-3 rounded-2xl p-4 transition hover:ring-1"
            >
              <div className="relative -mx-4 -mt-4 mb-1 aspect-[16/9] overflow-hidden rounded-t-2xl">
                <CardImage
                  src={d.coverImageUrl || d.heroImage}
                  alt={d.name}
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                    <Location size={12} color="currentColor" />
                    {prettyEnum(d.province)} · {prettyEnum(d.travelType)}
                  </p>
                </div>
                <div
                  className="flex shrink-0 items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {d.featured ? (
                    <Chip color="accent" variant="soft" size="sm">
                      {t("tours.admin.destinations.tabs.featured")}
                    </Chip>
                  ) : null}
                  <Dropdown>
                    <Dropdown.Trigger
                      aria-label={t("tours.admin.destinations.menuLabel")}
                      className="text-muted hover:text-foreground hover:bg-muted/10 -mr-1 rounded-lg p-1 transition-colors"
                    >
                      <More size={18} color="currentColor" className="rotate-90" />
                    </Dropdown.Trigger>
                    <Dropdown.Popover>
                      <Dropdown.Menu
                        onAction={(key) => {
                          if (key === "edit") setEditing(d);
                          else if (key === "delete") handleDelete(d);
                        }}
                      >
                        <Dropdown.Item id="edit" className="flex items-center gap-2">
                          <Edit2 size={16} color="currentColor" />
                          {t("common.edit")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="delete"
                          variant="danger"
                          className="flex items-center gap-2"
                        >
                          <Trash size={16} color="currentColor" />
                          {t("common.delete")}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
                </div>
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
    </div>
  );
}
