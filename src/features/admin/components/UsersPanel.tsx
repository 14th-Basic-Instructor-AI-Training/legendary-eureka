"use client";

import { useTranslation } from "react-i18next";
import { Slash, Forbidden2, Refresh } from "iconsax-reactjs";
import { Avatar, Button, Chip, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Platform users with role + moderation status. Admins can suspend / ban / reactivate. */
export function UsersPanel() {
  const { t } = useTranslation();
  const { role } = useSession();
  const users = useAdminStore((s) => s.users);
  const suspendUser = useAdminStore((s) => s.suspendUser);
  const banUser = useAdminStore((s) => s.banUser);
  const reactivateUser = useAdminStore((s) => s.reactivateUser);
  const canManage = can(role, "manageUsers");

  if (users.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.users.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {users.map((u) => (
        <li
          key={u.id}
          className="bg-surface border-border flex flex-wrap items-center gap-3 rounded-xl border p-4"
        >
          <Avatar size="sm">
            <Avatar.Fallback>{initialsOf(u.name)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{u.name}</p>
              <StatusChip status={u.status} />
            </div>
            <p className="text-muted truncate text-sm">{u.email}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Chip color="default" variant="soft" size="sm">
              {t(`roles.${u.role}`)}
            </Chip>
            <span className="text-muted/70 text-xs">
              {t("admin.users.joined", { date: u.joinedAtLabel })}
            </span>
          </div>

          {/* Admins don't moderate other admins. */}
          {canManage && u.role !== "admin" ? (
            <div className="flex w-full justify-end gap-2 sm:w-auto">
              {u.status === "active" ? (
                <>
                  <Button
                    variant="tertiary"
                    size="sm"
                    className="text-warning"
                    onPress={() => suspendUser(role, u.id)}
                  >
                    <Slash size={16} color="currentColor" />
                    {t("admin.users.actions.suspend")}
                  </Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    className="text-danger"
                    onPress={() => banUser(role, u.id)}
                  >
                    <Forbidden2 size={16} color="currentColor" />
                    {t("admin.users.actions.ban")}
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onPress={() => reactivateUser(role, u.id)}>
                  <Refresh size={16} color="currentColor" />
                  {t("admin.users.actions.reactivate")}
                </Button>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
