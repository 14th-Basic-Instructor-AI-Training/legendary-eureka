"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Buildings } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";

/** Agency-onboarding queue: Admin confirms or rejects become-an-agency requests. */
export function AgencyRequestsQueue() {
  const { t } = useTranslation();
  const { role } = useSession();
  const requests = useAdminStore((s) => s.agencyRequests);
  const approveAgency = useAdminStore((s) => s.approveAgency);
  const rejectAgency = useAdminStore((s) => s.rejectAgency);

  if (requests.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.requests.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((r) => (
        <li
          key={r.id}
          className="bg-surface border-border flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-violet-500/10 text-violet-600 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                <Buildings size={18} color="currentColor" variant="Bold" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.agencyName}</p>
                  <StatusChip status={r.status} />
                </div>
                <p className="text-muted text-sm">
                  {t("admin.requests.by", { name: r.applicantName })} · {r.country}
                </p>
              </div>
            </div>
            <p className="text-muted/80 mt-1 text-xs">
              {r.email} · {r.submittedAtLabel}
            </p>
          </div>

          {r.status === "pending" ? (
            <div className="flex gap-2">
              <Button
                variant="tertiary"
                size="sm"
                className="text-danger"
                onPress={() => rejectAgency(role, r.id)}
              >
                <CloseCircle size={16} color="currentColor" />
                {t("admin.requests.reject")}
              </Button>
              <Button variant="primary" size="sm" onPress={() => approveAgency(role, r.id)}>
                <TickCircle size={16} color="currentColor" />
                {t("admin.requests.approve")}
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
