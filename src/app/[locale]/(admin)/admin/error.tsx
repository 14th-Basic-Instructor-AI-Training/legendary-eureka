"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Danger } from "iconsax-reactjs";
import { Button } from "@/ui";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminOverviewError({ error, reset }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("[admin/overview]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div
        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--bg-red)", color: "var(--red)" }}
      >
        <Danger size={32} variant="Bold" />
      </div>

      <div className="max-w-sm">
        <h2 className="text-primary mb-2 text-xl font-bold">{t("admin.dashboard.error")}</h2>
        <p className="text-muted text-sm">{error.message}</p>
      </div>

      <Button variant="primary" onPress={reset}>
        {t("common.retry")}
      </Button>
    </div>
  );
}
