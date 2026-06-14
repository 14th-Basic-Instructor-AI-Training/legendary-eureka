"use client";

import { useTranslation } from "react-i18next";
import { ArrowRight2 } from "iconsax-reactjs";

/** The two domain flows, rendered as labelled step chips. */
const FLOWS: { titleKey: string; steps: string[] }[] = [
  {
    titleKey: "tours.flow.adminTitle",
    steps: [
      "tours.flow.steps.adminCreates",
      "tours.flow.steps.agencySelects",
      "tours.flow.steps.buildPackage",
      "tours.flow.steps.requestApproval",
    ],
  },
  {
    titleKey: "tours.flow.agencyTitle",
    steps: [
      "tours.flow.steps.agencyCreatesOwn",
      "tours.flow.steps.buildPackage",
      "tours.flow.steps.requestApproval",
    ],
  },
];

/** Compact reference of how the destination → package → approval flow works. */
export function FlowGuide() {
  const { t } = useTranslation();

  return (
    <section className="bg-surface shadow-primary flex flex-col gap-4 rounded-2xl p-5">
      <h2 className="text-primary text-sm font-semibold tracking-tight">
        {t("tours.flow.title")}
      </h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        {FLOWS.map((flow) => (
          <div key={flow.titleKey} className="min-w-0 flex-1">
            <p className="text-muted mb-2 text-xs font-medium uppercase tracking-wide">
              {t(flow.titleKey)}
            </p>
            <ol className="flex flex-wrap items-center gap-1.5">
              {flow.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-1.5">
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                    <span className="bg-primary/20 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {t(step)}
                  </span>
                  {i < flow.steps.length - 1 ? (
                    <ArrowRight2 size={14} color="currentColor" className="text-muted" />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
