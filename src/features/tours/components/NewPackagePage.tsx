"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft2, TickCircle } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useSession } from "@/lib/auth";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { TourPackageResponse } from "@/lib/api/packages";
import { PackageForm } from "./PackageForm";
import { AgendaBuilder, clearAgenda, type AgendaActivity } from "./AgendaBuilder";
import type { TourAgendaItemResponse } from "@/lib/api/packages";

const CREATED_PKG_KEY = "pkg-created";

function readCreatedPkg(): TourPackageResponse | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CREATED_PKG_KEY) : null;
    return raw ? (JSON.parse(raw) as TourPackageResponse) : null;
  } catch {
    return null;
  }
}

function saveCreatedPkg(pkg: TourPackageResponse) {
  try { localStorage.setItem(CREATED_PKG_KEY, JSON.stringify(pkg)); } catch { /* ignore */ }
}

function clearCreatedPkg() {
  try { localStorage.removeItem(CREATED_PKG_KEY); } catch { /* ignore */ }
}

type Props = {
  destinations: DestinationResponse[];
  presetDestination?: DestinationResponse;
  activities: AgendaActivity[];
};

/**
 * Two-stage wizard for creating a tour package:
 *  Stage 1 — Package details (identity, logistics, story)
 *  Stage 2 — Build the day-by-day itinerary (shown after the package is saved)
 *
 * The backend requires a package ID before agenda items can be added, so the
 * creation form and the agenda builder are sequential on the same page — no
 * redirect needed. The agency can finish at any point; the draft is always saved.
 */
export function NewPackagePage({ destinations, presetDestination, activities }: Props) {
  const { t } = useTranslation();
  const { user } = useSession();
  const router = useLocalizedRouter();

  // Restore the created package from localStorage so reloads land on Stage 2
  const [createdPkg, setCreatedPkg] = useState<TourPackageResponse | null>(() => readCreatedPkg());

  const handleCreated = (pkg: TourPackageResponse) => {
    saveCreatedPkg(pkg);
    setCreatedPkg(pkg);
    // Scroll smoothly to the agenda section that just appeared
    setTimeout(() => {
      document.getElementById("agenda-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancel = () => {
    if (createdPkg) clearAgenda(createdPkg.id);
    clearCreatedPkg();
    router.push("/agency/tours");
  };

  const handleFinish = () => {
    if (createdPkg) clearAgenda(createdPkg.id);
    clearCreatedPkg();
    router.push(createdPkg ? `/agency/tours/${createdPkg.id}` : "/agency/tours");
  };

  const handleAgendaChange = (agenda: TourAgendaItemResponse[]) => {
    if (!createdPkg) return;
    const updated = { ...createdPkg, agenda };
    saveCreatedPkg(updated);
    setCreatedPkg(updated);
  };

  const stage = createdPkg ? 2 : 1;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Page header strip ── */}
      <div className="border-border bg-surface border-b px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Button
            variant="tertiary"
            size="sm"
            onPress={stage === 1 ? handleCancel : handleFinish}
            aria-label={t("common.back")}
            className="shrink-0"
          >
            <ArrowLeft2 size={18} color="currentColor" />
            <span className="text-sm">{t("common.back")}</span>
          </Button>

          <div className="h-5 w-px bg-current opacity-10" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <p className="text-muted text-xs font-medium uppercase tracking-widest">
              {t("tours.packages.pageTitle")}
            </p>
            <h1 className="text-foreground truncate text-base font-semibold">
              {t("tours.packages.newPage.title")}
            </h1>
          </div>

          {/* Step indicator */}
          <div className="hidden items-center gap-2 sm:flex">
            <StepPip
              num={1}
              label={t("tours.packages.newPage.step1")}
              done={stage > 1}
              active={stage === 1}
            />
            <div className="bg-border h-px w-5" aria-hidden="true" />
            <StepPip
              num={2}
              label={t("tours.packages.newPage.step2")}
              done={false}
              active={stage === 2}
            />
          </div>
        </div>
      </div>

      {/* ── Form content ── */}
      <div className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">

          {/* Stage 1: Package details */}
          {stage === 1 && (
            <PackageForm
              destinations={destinations}
              agencyName={user?.name ?? ""}
              presetDestination={presetDestination}
              onCreated={handleCreated}
              onCancel={handleCancel}
            />
          )}

          {/* Stage 2: Package created → build agenda */}
          {stage === 2 && createdPkg && (
            <>
              {/* Success banner */}
              <div className="bg-green/10 border-green/30 flex items-center gap-3 rounded-2xl border px-4 py-3">
                <TickCircle
                  size={20}
                  color="currentColor"
                  variant="Bold"
                  className="text-green shrink-0"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {t("tours.packages.newPage.createdTitle")}
                  </p>
                  <p className="text-muted text-xs">
                    {t("tours.packages.newPage.createdHint")}
                  </p>
                </div>
              </div>

              {/* Agenda builder */}
              <div id="agenda-section">
                <AgendaBuilder
                  tourId={createdPkg.id}
                  initialAgenda={createdPkg.agenda ?? []}
                  durationDays={createdPkg.durationDays || createdPkg.days || 1}
                  activities={activities}
                  onAgendaChange={handleAgendaChange}
                />
              </div>

              {/* Bottom actions */}
              <div className="bg-surface border-border shadow-primary sticky bottom-0 -mx-4 rounded-t-2xl border-t px-4 py-4 sm:-mx-6 sm:px-6">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                  <p className="text-muted hidden text-xs sm:block">
                    {t("tours.packages.form.draftNotice")}
                  </p>
                  <div className="ml-auto flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onPress={handleFinish}>
                      {t("tours.packages.newPage.viewPackage")}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepPip({
  num,
  label,
  done,
  active,
}: {
  num: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          done
            ? "bg-green text-white"
            : active
              ? "bg-primary text-white"
              : "bg-muted/20 text-muted"
        }`}
      >
        {done ? <TickCircle size={14} color="currentColor" variant="Bold" /> : num}
      </span>
      <span
        className={`text-xs font-medium transition-colors ${
          active ? "text-foreground" : done ? "text-green" : "text-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
