"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { InfoCircle } from "iconsax-reactjs";
import { useLocalizedRouter } from "@/lib/locale";
import { cn } from "@/lib/utils";

/** Outer concave fillet that blends the active tab's base down into the panel. */
const FILLET = "radial-gradient(circle 14px at top SIDE, transparent 13px, var(--color-bg-dashboard) 14px)";
import { PackagesAdmin } from "./PackagesAdmin";
import { AdminDestinationsManager } from "@/features/tours/components/AdminDestinationsManager";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { TourPackageResponse } from "@/lib/api/packages";

type ContentTab = "destinations" | "packages";

export function ContentPage({
  destinations,
  packages,
  loadError = false,
}: {
  destinations: DestinationResponse[];
  packages: TourPackageResponse[];
  loadError?: boolean;
}) {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab: ContentTab = params.get("tab") === "packages" ? "packages" : "destinations";
  const router = useLocalizedRouter();

  const tabs: Array<{ id: ContentTab; label: string }> = [
    { id: "destinations", label: t("tours.nav.destinations") },
    { id: "packages", label: t("admin.content.tabs.packages") },
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-full flex-col gap-6">
      <header className="shrink-0">
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          {t("admin.nav.content")}
        </h1>
        <p className="text-muted mt-1">{t("admin.pages.content.subtitle")}</p>
      </header>

      {loadError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
          <InfoCircle size={28} color="currentColor" className="text-muted" />
          <p className="text-muted text-sm">{t("admin.content.error")}</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Folder-tab header — the active tab's notch slides between tabs and
              connects seamlessly into the panel below (same bg-dashboard fill). */}
          <div
            role="tablist"
            aria-label={t("admin.nav.content")}
            className="relative z-10 flex shrink-0 justify-center gap-1"
          >
            {tabs.map((tt) => {
              const active = tab === tt.id;
              return (
                <button
                  key={tt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => router.replace(`/admin/content?tab=${tt.id}`)}
                  className="relative px-8 pt-3 pb-4 cursor-pointer text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-2xl"
                >
                  {active ? (
                    <motion.span
                      layoutId="contentTabNotch"
                      aria-hidden="true"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="bg-bg-dashboard absolute inset-0 -z-10 rounded-t-2xl"
                    >
                      {/* Outer concave fillets — the curve flows from the tab side
                          down into the panel, instead of biting into the tab. */}
                      <motion.span
                        layout
                        className="absolute bottom-0 left-0 h-[14px] w-[14px] -translate-x-full"
                        style={{ background: FILLET.replace("SIDE", "left") }}
                      />
                      <motion.span
                        layout
                        className="absolute bottom-0 right-0 h-[14px] w-[14px] translate-x-full"
                        style={{ background: FILLET.replace("SIDE", "right") }}
                      />
                    </motion.span>
                  ) : null}
                  <span
                    className={cn(
                      "relative transition-colors",
                      active ? "text-primary" : "text-muted hover:text-foreground",
                    )}
                  >
                    {tt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel — replaces the dark background from the reference with bg-dashboard. */}
          <div className="bg-bg-dashboard flex min-h-0 flex-1 flex-col rounded-t-3xl rounded-b-2xl p-5 sm:p-6">
            {tab === "destinations" ? (
              <AdminDestinationsManager destinations={destinations} />
            ) : (
              <PackagesAdmin packages={packages} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
