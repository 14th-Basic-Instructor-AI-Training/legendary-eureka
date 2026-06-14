"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash, CloseCircle, SearchNormal1, AddCircle } from "iconsax-reactjs";
import { Button, Chip, StatusChip } from "@/ui";
import { formatRating } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import { ActivityEditModal } from "./ActivityEditModal";
import type { ActivityStatus, PlatformActivity } from "../schema";
import type { DestinationCategory } from "@/features/destinations/schema";

const STATUS_FILTERS: Array<{ value: "all" | ActivityStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "published", labelKey: "status.published" },
  { value: "draft", labelKey: "status.draft" },
];

const CATEGORY_COLOR: Record<DestinationCategory, string> = {
  destination: "bg-blue-500/10 text-blue-600",
  thingToDo: "bg-primary/10 text-primary",
  food: "bg-orange-500/10 text-orange-600",
  stay: "bg-green-500/10 text-green-600",
};

export function ActivitiesAdmin() {
  const { t, i18n } = useTranslation();
  const { role } = useSession();
  const activities = useAdminStore((s) => s.activities);
  const deleteActivity = useAdminStore((s) => s.deleteActivity);
  const canEdit = can(role, "editAnyActivity");

  const [editing, setEditing] = useState<PlatformActivity | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ActivityStatus>("all");

  const filtered = activities.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || a.title.toLowerCase().includes(q) || a.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const publishedCount = activities.filter((a) => a.status === "published").length;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Summary */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <span className="text-primary text-lg font-bold">{publishedCount}</span>
            <span className="text-muted text-sm">{t("admin.activities.publishedCount")}</span>
          </div>
          <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <span className="text-foreground text-lg font-bold">{activities.length}</span>
            <span className="text-muted text-sm">{t("admin.activities.totalCount")}</span>
          </div>
          {canEdit ? (
            <Button
              variant="primary"
              size="sm"
              className="ml-auto"
              onPress={() => setCreating(true)}
            >
              <AddCircle size={16} color="currentColor" />
              {t("admin.activities.create")}
            </Button>
          ) : null}
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <SearchNormal1
              size={16}
              color="currentColor"
              className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              aria-label={t("admin.activities.searchPlaceholder")}
              placeholder={t("admin.activities.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-surface text-foreground placeholder:text-muted w-full rounded-xl border px-3 py-2 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-muted/10 text-muted hover:bg-muted/20",
                ].join(" ")}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="text-muted py-8 text-center text-sm">{t("admin.activities.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((a) => (
              <li
                key={a.id}
                className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{a.title}</p>
                    <StatusChip status={a.status} />
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        CATEGORY_COLOR[a.category],
                      ].join(" ")}
                    >
                      {t(`destinations.categories.${a.category}`)}
                    </span>
                  </div>
                  <p className="text-muted mt-0.5 text-sm">
                    {t("admin.activities.by", { agency: a.agencyName })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {a.rating > 0 ? (
                    <Chip color="warning" variant="soft" size="sm">
                      ★ {formatRating(a.rating, i18n.language)}
                    </Chip>
                  ) : null}

                  {canEdit ? (
                    confirmingId === a.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-xs">{t("admin.activities.deleteConfirm")}</span>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-danger"
                          onPress={() => {
                            deleteActivity(role, a.id);
                            setConfirmingId(null);
                          }}
                        >
                          {t("admin.activities.actions.confirmDelete")}
                        </Button>
                        <Button variant="tertiary" size="sm" onPress={() => setConfirmingId(null)}>
                          <CloseCircle size={16} color="currentColor" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onPress={() => setEditing(a)}>
                          <Edit2 size={16} color="currentColor" />
                          {t("admin.activities.actions.edit")}
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          className="text-danger"
                          onPress={() => setConfirmingId(a.id)}
                        >
                          <Trash size={16} color="currentColor" />
                          {t("admin.activities.actions.delete")}
                        </Button>
                      </div>
                    )
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ActivityEditModal
        isOpen={creating || editing !== null}
        activity={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </>
  );
}
