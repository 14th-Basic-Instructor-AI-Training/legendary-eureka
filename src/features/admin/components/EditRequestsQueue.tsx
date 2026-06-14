"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, NoteText, SearchNormal1 } from "iconsax-reactjs";
import { Button, Input, Pagination, StatusChip, Table, Tabs } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import { cn } from "@/lib/utils";
import type { EditRequestStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | EditRequestStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

/** Arc gradient + accent colors per status (white-card theme). */
const ARC: Record<EditRequestStatus, { from: string; to: string; dot: string; soft: string; text: string }> = {
  pending: { from: "#4FB5DB", to: "#84CDE9", dot: "#4FB5DB", soft: "bg-primary/10", text: "text-primary" },
  approved: { from: "#5FC381", to: "#9BE0E7", dot: "#5FC381", soft: "bg-green/10", text: "text-green" },
  rejected: { from: "#FF0C3C", to: "#F48D5D", dot: "#FF0C3C", soft: "bg-red/10", text: "text-red" },
};

/** Cards per page in the card view. */
const PAGE_SIZE = 9;

type Props = { view: "card" | "table" };

export function EditRequestsQueue({ view }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const editRequests = useAdminStore((s) => s.editRequests);
  const approveEditRequest = useAdminStore((s) => s.approveEditRequest);
  const rejectEditRequest = useAdminStore((s) => s.rejectEditRequest);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EditRequestStatus>("all");

  const filtered = editRequests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.activityTitle.toLowerCase().includes(q) ||
      r.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Client-side pagination for the card view. `page` is clamped at render so it
  // stays valid when the filtered set shrinks (no setState-in-effect needed).
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {/* search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label={t("admin.editRequests.searchPlaceholder")}
            placeholder={t("admin.editRequests.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => {
            setStatusFilter(key as "all" | EditRequestStatus);
            setPage(1);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List
              aria-label={t("admin.requests.tabs.editRequests")}
              className="bg-primary/15! w-fit!"
            >
              {STATUS_FILTERS.map((f) => (
                <Tabs.Tab key={f.value} id={f.value}>
                  {t(f.labelKey)}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <NoteText size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("admin.editRequests.empty")}</p>
        </div>
      ) : (
        <>
          {view === "table" ? (
            <TableView
              filtered={paged}
              role={role}
              approveEditRequest={approveEditRequest}
              rejectEditRequest={rejectEditRequest}
              t={t}
            />
          ) : (
            <CardView
              filtered={paged}
              role={role}
              approveEditRequest={approveEditRequest}
              rejectEditRequest={rejectEditRequest}
              t={t}
            />
          )}
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

// ─── shared prop type ────────────────────────────────────────────────────────

type QueueViewProps = {
  filtered: ReturnType<typeof useAdminStore.getState>["editRequests"];
  role: ReturnType<typeof useSession>["role"];
  approveEditRequest: ReturnType<typeof useAdminStore.getState>["approveEditRequest"];
  rejectEditRequest: ReturnType<typeof useAdminStore.getState>["rejectEditRequest"];
  t: (key: string, opts?: Record<string, unknown>) => string;
};

// ─── card view ───────────────────────────────────────────────────────────────

function CardView({ filtered, role, approveEditRequest, rejectEditRequest, t }: QueueViewProps) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {filtered.map((r) => {
        const cfg = ARC[r.status];
        return (
          <li
            key={r.id}
            className="bg-surface border-border flex min-w-[240px] flex-col overflow-hidden rounded-2xl border shadow-primary"
          >
            <div className="p-4">
              {/* top row: type + status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                      cfg.soft,
                      cfg.text,
                    )}
                  >
                    <NoteText size={14} color="currentColor" variant="Bold" />
                  </span>
                  <span className="text-text-primary text-sm font-semibold">
                    {t("admin.editRequests.cardType")}
                  </span>
                </div>
                <StatusChip status={r.status} />
              </div>

              {/* endpoints */}
              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="min-w-0 max-w-[46%]">
                  <p className="text-muted text-[10px] uppercase tracking-wide">
                    {t("admin.requests.agencyLabel")}
                  </p>
                  <p className="text-text-primary truncate text-sm font-semibold">{r.agencyName}</p>
                </div>
                <div className="min-w-0 max-w-[50%] text-right">
                  <p className="text-muted text-[10px] uppercase tracking-wide">
                    {t("admin.editRequests.activityLabel")}
                  </p>
                  <p className="text-text-primary truncate text-sm font-semibold">{r.activityTitle}</p>
                </div>
              </div>

              {/* before / after diff */}
              <div className="mt-3 flex flex-col gap-2">
                {r.currentValue ? (
                  <div className="rounded-lg border-l-2 border-red py-2 pl-3 pr-2">
                    <p className="text-muted text-[10px] font-semibold uppercase tracking-wide">
                      {t("admin.editRequests.current")}
                    </p>
                    <p className="mt-0.5 text-sm text-red">{r.currentValue}</p>
                  </div>
                ) : null}
                <div className="rounded-lg border-l-2 border-green py-2 pl-3 pr-2">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wide">
                    {t("admin.editRequests.proposed")}
                  </p>
                  <p className="mt-0.5 text-sm text-green">{r.requestedChanges}</p>
                </div>
              </div>
            </div>

            {/* action footer */}
            {r.status === "pending" ? (
              <div className="border-border bg-bg-ghostwhite mt-auto flex items-center justify-end gap-2 border-t px-4 py-2.5">
                <Button
                  variant="tertiary"
                  size="sm"
                  className="text-danger"
                  onPress={() => rejectEditRequest(role, r.id)}
                >
                  <CloseCircle size={15} color="currentColor" />
                  {t("admin.editRequests.reject")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => approveEditRequest(role, r.id)}
                >
                  <TickCircle size={15} color="currentColor" />
                  {t("admin.editRequests.approve")}
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

// ─── table view ──────────────────────────────────────────────────────────────

function TableView({ filtered, role, approveEditRequest, rejectEditRequest, t }: QueueViewProps) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={t("admin.requests.tabs.editRequests")} className="min-w-[640px]">
          <Table.Header>
            <Table.Column isRowHeader>Activity</Table.Column>
            <Table.Column>Agency</Table.Column>
            <Table.Column>Requested Change</Table.Column>
            <Table.Column>Submitted</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>{""}</Table.Column>
          </Table.Header>
          <Table.Body>
            {filtered.map((r) => (
              <Table.Row key={r.id} id={r.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        r.status === "pending" && "bg-primary/10 text-primary",
                        r.status === "approved" && "bg-lightgreen text-green",
                        r.status === "rejected" && "bg-lightred text-red",
                      )}
                    >
                      <NoteText size={14} color="currentColor" variant="Bold" />
                    </span>
                    <span className="font-medium text-text-primary max-w-[160px] truncate">
                      {r.activityTitle}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="text-text-secondary">{r.agencyName}</Table.Cell>
                <Table.Cell className="text-text-secondary max-w-[200px]">
                  <p className="truncate">{r.requestedChanges}</p>
                </Table.Cell>
                <Table.Cell className="text-text-secondary whitespace-nowrap">
                  {r.submittedAtLabel}
                </Table.Cell>
                <Table.Cell>
                  <StatusChip status={r.status} />
                </Table.Cell>
                <Table.Cell>
                  {r.status === "pending" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="text-danger"
                        onPress={() => rejectEditRequest(role, r.id)}
                      >
                        <CloseCircle size={14} color="currentColor" />
                        {t("admin.editRequests.reject")}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => approveEditRequest(role, r.id)}
                      >
                        <TickCircle size={14} color="currentColor" />
                        {t("admin.editRequests.approve")}
                      </Button>
                    </div>
                  ) : null}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
