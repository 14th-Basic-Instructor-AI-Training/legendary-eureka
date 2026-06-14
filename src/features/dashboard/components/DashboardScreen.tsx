"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/ui";
import { useSession } from "@/lib/auth";
import type { Role } from "@/features/auth/schema";
import { DASHBOARDS } from "../config";

/** Role-specific dashboard body — distinct title, accent, and cards per role. */
export function DashboardScreen({ role }: { role: Role }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const config = DASHBOARDS[role];

  if (!config) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-8">
        <p className="text-muted text-sm">
          {t("dashboard.greeting", { name: user?.name ?? "" })}
        </p>
        <h1 className="text-primary mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          {t(`dashboard.${role}.title`)}
        </h1>
        <p className="text-muted mt-1.5 max-w-2xl">{t(`dashboard.${role}.subtitle`)}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.cards.map(({ key, Icon, stat }) => (
          <Card key={key} variant="default" className="bg-surface rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${config.accentBg} ${config.accentText}`}
              >
                <Icon size={22} color="currentColor" variant="Bold" />
              </span>
              <span className="text-2xl font-semibold tabular-nums">{stat}</span>
            </div>
            <Card.Header className="mt-4">
              <Card.Title>{t(`dashboard.${role}.cards.${key}.title`)}</Card.Title>
              <Card.Description>
                {t(`dashboard.${role}.cards.${key}.desc`)}
              </Card.Description>
            </Card.Header>
          </Card>
        ))}
      </div>
    </div>
  );
}
