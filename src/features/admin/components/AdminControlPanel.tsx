"use client";

import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import type { AdminDashboardResponse } from "@/lib/api/admin";

export function AdminControlPanel({ dashboard }: { dashboard: AdminDashboardResponse }) {
  const { t } = useTranslation();
  const { user } = useSession();

  return (
    <div className="mx-auto flex max-w-full flex-col gap-6">
      <header>
        <h1 className="text-primary text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
        <p className="text-muted mt-1">
          {user ? t("dashboard.greeting", { name: user.name }) : t("admin.subtitle")}
        </p>
      </header>

      <AdminDashboard data={dashboard} />
    </div>
  );
}
