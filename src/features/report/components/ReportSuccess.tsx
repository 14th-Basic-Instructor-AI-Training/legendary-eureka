"use client";

import { useTranslation } from "react-i18next";
import { ShieldTick } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";

/** Confirmation shown after a report is submitted. */
export function ReportSuccess() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-8 text-center">
      <span className="bg-primary-lightskyblue/15 mb-5 flex h-20 w-20 items-center justify-center rounded-full">
        <span className="bg-primary-lightskyblue flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldTick size={30} color="#ffffff" variant="Bold" />
        </span>
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {t("report.success.title")}
      </h1>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        {t("report.success.body")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="primary" onPress={() => router.push("/explore")}>
          {t("report.success.explore")}
        </Button>
        <Button variant="secondary" onPress={() => router.push("/")}>
          {t("report.success.home")}
        </Button>
      </div>
    </div>
  );
}
