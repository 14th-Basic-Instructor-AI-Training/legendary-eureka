"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle } from "iconsax-reactjs";
import { Button, StatusChip, Table } from "@/ui";
import { formatDate } from "@/lib/format";

/** One reviewable row (a tour package or a destination submission). */
export type ApprovalRow = {
  id: string;
  title: string;
  sub?: string | null;
  status: string;
  createdAt: string;
};

/**
 * Shared table view for the admin approval queues (tour packages, destinations).
 * Mirrors the agency requests table: title · sub · submitted · status · actions.
 * Actions call back by id so each queue keeps its own confirm/toast flow.
 */
export function ApprovalsTable({
  rows,
  canReview,
  busyId,
  onApprove,
  onReject,
  titleHeader,
  subHeader,
  ariaLabel,
}: {
  rows: ApprovalRow[];
  canReview: boolean;
  busyId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  titleHeader: string;
  subHeader: string;
  ariaLabel: string;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel} className="min-w-[640px]">
          <Table.Header>
            <Table.Column isRowHeader>{titleHeader}</Table.Column>
            <Table.Column>{subHeader}</Table.Column>
            <Table.Column>{t("admin.requests.submitted")}</Table.Column>
            <Table.Column>{t("admin.requests.statusLabel")}</Table.Column>
            <Table.Column>{""}</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((r) => {
              const status = r.status.toLowerCase();
              return (
                <Table.Row key={r.id} id={r.id}>
                  <Table.Cell>
                    <span className="text-text-primary font-medium">{r.title}</span>
                  </Table.Cell>
                  <Table.Cell className="text-text-secondary max-w-[220px]">
                    <p className="truncate">{r.sub ?? "—"}</p>
                  </Table.Cell>
                  <Table.Cell className="text-text-secondary whitespace-nowrap">
                    {formatDate(r.createdAt, lng)}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusChip status={status} />
                  </Table.Cell>
                  <Table.Cell>
                    {canReview && status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="tertiary"
                          size="sm"
                          className="text-danger"
                          isPending={busyId === r.id}
                          onPress={() => onReject(r.id)}
                        >
                          <CloseCircle size={14} color="currentColor" />
                          {t("admin.requests.reject")}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isPending={busyId === r.id}
                          onPress={() => onApprove(r.id)}
                        >
                          <TickCircle size={14} color="currentColor" />
                          {t("admin.requests.approve")}
                        </Button>
                      </div>
                    ) : null}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
