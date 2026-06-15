"use client";

import { useTranslation } from "react-i18next";
import { DatePicker } from "@/ui";

/**
 * Dual date picker for the tour availability window. Composes two `@/ui`
 * DatePickers (ISO `YYYY-MM-DD` strings); the "to" field can't precede "from".
 */
export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string | undefined;
  to: string | undefined;
  onChange: (patch: { dateFrom?: string; dateTo?: string }) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <DatePicker
        label={t("explore.filters.dateFrom")}
        value={from ?? ""}
        onChange={(value) => onChange({ dateFrom: value || undefined })}
      />
      <DatePicker
        label={t("explore.filters.dateTo")}
        value={to ?? ""}
        min={from}
        onChange={(value) => onChange({ dateTo: value || undefined })}
      />
    </div>
  );
}
