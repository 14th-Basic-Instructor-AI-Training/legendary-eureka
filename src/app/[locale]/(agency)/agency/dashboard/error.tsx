"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Danger } from "iconsax-reactjs";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("[agency/dashboard]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-8 py-16 text-center">
      <div
        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--bg-red)", color: "var(--red)" }}
      >
        <Danger size={32} variant="Bold" />
      </div>

      <div className="max-w-sm">
        <h2
          className="mb-2 text-xl font-bold"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {t("agency.dashboard.errorTitle", { defaultValue: "Dashboard failed to load" })}
        </h2>
        <p className="text-muted text-sm">
          {error.message || t("common.error", { defaultValue: "Something went wrong." })}
        </p>
      </div>

      <button
        onClick={reset}
        className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-75"
        style={{ backgroundColor: "var(--primary-lightskyblue)" }}
      >
        {t("common.retry", { defaultValue: "Try again" })}
      </button>
    </div>
  );
}
