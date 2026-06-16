"use client";

import { useTranslation } from "react-i18next";
import { Warning2 } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";

/**
 * Shown when a non-admin user tries to enter their workspace/dashboard while the
 * platform is in maintenance mode. The backend rejects their data requests with
 * 503, so instead of dropping them into an empty, broken area we explain why.
 */
export function MaintenanceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-warning">
                <Warning2 size={20} color="currentColor" variant="Bold" />
              </Modal.Icon>
              <Modal.Heading>{t("landing.maintenance.title")}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">
                {t("landing.maintenance.body")}
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="primary" onPress={onClose}>
                {t("landing.maintenance.gotIt")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
