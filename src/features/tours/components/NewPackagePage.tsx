"use client";

import { useTranslation } from "react-i18next";
import { ArrowLeft2 } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useSession } from "@/lib/auth";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { TourPackageResponse } from "@/lib/api/packages";
import { PackageForm } from "./PackageForm";

type Props = {
  destinations: DestinationResponse[];
  presetDestination?: DestinationResponse;
};

export function NewPackagePage({ destinations, presetDestination }: Props) {
  const { t } = useTranslation();
  const { user } = useSession();
  const router = useLocalizedRouter();

  const handleCreated = (_pkg: TourPackageResponse) => {
    router.push("/agency/tours");
  };

  const handleCancel = () => {
    router.push("/agency/tours");
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

          <div className="min-w-0">
            <p className="text-muted text-xs font-medium uppercase tracking-widest">
              {t("tours.packages.pageTitle")}
            </p>
            <h1 className="text-foreground truncate text-base font-semibold">
              {t("tours.packages.newPage.title")}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 px-4 py-8 sm:px-6">
        <PackageForm
          destinations={destinations}
          agencyName={user?.name ?? ""}
          presetDestination={presetDestination}
          onCreated={handleCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
