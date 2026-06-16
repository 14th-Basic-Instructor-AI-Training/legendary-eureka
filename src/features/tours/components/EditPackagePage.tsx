"use client";

import { useTranslation } from "react-i18next";
import { ArrowLeft2 } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { NewPackageFormValues } from "../schema";
import { PackageForm } from "./PackageForm";

type Props = {
  package: TourPackageResponse;
};

/** Convert a TourPackageResponse into PackageForm initialValues. */
function toFormValues(p: TourPackageResponse): Partial<NewPackageFormValues> {
  return {
    title: p.title ?? "",
    tagline: p.tagline ?? "",
    province: (p.province as NewPackageFormValues["province"]) ?? undefined,
    travelType: (p.travelType as NewPackageFormValues["travelType"]) ?? undefined,
    days: p.durationDays ?? p.days ?? 1,
    priceFrom: p.priceFrom ?? p.price ?? 0,
    currency: p.currency ?? "USD",
    groupSizeMax: p.groupSizeMax != null ? String(p.groupSizeMax) : "",
    cancellationPolicy:
      p.cancellationPolicy === "nonRefundable" ? "nonRefundable" : "free",
    languages: p.languages ?? "",
    description: p.description ?? "",
    coverImageUrl: p.coverImageUrl ?? p.image ?? "",
    highlights: p.highlights ?? "",
    included: p.included ?? "",
    excluded: p.excluded ?? "",
  };
}

export function EditPackagePage({ package: pkg }: Props) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  const handleUpdated = (updated: TourPackageResponse) => {
    router.push(`/agency/tours/${updated.id}`);
  };

  const handleCancel = () => {
    router.push(`/agency/tours/${pkg.id}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Page header strip ── */}
      <div className="border-border bg-surface border-b px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Button
            variant="tertiary"
            size="sm"
            onPress={handleCancel}
            aria-label={t("common.back")}
            className="shrink-0"
          >
            <ArrowLeft2 size={18} color="currentColor" />
            <span className="text-sm">{t("common.back")}</span>
          </Button>

          <div className="h-5 w-px bg-current opacity-10" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <p className="text-muted text-xs font-medium uppercase tracking-widest">
              {t("tours.packages.editPage.pageTitle")}
            </p>
            <h1 className="text-foreground truncate text-base font-semibold">
              {pkg.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Form content ── */}
      <div className="flex-1 px-4 py-8 sm:px-6">
        <PackageForm
          destinations={[]}
          agencyName=""
          packageId={pkg.id}
          initialValues={toFormValues(pkg)}
          onCreated={handleUpdated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
