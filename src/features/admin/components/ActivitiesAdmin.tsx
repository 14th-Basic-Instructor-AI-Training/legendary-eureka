"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash, CloseCircle } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { formatRating } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import { ActivityEditModal } from "./ActivityEditModal";
import type { PlatformActivity } from "../schema";

/** Content moderation: every activity across agencies; admins can edit or delete any. */
export function ActivitiesAdmin() {
  const { t, i18n } = useTranslation();
  const { role } = useSession();
  const activities = useAdminStore((s) => s.activities);
  const deleteActivity = useAdminStore((s) => s.deleteActivity);
  const canEdit = can(role, "editAnyActivity");

  const [editing, setEditing] = useState<PlatformActivity | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (activities.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.activities.empty")}</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {activities.map((a) => (
          <li
            key={a.id}
            className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{a.title}</p>
                <StatusChip status={a.status} />
              </div>
              <p className="text-muted mt-0.5 text-sm">
                {t(`destinations.categories.${a.category}`)} ·{" "}
                {t("admin.activities.by", { agency: a.agencyName })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {a.rating > 0 ? (
                <span className="text-warning text-sm font-medium">
                  ★ {formatRating(a.rating, i18n.language)}
                </span>
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

      <ActivityEditModal activity={editing} onClose={() => setEditing(null)} />
    </>
  );
}
