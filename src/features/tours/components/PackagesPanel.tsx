"use client";

import { useTranslation } from "react-i18next";
import { Add, CloseCircle, TickCircle } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { PackageForm } from "./PackageForm";
import { useToursStore } from "../store";
import type { TourDestination, TourPackage } from "../schema";

type Props = {
  destinations: TourDestination[];
  packages: TourPackage[];
  agencyName: string;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  presetDestinationId?: string;
};

/** Agency: list tour packages with approval status; create + request approval. */
export function PackagesPanel({
  destinations,
  packages,
  agencyName,
  formOpen,
  setFormOpen,
  presetDestinationId,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const submitForApproval = useToursStore((s) => s.submitForApproval);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("tours.packages.title")}</h2>
        <Button variant="primary" size="sm" onPress={() => setFormOpen(!formOpen)}>
          {formOpen ? (
            <CloseCircle size={16} color="currentColor" />
          ) : (
            <Add size={16} color="currentColor" />
          )}
          {t("tours.packages.new")}
        </Button>
      </div>

      {formOpen ? (
        <PackageForm
          key={presetDestinationId ?? "new"}
          destinations={destinations}
          agencyName={agencyName}
          presetDestinationId={presetDestinationId}
          onDone={() => setFormOpen(false)}
        />
      ) : null}

      {packages.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("tours.packages.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {packages.map((p) => (
            <li
              key={p.id}
              className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{p.title}</p>
                  <StatusChip status={p.status} />
                </div>
                <p className="text-muted mt-1 text-sm">
                  {p.destinationName} · {t("tours.packages.days", { count: p.days })} ·{" "}
                  {t("landing.tours.from")} {formatPrice(p.priceFrom, p.currency, lng)}
                </p>
              </div>

              {p.status === "draft" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => submitForApproval(role, p.id, t("tours.packages.justNow"))}
                >
                  {t("tours.packages.requestApproval")}
                </Button>
              ) : p.status === "pending" ? (
                <span className="text-warning flex items-center gap-1 text-xs font-medium">
                  <TickCircle size={14} color="currentColor" variant="Bold" />
                  {t("tours.packages.approvalSent")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
