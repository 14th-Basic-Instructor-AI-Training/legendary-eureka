"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAuthStore } from "@/features/auth/store";
import { useLocalizedRouter } from "@/lib/locale";
import { useTravelerStore } from "../store";
import { ConfirmDialog } from "./ConfirmDialog";

/** Settings → danger zone: irreversible account deletion (confirmation required). */
export function DangerZone() {
  const { t } = useTranslation();
  const { role } = useSession();
  const router = useLocalizedRouter();
  const deleteAccount = useTravelerStore((s) => s.deleteAccount);
  const signOut = useAuthStore((s) => s.signOut);
  const [confirming, setConfirming] = useState(false);

  const onConfirm = () => {
    const ok = deleteAccount(role);
    setConfirming(false);
    if (ok) {
      signOut();
      router.replace("/login");
    }
  };

  return (
    <div className="border-danger/30 bg-danger/5 flex flex-col gap-3 rounded-2xl border p-5">
      <div>
        <h3 className="text-danger font-semibold">{t("settings.danger.title")}</h3>
        <p className="text-muted mt-0.5 text-sm">{t("settings.danger.description")}</p>
      </div>
      <div>
        <Button
          variant="primary"
          size="sm"
          className="bg-danger hover:bg-danger/90"
          onPress={() => setConfirming(true)}
        >
          <Trash size={16} color="currentColor" />
          {t("settings.danger.deleteAccount")}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onConfirm}
        title={t("settings.danger.confirm.title")}
        description={t("settings.danger.confirm.description")}
        confirmLabel={t("settings.danger.confirm.confirm")}
      />
    </div>
  );
}
