"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Buildings, SearchNormal1 } from "iconsax-reactjs";
import { Button, Input, Pagination, StatusChip, Tabs, Table, useConfirm } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import { cn } from "@/lib/utils";
import type { AgencyRequest, AgencyRequestStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | AgencyRequestStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

/** Arc gradient + accent colors per status (white-card theme). */
const ARC: Record<AgencyRequestStatus, { from: string; to: string; dot: string; soft: string; text: string }> = {
  pending: { from: "#4FB5DB", to: "#84CDE9", dot: "#4FB5DB", soft: "bg-primary/10", text: "text-primary" },
  approved: { from: "#5FC381", to: "#9BE0E7", dot: "#5FC381", soft: "bg-green/10", text: "text-green" },
  rejected: { from: "#FF0C3C", to: "#F48D5D", dot: "#FF0C3C", soft: "bg-red/10", text: "text-red" },
};

/** Cards per page in the card view. */
const PAGE_SIZE = 9;

type Props = { view: "card" | "table" };

export function AgencyRequestsQueue({ view }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const requests = useAdminStore((s) => s.agencyRequests);
  const approveAgency = useAdminStore((s) => s.approveAgency);
  const rejectAgency = useAdminStore((s) => s.rejectAgency);
  const confirm = useConfirm();

  const onApprove = (r: AgencyRequest) =>
    confirm({
      title: t("admin.requests.approve"),
      description: r.agencyName,
      intent: "primary",
      onConfirm: () => {
        approveAgency(role, r.id);
      },
    });

  const onReject = (r: AgencyRequest) =>
    confirm({
      title: t("admin.requests.reject"),
      description: r.agencyName,
      intent: "danger",
      onConfirm: () => {
        rejectAgency(role, r.id);
      },
    });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgencyRequestStatus>("all");

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.agencyName.toLowerCase().includes(q) ||
      r.applicantName.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q);
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
            aria-label={t("admin.requests.searchPlaceholder")}
            placeholder={t("admin.requests.searchPlaceholder")}
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
            setStatusFilter(key as "all" | AgencyRequestStatus);
            setPage(1);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List
              aria-label={t("admin.requests.tabs.agencies")}
              className="bg-primary/15!"
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
            <Buildings size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("admin.requests.empty")}</p>
        </div>
      ) : (
        <>
          {view === "table" ? (
            <TableView
              filtered={paged}
              onApprove={onApprove}
              onReject={onReject}
              t={t}
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {paged.map((r) => (
                <RouteCard
                  key={r.id}
                  request={r}
                  onApprove={onApprove}
                  onReject={onReject}
                  t={t}
                />
              ))}
            </div>
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

type ActionFn = (r: AgencyRequest) => void;
type TFn = (key: string, opts?: Record<string, unknown>) => string;

// ─── route card (flight-route style, white theme) ────────────────────────────

function RouteCard({
  request: r,
  onApprove,
  onReject,
  t,
}: {
  request: AgencyRequest;
  onApprove: ActionFn;
  onReject: ActionFn;
  t: TFn;
}) {
  const cfg = ARC[r.status];
  const gradId = `arc-${r.id}`;

  return (
    <div className="bg-surface border-border flex min-w-[240px] flex-col overflow-hidden rounded-2xl border shadow-primary">
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
              <Buildings size={14} color="currentColor" variant="Bold" />
            </span>
            <span className="text-text-primary text-sm font-semibold">
              {t("admin.requests.cardType")}
            </span>
          </div>
          <StatusChip status={r.status} />
        </div>

        {/* arc visualization */}
        <div className="relative mt-2 h-[92px]">
          <svg
            viewBox="0 0 400 92"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={cfg.from} />
                <stop offset="100%" stopColor={cfg.to} />
              </linearGradient>
            </defs>
            <path d="M 26 72 Q 200 -16 374 72" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <path
              d="M 26 72 Q 200 -16 374 72"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="3"
              strokeDasharray="1 9"
              strokeLinecap="round"
            />
          </svg>

          {/* departure dot (applicant) */}
          <span
            className="absolute block h-3 w-3 rounded-full ring-4 ring-white"
            style={{ left: "6.5%", top: "72px", transform: "translate(-50%,-50%)", backgroundColor: cfg.dot }}
          />
          {/* arrival dot (agency) */}
          <span
            className="absolute block h-3 w-3 rounded-full ring-4 ring-white"
            style={{ left: "93.5%", top: "72px", transform: "translate(-50%,-50%)", backgroundColor: cfg.dot }}
          />

          {/* center node */}
          <span
            className="bg-surface absolute flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-primary"
            style={{ left: "50%", top: "22px", transform: "translate(-50%,-50%)", borderColor: cfg.dot }}
          >
            <Buildings size={13} color={cfg.dot} variant="Bold" />
          </span>
          {/* center label */}
          <span
            className="absolute text-center"
            style={{ left: "50%", top: "44px", transform: "translateX(-50%)" }}
          >
            <span className="text-text-primary block whitespace-nowrap text-[11px] font-medium">
              {r.submittedAtLabel}
            </span>
          </span>
        </div>

        {/* endpoints */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 max-w-[46%]">
            <p className="text-muted text-[10px] uppercase tracking-wide">
              {t("admin.requests.applicant")}
            </p>
            <p className="text-text-primary truncate text-sm font-semibold">
              {r.applicantName}
            </p>
            <p className="text-muted truncate text-xs">{r.country}</p>
          </div>
          <div className="min-w-0 max-w-[50%] text-right">
            <p className="text-muted text-[10px] uppercase tracking-wide">
              {t("admin.requests.agencyLabel")}
            </p>
            <p className="text-text-primary truncate text-sm font-semibold">
              {r.agencyName}
            </p>
            <p className="text-muted truncate text-xs">{r.email}</p>
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
            onPress={() => onReject(r)}
          >
            <CloseCircle size={15} color="currentColor" />
            {t("admin.requests.reject")}
          </Button>
          <Button variant="primary" size="sm" onPress={() => onApprove(r)}>
            <TickCircle size={15} color="currentColor" />
            {t("admin.requests.approve")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ─── table view ──────────────────────────────────────────────────────────────

function TableView({
  filtered,
  onApprove,
  onReject,
  t,
}: {
  filtered: AgencyRequest[];
  onApprove: ActionFn;
  onReject: ActionFn;
  t: TFn;
}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={t("admin.requests.tabs.agencies")} className="min-w-[640px]">
          <Table.Header>
            <Table.Column isRowHeader>Agency</Table.Column>
            <Table.Column>Applicant</Table.Column>
            <Table.Column>Country</Table.Column>
            <Table.Column>Submitted</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>{""}</Table.Column>
          </Table.Header>
          <Table.Body>
            {filtered.map((r) => (
              <Table.Row key={r.id} id={r.id}>
            <Table.Cell>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                    ARC[r.status].soft,
                    ARC[r.status].text,
                  )}
                >
                  {r.agencyName
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="text-text-primary font-medium">{r.agencyName}</span>
              </div>
            </Table.Cell>
            <Table.Cell className="text-text-secondary">{r.applicantName}</Table.Cell>
            <Table.Cell className="text-text-secondary">{r.country}</Table.Cell>
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
                    onPress={() => onReject(r)}
                  >
                    <CloseCircle size={14} color="currentColor" />
                    {t("admin.requests.reject")}
                  </Button>
                  <Button variant="primary" size="sm" onPress={() => onApprove(r)}>
                    <TickCircle size={14} color="currentColor" />
                    {t("admin.requests.approve")}
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
