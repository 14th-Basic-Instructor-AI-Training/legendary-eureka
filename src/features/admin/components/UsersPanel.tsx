"use client";

import { useTranslation } from "react-i18next";
import { Avatar, Button, Chip, Skeleton } from "@/ui";
import { useResource } from "@/lib/useResource";
import { getUsers } from "../data";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Read-only list of platform users with their role. */
export function UsersPanel() {
  const { t } = useTranslation();
  const { status, data, reload } = useResource(getUsers);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-10 text-center">
        <p className="text-muted text-sm">{t("destinations.states.error")}</p>
        <Button variant="secondary" size="sm" onPress={reload}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.users.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.map((u) => (
        <li
          key={u.id}
          className="bg-surface border-border flex items-center gap-3 rounded-xl border p-4"
        >
          <Avatar size="sm">
            <Avatar.Fallback>{initialsOf(u.name)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{u.name}</p>
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
        </li>
      ))}
    </ul>
  );
}
