"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Slash, Forbidden2, Refresh, SearchNormal1, ArrowDown } from "iconsax-reactjs";
import { Avatar, Button, Chip, Pagination, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import type { UserStatus } from "../schema";
import type { Role } from "@/features/auth/schema";

type RoleFilter = "all" | Role;
type StatusFilter = "all" | UserStatus;

const ROLE_FILTERS: Array<{ value: RoleFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "admin", labelKey: "roles.admin" },
  { value: "agency", labelKey: "roles.agency" },
  { value: "traveler", labelKey: "roles.traveler" },
];

const STATUS_FILTERS: Array<{ value: StatusFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "active", labelKey: "status.active" },
  { value: "suspended", labelKey: "status.suspended" },
  { value: "banned", labelKey: "status.banned" },
];

/** Users shown per page. */
const PAGE_SIZE = 10;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersPanel() {
  const { t } = useTranslation();
  const { role } = useSession();
  const users = useAdminStore((s) => s.users);
  const suspendUser = useAdminStore((s) => s.suspendUser);
  const banUser = useAdminStore((s) => s.banUser);
  const reactivateUser = useAdminStore((s) => s.reactivateUser);
  const changeUserRole = useAdminStore((s) => s.changeUserRole);
  const canManage = can(role, "manageUsers");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Client-side pagination, 10 per page. `page` is clamped at render so it stays
  // valid when filters shrink the list (no setState-in-effect needed).
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="text-foreground text-lg font-bold">{users.length}</span>
          <span className="text-muted text-sm">{t("admin.users.totalCount")}</span>
        </div>
        {suspendedCount > 0 && (
          <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <span className="text-warning text-lg font-bold">{suspendedCount}</span>
            <span className="text-muted text-sm">{t("admin.users.suspendedCount")}</span>
          </div>
        )}
        {bannedCount > 0 && (
          <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <span className="text-danger text-lg font-bold">{bannedCount}</span>
            <span className="text-muted text-sm">{t("admin.users.bannedCount")}</span>
          </div>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            aria-label={t("admin.users.searchPlaceholder")}
            placeholder={t("admin.users.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-border bg-surface text-foreground placeholder:text-muted w-full rounded-xl border px-3 py-2 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4">
        {/* Role filter */}
        <div className="flex flex-col gap-1">
          <span className="text-muted text-xs font-medium">{t("admin.users.filterRole")}</span>
          <div className="flex gap-1.5">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setRoleFilter(f.value);
                  setPage(1);
                }}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  roleFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-muted/10 text-muted hover:bg-muted/20",
                ].join(" ")}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-col gap-1">
          <span className="text-muted text-xs font-medium">{t("admin.users.filterStatus")}</span>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
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
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.users.empty")}</p>
      ) : (
        <>
        <ul className="flex flex-col gap-2">
          {paged.map((u) => (
            <li
              key={u.id}
              className="bg-surface border-border flex flex-wrap items-center gap-3 rounded-xl border p-4"
            >
              <Avatar size="sm">
                <Avatar.Fallback>{initialsOf(u.name)}</Avatar.Fallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{u.name}</p>
                  <StatusChip status={u.status} />
                  <Chip color="default" variant="soft" size="sm">
                    {t(`roles.${u.role}`)}
                  </Chip>
                </div>
                <p className="text-muted mt-0.5 truncate text-sm">{u.email}</p>
                <p className="text-muted/70 mt-0.5 text-xs">
                  {t("admin.users.joined", { date: u.joinedAtLabel })}
                </p>
              </div>

              {canManage && u.role !== "admin" ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {/* Role change: agency → traveler downgrade */}
                  {u.role === "agency" ? (
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-muted"
                      onPress={() => changeUserRole(role, u.id, "traveler")}
                    >
                      <ArrowDown size={16} color="currentColor" />
                      {t("admin.users.roleDowngrade")}
                    </Button>
                  ) : null}

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
        <Pagination
          page={currentPage}
          total={pageCount}
          onChange={setPage}
          className="mt-2"
        />
        </>
      )}
    </div>
  );
}
