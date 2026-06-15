"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle } from "iconsax-reactjs";
import type { TourDetail } from "../types";

/** Overview tab: description, highlights, and included / excluded columns. */
export function OverviewTab({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-foreground text-lg font-bold tracking-tight">
          {t("tours.detail.overview.about")}
        </h2>
        {/* Description is plain prose today; renders rich text once authoring lands. */}
        <p className="text-muted mt-3 text-base leading-relaxed whitespace-pre-line">
          {tour.description}
        </p>
      </section>

      {tour.highlights.length > 0 ? (
        <section>
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            {t("tours.detail.overview.highlights")}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {tour.highlights.map((item) => (
              <li key={item} className="text-foreground flex items-start gap-2 text-sm">
                <TickCircle
                  size={18}
                  color="currentColor"
                  variant="Bold"
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tour.included.length > 0 || tour.excluded.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2">
          {tour.included.length > 0 ? (
            <div>
              <h3 className="text-foreground text-base font-semibold">
                {t("tours.detail.overview.included")}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {tour.included.map((item) => (
                  <li key={item} className="text-muted flex items-start gap-2 text-sm">
                    <TickCircle
                      size={18}
                      color="currentColor"
                      variant="Bold"
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tour.excluded.length > 0 ? (
            <div>
              <h3 className="text-foreground text-base font-semibold">
                {t("tours.detail.overview.excluded")}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {tour.excluded.map((item) => (
                  <li key={item} className="text-muted flex items-start gap-2 text-sm">
                    <CloseCircle
                      size={18}
                      color="currentColor"
                      variant="Bold"
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
